import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import axios from 'axios'
import { ArrowRight, Bus, CalendarDays, CarFront, ExternalLink, Hotel, Plane, TrainFront, Users, Wallet } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Container } from '../../components/ui/Container'
import { TripRouteMap } from '../../components/map/TripRouteMap'
import { placesService, type Place } from '../../services/placesService'
import { tripService, type Trip, type TripRoute, type TripTransport } from '../../services/tripService'
import { expenseService, type TripExpenseData } from '../../services/expenseService'

type Mode = TripTransport
const modes: Array<{ value: Mode; label: string; Icon: typeof Bus }> = [
  { value: 'bus', label: 'Bus', Icon: Bus }, { value: 'train', label: 'Train', Icon: TrainFront },
  { value: 'flight', label: 'Flight', Icon: Plane }, { value: 'car', label: 'Car', Icon: CarFront },
]
const localToday = new Date()
const today = `${localToday.getFullYear()}-${String(localToday.getMonth() + 1).padStart(2, '0')}-${String(localToday.getDate()).padStart(2, '0')}`
const inputClass = 'mt-2 min-h-11 w-full rounded-xl border border-white/[0.09] bg-[#070d19] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/40'
const bookingSites: Record<Mode, { name: string; url: string; hint: string }> = {
  bus: { name: 'redBus', url: 'https://www.redbus.in/', hint: 'Search bus routes on redBus' },
  train: { name: 'IRCTC', url: 'https://www.irctc.co.in/nget/train-search', hint: 'Search trains on the official IRCTC portal' },
  flight: { name: 'Google Flights', url: 'https://www.google.com/travel/flights', hint: 'Compare flights on Google Flights' },
  car: { name: 'Google Maps', url: 'https://www.google.com/maps/dir/', hint: 'Open driving directions in Google Maps' },
}

function dateValue(value: string) { return value ? value.slice(0, 10) : '' }
function bookingUrl(mode: Mode, origin: string, destination: string, date: string) {
  if (mode === 'car') {
    const url = new URL(bookingSites.car.url)
    url.searchParams.set('api', '1'); url.searchParams.set('origin', origin); url.searchParams.set('destination', destination); url.searchParams.set('travelmode', 'driving')
    return url.toString()
  }
  if (mode === 'flight') {
    const url = new URL(bookingSites.flight.url)
    url.searchParams.set('q', `Flights from ${origin} to ${destination} on ${date}`)
    return url.toString()
  }
  if (mode === 'bus') {
    return bookingSites.bus.url
  }
  return bookingSites.train.url
}

