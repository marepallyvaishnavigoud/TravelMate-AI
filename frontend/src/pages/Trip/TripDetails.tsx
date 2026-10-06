import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowLeft, CalendarDays, CarFront, Check, Clock3, Compass, MapPin, Plane, Sparkles, TrainFront, Trash2, Users, Utensils, Wallet, CloudSun, Hotel, Activity } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Container } from '../../components/ui/Container'
import { TripForm } from '../../components/trip/TripForm'
import { authErrorMessage } from '../../services/authService'
import { tripService, type Trip, type TripInput, type TripRoute } from '../../services/tripService'
import { TripRouteMap } from '../../components/map/TripRouteMap'

const transportIcons = { car: CarFront, bus: Activity, train: TrainFront, flight: Plane }
const upcomingModules = [
  { title: 'Hotels', description: 'Stay discovery is coming in a future update.', Icon: Hotel },
  { title: 'Restaurants', description: 'Local dining recommendations are coming later.', Icon: Utensils },
  { title: 'Activities', description: 'Activity planning will be available in a future update.', Icon: Activity },
  { title: 'Expenses', description: 'Trip expense tracking is coming soon.', Icon: Wallet },
  { title: 'AI Itinerary', description: 'Personalized AI itinerary planning is not available yet.', Icon: Sparkles },
  { title: 'Weather', description: 'Destination weather will be added in a future update.', Icon: CloudSun },
]

export function TripDetails() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [route, setRoute] = useState<TripRoute | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { setTrip(await tripService.getTripById(id)) } catch (cause) { setError(authErrorMessage(cause)) } finally { setLoading(false) } }, [id])
  useEffect(() => { void load() }, [load])
  const loadRoute = useCallback(async () => { setRouteLoading(true); setRouteError(''); setRoute(null); try { setRoute(await tripService.getTripRoute(id)) } catch (cause) { let message = 'Unable to calculate the route right now.'; if (import.meta.env.DEV) { if (axios.isAxiosError(cause)) { const apiMessage = cause.response?.data?.message; console.warn('[TripDetails] Route request failed.', { status: cause.response?.status, message: apiMessage }); if (cause.response?.status === 503 && typeof apiMessage === 'string' && apiMessage.includes('not configured')) message = 'Map routing is not configured. Add MAPBOX_ACCESS_TOKEN to backend/.env and restart the backend.' } else console.warn('[TripDetails] Route request failed.', { errorName: cause instanceof Error ? cause.name : 'UnknownError' }) }; setRouteError(message) } finally { setRouteLoading(false) } }, [id])
  useEffect(() => { if (trip) void loadRoute() }, [trip, loadRoute])
  const update = async (input: TripInput) => { const updated = await tripService.updateTrip(id, input); setTrip(updated); setEditing(false) }
  const remove = async () => { setDeleting(true); setDeleteError(''); try { await tripService.deleteTrip(id); navigate('/my-trips', { replace: true }) } catch (cause) { setDeleteError(authErrorMessage(cause)); setDeleting(false) } }
  const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
  const details = trip && [
    { label: 'Departure', value: formatDate(trip.startDate), Icon: CalendarDays }, { label: 'Return', value: formatDate(trip.endDate), Icon: CalendarDays },
    { label: 'Travelers', value: `${trip.travelers} ${trip.travelers === 1 ? 'traveler' : 'travelers'}`, Icon: Users },
    { label: 'Planned budget', value: new Intl.NumberFormat(undefined, { style: 'currency', currency: trip.currency, maximumFractionDigits: 0 }).format(trip.budget), Icon: Wallet },
    { label: 'Transport', value: trip.transport[0].toUpperCase() + trip.transport.slice(1), Icon: transportIcons[trip.transport] },
    { label: 'Status', value: trip.status[0].toUpperCase() + trip.status.slice(1), Icon: Clock3 },
  ]
  return <Container className="py-8 sm:py-12"><div className="mx-auto max-w-6xl">
    <Link to="/my-trips" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={15}/>Back to My Trips</Link>
    {loading ? <div role="status" className="grid min-h-[50vh] place-items-center text-sm text-slate-400">Loading trip…</div> : error || !trip ? <section role="alert" className="mx-auto mt-10 max-w-xl rounded-2xl border border-rose-300/15 bg-[#0B1120] p-7 text-center"><h1 className="text-xl font-semibold text-white">We couldn’t load this trip</h1><p className="mt-2 text-sm text-slate-400">{error || 'Trip not found.'}</p><button onClick={() => void load()} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white"><Clock3 size={15}/>Try again</button></section> : editing ? <div className="mt-7"><div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">Update your plan</p><h1 className="mt-2 text-3xl font-semibold text-white">Edit trip</h1></div><TripForm key={trip.updatedAt} initialTrip={trip} submitLabel="Save Trip Changes" onSubmit={update}/><button onClick={() => setEditing(false)} className="mt-4 min-h-10 rounded-lg px-3 text-sm text-slate-400 hover:text-white">Cancel editing</button></div> : <>
      <header className="mt-7 overflow-hidden rounded-3xl border border-white/[0.08] bg-[radial-gradient(ellipse_at_85%_10%,rgba(79,70,229,.2),transparent_40%),#0B1120] p-6 sm:p-9"><div className="flex flex-wrap items-start justify-between gap-5"><div><span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-cyan-100"><Check size={12}/>{trip.status}</span><h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{trip.title}</h1><p className="mt-3 flex flex-wrap items-center gap-2 text-base text-slate-300 sm:text-lg"><span>{trip.origin}</span><span className="text-cyan-200">→</span><span>{trip.destination}</span></p><p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-400"><CalendarDays size={15}/>{formatDate(trip.startDate)} – {formatDate(trip.endDate)}</p></div><div className="flex w-full gap-2 sm:w-auto"><button onClick={() => setEditing(true)} className="min-h-10 flex-1 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200 hover:bg-white/[0.05] sm:flex-none">Edit Trip</button><button onClick={() => { setConfirmDelete(true); setDeleteError('') }} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-rose-300/15 px-4 text-sm font-medium text-rose-200 hover:bg-rose-300/[0.06] sm:flex-none"><Trash2 size={15}/>Delete</button></div></div></header>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{details?.map(({ label, value, Icon }) => <article key={label} className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5"><span className="inline-flex items-center gap-2 text-xs text-slate-500"><Icon size={15} className="text-cyan-200"/>{label}</span><p className="mt-2 text-base font-medium capitalize text-white">{value}</p></article>)}</section>
      <section className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-indigo-300/10 text-indigo-200"><Compass size={19}/></span><div><h2 className="font-semibold text-white">Your interests</h2><p className="mt-1 text-xs text-slate-500">What you’re looking forward to</p></div></div>{trip.interests.length ? <div className="mt-4 flex flex-wrap gap-2">{trip.interests.map((interest) => <span key={interest} className="rounded-full border border-white/[0.09] px-3 py-1.5 text-xs capitalize text-slate-300">{interest}</span>)}</div> : <p className="mt-4 text-sm text-slate-500">No interests selected.</p>}</section>
      <section className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-cyan-300/10 text-cyan-200"><MapPin size={19}/></span><div><h2 className="font-semibold text-white">Route &amp; Map</h2><p className="mt-1 text-xs text-slate-500">Your trip route and travel details</p></div></div>
        {routeLoading && <p role="status" className="mt-5 text-sm text-slate-400">Calculating route...</p>}
        {routeError && <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-rose-200">{routeError}</p><button onClick={() => void loadRoute()} className="min-h-9 rounded-lg border border-white/10 px-3 text-sm text-slate-200 hover:bg-white/[0.05]">Retry</button></div>}
        {route && !route.supported && <p className="mt-5 rounded-xl border border-white/[0.07] bg-[#070d19] p-4 text-sm text-slate-400">{route.message}</p>}
        {route?.supported && <><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
          { label: 'Origin', value: route.origin.name }, { label: 'Destination', value: route.destination.name },
          { label: 'Distance', value: `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(route.distanceKm))} km` },
          { label: 'Estimated travel time', value: `${Math.floor(Math.round(route.durationMinutes) / 60)} hr ${Math.round(route.durationMinutes) % 60} min` },
        ].map(({ label, value }) => <div key={label} className="rounded-xl border border-white/[0.07] bg-[#070d19] p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-sm font-medium text-white">{value}</p></div>)}</div><p className="mt-4 inline-flex items-center gap-2 text-sm text-slate-300"><CarFront size={16} className="text-cyan-200"/>Driving</p><div className="mt-4"><TripRouteMap route={route}/></div></>}
      </section>
      <section className="mt-10"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">More for your journey</p><h2 className="mt-2 text-2xl font-semibold text-white">Trip workspace</h2><p className="mt-2 text-sm text-slate-400">Your trip is saved. These planning tools will be added in future updates.</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{upcomingModules.map(({ title, description, Icon }) => <article key={title} className="rounded-2xl border border-white/[0.07] bg-[#0B1120]/70 p-5 opacity-80"><span className="grid size-9 place-items-center rounded-lg bg-white/[0.04] text-slate-400"><Icon size={17}/></span><div className="mt-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-slate-200">{title}</h3><span className="rounded-full border border-white/[0.08] px-2 py-1 text-[9px] uppercase tracking-wide text-slate-500">Coming later</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{description}</p></article>)}</div></section>
      </>}
    </div>
    {confirmDelete && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5" role="presentation"><section role="dialog" aria-modal="true" aria-labelledby="delete-trip-title" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1120] p-6 shadow-2xl"><h2 id="delete-trip-title" className="text-xl font-semibold text-white">Delete this trip?</h2><p className="mt-2 text-sm leading-6 text-slate-400">This action cannot be undone. The trip will be removed from your plans.</p>{deleteError && <p role="alert" className="mt-3 text-sm text-rose-200">{deleteError}</p>}<div className="mt-6 flex justify-end gap-3"><button disabled={deleting} onClick={() => setConfirmDelete(false)} className="min-h-10 rounded-xl border border-white/10 px-4 text-sm text-slate-300">Cancel</button><button disabled={deleting} onClick={() => void remove()} className="min-h-10 rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white disabled:opacity-60">{deleting ? 'Deleting…' : 'Delete Trip'}</button></div></section></div>}
  </Container>
}