export function TransportBookingPage() {
  const [searchParams] = useSearchParams()
  const requestedTripId = searchParams.get('tripId')
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(true)
  const [tripsError, setTripsError] = useState('')
  const [selectedTripId, setSelectedTripId] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [travelers, setTravelers] = useState('1')
  const [mode, setMode] = useState<Mode>('bus')
  const [formError, setFormError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [route, setRoute] = useState<Extract<TripRoute, { supported: true }> | null>(null)
  const [routeError, setRouteError] = useState('')
  const [hotels, setHotels] = useState<Place[]>([])
  const [hotelError, setHotelError] = useState('')
  const [hotelLoading, setHotelLoading] = useState(false)
  const [expense, setExpense] = useState<TripExpenseData | null>(null)
  const [expenseError, setExpenseError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedTrip = useMemo(() => trips.find((trip) => trip._id === selectedTripId) ?? null, [trips, selectedTripId])
  const chooseTrip = useCallback((tripId: string, availableTrips: Trip[]) => {
    setSubmitted(false)
    setSelectedTripId(tripId)
    const trip = availableTrips.find((item) => item._id === tripId)
    if (!trip) { setExpense(null); setExpenseError(''); return }
    setOrigin(trip.origin); setDestination(trip.destination); setDate(dateValue(trip.startDate))
    setTravelers(String(trip.travelers)); setMode(trip.transport)
    void expenseService.get(trip._id).then((value) => { setExpense(value); setExpenseError('') }).catch(() => { setExpense(null); setExpenseError('Saved expense totals are unavailable right now.') })
  }, [])

  useEffect(() => {
    let active = true
    setTripsLoading(true)
    tripService.getTrips().then((items) => {
      if (!active) return
      setTrips(items); setTripsError('')
      if (requestedTripId && items.some((item) => item._id === requestedTripId)) chooseTrip(requestedTripId, items)
    }).catch(() => { if (active) setTripsError('Your saved trips could not be loaded. You can still enter a journey manually.') })
      .finally(() => { if (active) setTripsLoading(false) })
    return () => { active = false }
  }, [requestedTripId, chooseTrip])

  const updateLocation = (setter: (value: string) => void) => (value: string) => { setSubmitted(false); setSelectedTripId(''); setExpense(null); setter(value) }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFormError('')
    if (!origin.trim() || !destination.trim()) { setFormError('Enter both an origin and destination.'); return }
    if (origin.trim().toLocaleLowerCase() === destination.trim().toLocaleLowerCase()) { setFormError('Origin and destination must be different.'); return }
    if (!date || Number.isNaN(Date.parse(`${date}T00:00:00`))) { setFormError('Choose a valid travel date.'); return }
    if (date < today) { setFormError('Travel date must be today or later.'); return }
    const count = Number(travelers)
    if (!Number.isInteger(count) || count < 1 || count > 30) { setFormError('Travelers must be a whole number from 1 to 30.'); return }

    setSubmitted(true); setLoading(true); setRoute(null); setRouteError(''); setHotels([]); setHotelError(''); setHotelLoading(true)
    const tasks: Promise<void>[] = [placesService.getNearbyPlaces({ category: 'hotel', location: destination.trim(), radius: 10000, limit: 8 })
      .then((response) => setHotels(response.places))
      .catch((cause: unknown) => setHotelError(axios.isAxiosError(cause) && typeof cause.response?.data?.message === 'string' ? cause.response.data.message : 'Hotel discovery is unavailable. Continue with the external hotel search below.'))
      .finally(() => setHotelLoading(false))]
    if (mode === 'car') tasks.push(tripService.previewDrivingRoute(origin.trim(), destination.trim())
      .then((value) => { if (value.supported) setRoute(value); else setRouteError(value.message) })
      .catch((cause: unknown) => setRouteError(axios.isAxiosError(cause) && typeof cause.response?.data?.message === 'string' ? cause.response.data.message : 'A Mapbox driving route is unavailable. You can still open directions in Google Maps.')))
    else setRouteError('Verified public-transport timetables and live fares are not connected. Check the linked provider for current information.')
    await Promise.all(tasks)
    setLoading(false)
  }

  const site = bookingSites[mode]
  const providerUrl = bookingUrl(mode, origin.trim(), destination.trim(), date)
  const hotelUrl = new URL('https://www.booking.com/searchresults.html')
  hotelUrl.searchParams.set('ss', destination.trim())
  if (date) { hotelUrl.searchParams.set('checkin', date); const nextDate = new Date(`${date}T00:00:00`); nextDate.setDate(nextDate.getDate() + 1); hotelUrl.searchParams.set('checkout', nextDate.toISOString().slice(0, 10)) }
  hotelUrl.searchParams.set('group_adults', String(Math.max(1, Number(travelers) || 1)))

  return <Container className="py-10 sm:py-14"><div className="mx-auto max-w-7xl">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">Transport and booking</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Plan your way there</h1>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Compare what TravelMate can verify with trusted external search options. Schedules, fares, seats, and reservations are checked only with booking providers.</p>

    <section className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-7">
      <div className="mb-5"><h2 className="text-xl font-semibold text-white">Journey details</h2><p className="mt-1 text-sm text-slate-400">Choose a saved trip to prefill details, or enter them yourself.</p></div>
      <label className="block max-w-xl text-xs font-medium text-slate-400">Use a saved trip<select value={selectedTripId} disabled={tripsLoading} onChange={(event) => chooseTrip(event.target.value, trips)} className={inputClass}><option value="">Enter a journey manually</option>{trips.map((trip) => <option key={trip._id} value={trip._id}>{trip.title} · {trip.origin} to {trip.destination}</option>)}</select></label>
      {tripsError && <p className="mt-2 text-sm text-amber-200">{tripsError}</p>}
      <form onSubmit={submit} className="mt-5 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-slate-400">Origin<input required maxLength={120} value={origin} onChange={(event) => updateLocation(setOrigin)(event.target.value)} placeholder="City or station" className={inputClass}/></label><label className="text-xs font-medium text-slate-400">Destination<input required maxLength={120} value={destination} onChange={(event) => updateLocation(setDestination)(event.target.value)} placeholder="City or station" className={inputClass}/></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-slate-400"><span className="inline-flex items-center gap-2"><CalendarDays size={14}/>Travel date</span><input required type="date" min={today} value={date} onChange={(event) => { setSubmitted(false); setDate(event.target.value); setSelectedTripId(''); setExpense(null) }} className={inputClass}/></label><label className="text-xs font-medium text-slate-400"><span className="inline-flex items-center gap-2"><Users size={14}/>Travelers</span><input required type="number" min={1} max={30} step={1} value={travelers} onChange={(event) => { setSubmitted(false); setTravelers(event.target.value); setSelectedTripId(''); setExpense(null) }} className={inputClass}/></label></div>
        <fieldset><legend className="mb-2 text-xs font-medium text-slate-400">Preferred transport</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{modes.map(({ value, label, Icon }) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setSubmitted(false); setMode(value) }} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border text-sm transition ${mode === value ? 'border-cyan-200/35 bg-cyan-200/[0.08] text-cyan-100' : 'border-white/[0.08] bg-[#070d19] text-slate-400 hover:text-white'}`}><Icon size={17}/>{label}</button>)}</div></fieldset>
        {formError && <p role="alert" className="text-sm text-rose-200">{formError}</p>}
        <button type="submit" disabled={loading} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60 sm:w-auto">{loading ? 'Checking route and hotels…' : 'Compare transport options'}<ArrowRight size={16}/></button>
      </form>
    </section>

    {submitted && <div className="mt-6 grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-cyan-200/[0.08] text-cyan-100"><CarFront size={19}/></span><div><h2 className="font-semibold text-white">{mode[0]!.toUpperCase() + mode.slice(1)} journey</h2><p className="mt-1 text-sm text-slate-300">{origin} → {destination} · {date} · {travelers} {Number(travelers) === 1 ? 'traveler' : 'travelers'}</p></div></div>
        {mode === 'car' ? route ? <><div className="mt-4 grid grid-cols-2 gap-3"><Metric label="Mapbox road distance" value={`${route.distanceKm.toFixed(1)} km`}/><Metric label="Estimated driving time" value={`${Math.round(route.durationMinutes)} min`}/></div><p className="mt-3 text-xs text-slate-500">Route distance and duration from Mapbox directions. Traffic and stops may change actual travel time.</p><div className="mt-4"><TripRouteMap route={route}/></div></> : <p role={routeError ? 'alert' : 'status'} className="mt-4 rounded-xl border border-white/[0.07] bg-[#070d19] p-4 text-sm leading-6 text-slate-400">{routeError || 'Loading Mapbox driving route…'}</p> : <p className="mt-4 rounded-xl border border-white/[0.07] bg-[#070d19] p-4 text-sm leading-6 text-slate-400">Live schedules, journey times, fares, and seat availability are not available in TravelMate. Check current details directly with the booking provider.</p>}
        <a href={providerUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-200/20 px-4 text-sm font-medium text-cyan-100 hover:bg-cyan-200/[0.05]">{site.hint}<ExternalLink size={14}/></a><p className="mt-2 text-xs text-slate-500">Opens {site.name}. No booking or payment is made in TravelMate.</p>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-6"><h2 className="flex items-center gap-2 font-semibold text-white"><Hotel size={18} className="text-cyan-200"/>Hotels near {destination}</h2><p className="mt-1 text-sm text-slate-400">Google Places discovery; live rates and room availability are not supplied.</p>
        {hotelLoading && <p role="status" className="mt-4 text-sm text-slate-400">Finding nearby hotels…</p>}{hotelError && <p role="alert" className="mt-4 rounded-xl border border-rose-300/15 bg-rose-300/[0.04] p-3 text-sm text-rose-200">{hotelError}</p>}{!hotelLoading && !hotelError && hotels.length === 0 && <p className="mt-4 rounded-xl bg-[#070d19] p-4 text-sm text-slate-400">{hotels.length === 0 ? 'No nearby hotel results to show. You can continue to an external hotel search.' : ''}</p>}
        {hotels.length > 0 && <div className="mt-4 max-h-[390px] space-y-2 overflow-y-auto">{hotels.map((hotel) => <HotelResult key={hotel.id} hotel={hotel}/>)}</div>}
        <a href={hotelUrl.toString()} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-200/20 px-4 text-sm font-medium text-cyan-100 hover:bg-cyan-200/[0.05]">Search hotels on Booking.com<ExternalLink size={14}/></a>
      </section>
    </div>}

    {selectedTrip && <section className="mt-5 rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-6"><h2 className="flex items-center gap-2 font-semibold text-white"><Wallet size={18} className="text-cyan-200"/>Trip budget snapshot</h2><p className="mt-1 text-sm text-slate-400">Saved budget and expenses for {selectedTrip.title}. This page does not change your expense breakdown.</p>{expenseError ? <p role="alert" className="mt-3 text-sm text-amber-200">{expenseError}</p> : expense ? <div className="mt-4 grid gap-3 sm:grid-cols-3"><Metric label="Trip budget" value={money(expense.summary.budget, expense.summary.currency)}/><Metric label="Saved expenses" value={money(expense.summary.total, expense.summary.currency)}/><Metric label="Remaining" value={money(expense.summary.remainingBudget, expense.summary.currency)}/></div> : <p role="status" className="mt-3 text-sm text-slate-400">Loading saved expense totals…</p>}<Link to={`/trips/${selectedTrip._id}/expenses`} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200 hover:bg-white/[0.05]">Open Expense Calculator<ArrowRight size={14}/></Link></section>}

    <p className="mt-5 text-xs leading-5 text-slate-500">Provider pages show current booking information and terms. TravelMate does not sell tickets, confirm reservations, or provide live booking prices.</p>
  </div></Container>
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/[0.07] bg-[#070d19] p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-white">{value}</p></div> }
function money(value: number, currency: string) { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value) } catch { return `${currency} ${value.toLocaleString()}` } }
function HotelResult({ hotel }: { hotel: Place }) {
  return <article className="rounded-xl border border-white/[0.07] bg-[#070d19] p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-medium text-white">{hotel.name}</h3>{hotel.address && <p className="mt-1 text-xs leading-5 text-slate-400">{hotel.address}</p>}</div>{hotel.rating !== null && <span className="shrink-0 text-xs text-amber-200">★ {hotel.rating.toFixed(1)}{hotel.userRatingCount !== null ? ` · ${hotel.userRatingCount.toLocaleString()}` : ''}</span>}</div>{hotel.googleMapsUri && <a href={hotel.googleMapsUri} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan-200 hover:text-white">View place details <ExternalLink size={12}/></a>}<p className="mt-2 text-[10px] text-slate-500">Google Places</p></article>
}
