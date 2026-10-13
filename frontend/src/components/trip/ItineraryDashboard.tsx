import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, ArrowRight, CalendarDays, Check, CircleAlert, CircleDollarSign,
  Compass, MapPin, Moon, Mountain, Printer, ShoppingBag,
  Sparkles, Sun, Utensils, Wallet, Users, Camera, Landmark,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { exploreDestinations } from '../../data/destinations'
import { getDestinationMedia } from '../../data/destinationMedia'
import { TravelImage } from '../common/TravelImage'
import type { GeneratedItinerary, ItineraryActivity, ItineraryDay, Trip } from '../../services/tripService'

type Props = {
  trip: Trip
  itinerary: GeneratedItinerary | null
  loading: boolean
  savedLoading: boolean
  error: string
  pace: 'relaxed' | 'balanced' | 'packed'
  setPace: (value: 'relaxed' | 'balanced' | 'packed') => void
  accommodationPreference: 'budget' | 'standard' | 'premium'
  setAccommodationPreference: (value: 'budget' | 'standard' | 'premium') => void
  preferences: string
  setPreferences: (value: string) => void
  onGenerate: () => void
  onRetrieve: () => void
  onEdit: () => void
}

const destinationArtwork: Record<string, string> = Object.fromEntries(exploreDestinations.flatMap((place) => [
  [destinationKey(place.name), place.image] as const,
  [destinationKey(place.city), place.image] as const,
]))

function money(value: number, currency: string): string {
  try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value) }
  catch { return `${currency} ${Math.round(value).toLocaleString('en-IN')}` }
}

function tripDays(trip: Trip): number {
  const start = new Date(`${trip.startDate.slice(0, 10)}T00:00:00Z`).getTime()
  const end = new Date(`${trip.endDate.slice(0, 10)}T00:00:00Z`).getTime()
  return Number.isFinite(start) && Number.isFinite(end) && end >= start ? Math.floor((end - start) / 86400000) + 1 : 1
}

function destinationKey(value: string): string { return value.trim().toLowerCase() }

function activityImage(activity: ItineraryActivity, destination: string): string {
  if (activity.category === 'food') return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1200&q=80'
  if (activity.category === 'adventure') return 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80'
  if (/nature|wildlife|forest|walk/i.test(`${activity.title} ${activity.description}`)) return getDestinationMedia('munnar').src
  return destinationArtwork[destinationKey(destination)] ?? getDestinationMedia(destinationKey(destination)).src
}

function activityIcon(category: ItineraryActivity['category']) {
  if (category === 'food') return Utensils
  if (category === 'adventure') return Mountain
  if (category === 'shopping') return ShoppingBag
  if (category === 'attraction') return Landmark
  if (category === 'rest') return Sun
  if (category === 'transport') return Compass
  return Camera
}

function ActivityCard({ activity, destination, currency }: { activity: ItineraryActivity; destination: string; currency: string }) {
  const Icon = activityIcon(activity.category)
  const image = activityImage(activity, destination)
  return <article className="group flex min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#091323] transition hover:border-cyan-200/20">
    <div className="relative hidden w-28 shrink-0 bg-gradient-to-br from-indigo-500/20 via-[#12223a] to-cyan-500/10 sm:block">
      <TravelImage src={image} alt={`${activity.category} activity near ${destination}`} className="absolute inset-0 size-full" imageClassName="opacity-80 transition duration-500 group-hover:scale-105" />
      <span className="absolute bottom-2 left-2 grid size-8 place-items-center rounded-xl border border-white/15 bg-[#07111e]/80 text-cyan-100"><Icon size={16}/></span>
    </div>
    <div className="min-w-0 flex-1 p-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-400">
        <span>{activity.time}</span><span aria-hidden="true" className="text-slate-600">·</span><span>{activity.durationMinutes} min</span>
        <span className="rounded-full border border-cyan-200/15 bg-cyan-200/[0.05] px-2 py-1 text-cyan-100">{activity.genericSuggestion ? 'Suggested idea' : 'Verified place'}</span>
      </div>
      <div className="mt-2 flex items-start justify-between gap-3"><h4 className="font-semibold leading-5 text-white">{activity.title}</h4><span className="shrink-0 text-right text-xs font-semibold text-cyan-100">{activity.category === 'food' ? 'In food estimate' : activity.estimatedCost > 0 ? money(activity.estimatedCost, currency) : 'No ticket estimate'}</span></div>
      <p className="mt-2 text-sm leading-6 text-slate-400">{activity.description}</p>
    </div>
  </article>
}

function BudgetBreakdown({ itinerary, trip }: { itinerary: GeneratedItinerary; trip: Trip }) {
  const budgetParts = itinerary.budgetEstimate
  const categories = [
    { label: 'Transportation', value: budgetParts?.transportation ?? 0, color: 'bg-cyan-300' },
    { label: 'Accommodation', value: budgetParts?.accommodation ?? 0, color: 'bg-indigo-300' },
    { label: 'Food', value: budgetParts?.food ?? 0, color: 'bg-violet-300' },
    { label: 'Activities & tickets', value: budgetParts?.activities ?? 0, color: 'bg-sky-300' },
    { label: 'Local transportation', value: budgetParts?.localTravel ?? 0, color: 'bg-teal-300' },
    { label: 'Miscellaneous', value: budgetParts?.miscellaneous ?? 0, color: 'bg-slate-300' },
  ]
  const categoryTotal = categories.reduce((sum, item) => sum + item.value, 0)
  const isOver = itinerary.estimatedTotalCost > itinerary.budget
  return <aside className="rounded-3xl border border-white/[0.08] bg-[#0a1423] p-5 shadow-[0_18px_50px_rgba(0,0,0,.18)] sm:p-6">
    <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">Trip finances</p><h3 className="mt-2 text-xl font-semibold text-white">Budget breakdown</h3></div><span className="grid size-10 place-items-center rounded-2xl border border-indigo-200/15 bg-indigo-300/10 text-indigo-100"><Wallet size={18}/></span></div>
    <div className="mt-5 rounded-2xl border border-white/[0.06] bg-[#07101c] p-4"><p className="text-xs text-slate-500">Estimated total · entire group</p><p className="mt-1 text-2xl font-bold tracking-tight text-white">{money(itinerary.estimatedTotalCost, trip.currency)}</p><p className="mt-2 text-xs text-slate-400">Illustrative estimates, not live quotes</p></div>
    <div className="mt-5 space-y-4">{categories.map(({ label, value, color }) => {
      const percent = categoryTotal > 0 ? Math.max(0, Math.min(100, value / categoryTotal * 100)) : 0
      return <div key={label}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="text-slate-400">{label}</span><span className="font-medium text-slate-200">{money(value, trip.currency)}</span></div><div role="progressbar" aria-label={`${label} share`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className={`h-full rounded-full ${color}`} style={{ width: `${percent}%` }}/></div></div>
    })}</div>
    <div className="mt-5 border-t border-white/[0.08] pt-4 text-xs"><div className="flex justify-between gap-3 text-slate-400"><span>Category total</span><span className="text-slate-200">{money(categoryTotal, trip.currency)}</span></div><div className="mt-3 flex justify-between gap-3 text-slate-400"><span>Trip budget</span><span className="text-slate-200">{money(itinerary.budget, trip.currency)}</span></div><div className={`mt-3 flex items-center justify-between gap-3 rounded-xl border px-3 py-3 ${isOver ? 'border-amber-300/20 bg-amber-300/[0.06] text-amber-100' : 'border-emerald-300/15 bg-emerald-300/[0.04] text-emerald-100'}`}><span className="inline-flex items-center gap-2">{isOver ? <CircleAlert size={14}/> : <Check size={14} />}{isOver ? 'Over budget' : 'Budget remaining'}</span><strong>{money(Math.abs(itinerary.budgetRemaining), trip.currency)}</strong></div></div>
    <p className="mt-4 text-[11px] leading-5 text-slate-500">Costs are estimates for all travelers. Activity and shared trip costs are counted once in the category totals and allocated across daily totals.</p>
  </aside>
}

export function ItineraryDashboard(props: Props) {
  const { trip, itinerary, loading, savedLoading, error, pace, setPace, accommodationPreference, setAccommodationPreference, preferences, setPreferences, onGenerate, onRetrieve, onEdit } = props
  const [selectedDay, setSelectedDay] = useState(0)
  const duration = itinerary?.days.length ?? tripDays(trip)
  const place = exploreDestinations.find((entry) => [entry.name, entry.city, entry.state].some((item) => destinationKey(item) === destinationKey(trip.destination)))
  const art = destinationArtwork[destinationKey(trip.destination)] ?? getDestinationMedia(destinationKey(trip.destination)).src
  const selected = itinerary?.days[selectedDay]
  const totalByCategories = useMemo(() => itinerary?.budgetEstimate ? Object.values(itinerary.budgetEstimate).filter((item): item is number => typeof item === 'number').reduce((sum, value) => sum + value, 0) : null, [itinerary])

  useEffect(() => { setSelectedDay(0) }, [itinerary])

  const statCards = [
    { label: 'Estimated total', value: itinerary ? money(itinerary.estimatedTotalCost, trip.currency) : 'Generate a plan', hint: itinerary ? 'Illustrative group estimate' : 'No estimate yet', icon: Wallet },
    { label: 'Trip budget', value: money(trip.budget, trip.currency), hint: `${trip.travelers} ${trip.travelers === 1 ? 'traveler' : 'travelers'}`, icon: CircleDollarSign },
    { label: itinerary && itinerary.budgetRemaining < 0 ? 'Over budget' : 'Budget remaining', value: itinerary ? money(Math.abs(itinerary.budgetRemaining), trip.currency) : '—', hint: itinerary ? (itinerary.budgetRemaining < 0 ? 'Review the estimates below' : 'After estimated trip costs') : 'Generate a plan to compare', icon: itinerary?.budgetRemaining !== undefined && itinerary.budgetRemaining < 0 ? CircleAlert : Check },
    { label: 'Duration', value: `${duration} ${duration === 1 ? 'day' : 'days'}`, hint: `${trip.travelers} ${trip.travelers === 1 ? 'traveler' : 'travelers'}`, icon: CalendarDays },
  ]

  function activitiesFor(day: ItineraryDay, period: 'morning' | 'afternoon' | 'evening'): ItineraryActivity[] {
    const direct = day[period]
    if (Array.isArray(direct) && direct.length) return direct
    return (Array.isArray(day.activities) ? day.activities : []).filter((activity) => activity.period === period)
  }

  return <section className="mt-7 space-y-5" aria-label="Smart itinerary dashboard">
    <header className="relative isolate min-h-[270px] overflow-hidden rounded-[28px] border border-white/[0.09] bg-[linear-gradient(115deg,#101b31_0%,#0b1322_55%,#14203a_100%)] p-6 sm:min-h-[310px] sm:p-9">
      <TravelImage src={art} alt={place ? `${place.name}, ${place.country}` : `${trip.destination} destination`} className="absolute inset-0 z-0 size-full" imageClassName="opacity-45" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#07101d]/95 via-[#07101d]/75 to-[#07101d]/25" />
      <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-between gap-8 sm:min-h-[230px]">
        <div className="flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-cyan-100/20 bg-[#07101d]/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.19em] text-cyan-100"><Sparkles size={13}/>Rule-based smart itinerary</span><Link to="/my-trips" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-[#07101d]/40 px-3 text-xs font-semibold text-white hover:bg-white/10"><ArrowLeft size={14}/>All trips</Link></div>
        <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-100">{place ? `${place.city}, ${place.country}` : 'Your next journey'}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-5xl">{trip.title}</h2><div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-200"><span className="inline-flex items-center gap-2"><MapPin size={15} className="text-cyan-200"/>{trip.origin} <span className="text-cyan-200">→</span> {trip.destination}</span><span className="inline-flex items-center gap-2"><CalendarDays size={15} className="text-cyan-200"/>{new Date(`${trip.startDate.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} – {new Date(`${trip.endDate.slice(0, 10)}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span><span className="inline-flex items-center gap-2"><Users size={15} className="text-cyan-200"/>{trip.travelers} travelers</span></div></div>
        <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={onEdit} className="min-h-10 rounded-xl bg-white px-4 text-xs font-bold text-[#08111f] transition hover:bg-cyan-50">Edit trip details</button><a href="#trip-route-map" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 bg-[#07101d]/40 px-4 text-xs font-semibold text-white hover:bg-white/10"><MapPin size={14}/>View trip map</a></div>
      </div>
    </header>

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{statCards.map(({ label, value, hint, icon: Icon }) => {
      const isOver = label === 'Over budget'
      return <article key={label} className={`rounded-2xl border p-4 shadow-[0_12px_30px_rgba(0,0,0,.12)] sm:p-5 ${isOver ? 'border-amber-300/20 bg-[linear-gradient(145deg,#211a14,#0d1420)]' : 'border-white/[0.08] bg-[linear-gradient(145deg,#101b2c,#0b1320)]'}`}><div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-slate-400">{label}</p><span className={`grid size-9 place-items-center rounded-xl ${isOver ? 'bg-amber-300/10 text-amber-200' : 'bg-cyan-200/[0.08] text-cyan-100'}`}><Icon size={16}/></span></div><p className={`mt-3 truncate text-xl font-bold tracking-tight sm:text-2xl ${isOver ? 'text-amber-100' : 'text-white'}`}>{value}</p><p className="mt-1 text-[11px] text-slate-500">{hint}</p></article>
    })}</div>

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,.8fr)]">
      <div className="min-w-0 space-y-5">
        <section className="rounded-3xl border border-white/[0.08] bg-[#0a1423] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">Your travel plan</p><h3 className="mt-2 text-xl font-semibold text-white">Day-by-day itinerary</h3><p className="mt-1 text-sm text-slate-500">Flexible ideas for your trip. Check venue details before you go.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={onRetrieve} disabled={savedLoading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/[0.04] disabled:opacity-60">{savedLoading ? 'Loading…' : 'Load saved'}</button>{itinerary && <button type="button" onClick={() => window.print()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-200 hover:bg-white/[0.04]"><Printer size={14}/>Print</button>}<button type="button" onClick={onGenerate} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-xs font-bold text-white shadow-lg shadow-indigo-950/30 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><span className="size-3 animate-spin rounded-full border-2 border-white/30 border-t-white"/>Generating…</> : <><Sparkles size={14}/>{itinerary ? 'Regenerate' : 'Generate itinerary'}</>}</button></div></div>
          <div className="mt-5 grid gap-3 md:grid-cols-3"><label className="text-xs font-medium text-slate-400">Travel pace<select value={pace} onChange={(event) => setPace(event.target.value as Props['pace'])} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#07101c] px-3 text-sm text-white outline-none focus:border-cyan-200/50"><option value="relaxed">Relaxed</option><option value="balanced">Balanced</option><option value="packed">Packed</option></select></label><label className="text-xs font-medium text-slate-400">Accommodation<select value={accommodationPreference} onChange={(event) => setAccommodationPreference(event.target.value as Props['accommodationPreference'])} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#07101c] px-3 text-sm text-white outline-none focus:border-cyan-200/50"><option value="budget">Budget</option><option value="standard">Standard</option><option value="premium">Premium</option></select></label><label className="text-xs font-medium text-slate-400">Preferences<input maxLength={500} value={preferences} onChange={(event) => setPreferences(event.target.value)} placeholder="Accessibility, dietary needs…" className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#07101c] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/50"/></label></div>
          {error && <p role="alert" className="mt-4 rounded-xl border border-rose-300/20 bg-rose-500/[0.06] p-3 text-sm text-rose-200">{error}<button type="button" onClick={onGenerate} className="ml-2 font-semibold underline underline-offset-2">Try again</button></p>}
          {!itinerary && !loading && !error && <div className="mt-5 rounded-2xl border border-dashed border-white/[0.12] bg-[#07101c] p-6 text-center"><span className="mx-auto grid size-11 place-items-center rounded-2xl bg-indigo-300/10 text-indigo-100"><Compass size={19}/></span><p className="mt-3 font-medium text-white">Your itinerary starts here</p><p className="mt-1 text-sm text-slate-500">Generate a free rule-based plan, or load one already saved to this trip.</p></div>}
        </section>

        {itinerary && <>
          <nav aria-label="Choose itinerary day" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">{itinerary.days.map((day, index) => <button key={day.day} type="button" onClick={() => setSelectedDay(index)} aria-current={selectedDay === index ? 'step' : undefined} className={`min-w-[88px] shrink-0 rounded-2xl border px-3 py-2.5 text-left transition ${selectedDay === index ? 'border-cyan-200/35 bg-cyan-200/[0.09] text-white shadow-md shadow-cyan-950/20' : 'border-white/[0.07] bg-[#0a1423] text-slate-400 hover:border-white/20 hover:text-white'}`}><span className="block text-[9px] font-bold uppercase tracking-[.15em] text-cyan-200">Day {day.day}</span><span className="mt-1 block text-xs font-medium">{new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span></button>)}</nav>
          {selected && <article className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a1423] shadow-[0_20px_55px_rgba(0,0,0,.18)]">
            <div className="relative overflow-hidden border-b border-white/[0.07] bg-[linear-gradient(110deg,#101d34,#0b1423)] p-5 sm:p-7"><TravelImage src={art} alt="" className="absolute right-0 top-0 h-full w-2/5" imageClassName="opacity-20 [mask-image:linear-gradient(to_right,transparent,black)]"/><div className="relative flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">{new Date(`${selected.date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p><h3 className="mt-2 text-2xl font-bold text-white">{selected.title}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{selected.summary}</p></div><div className="flex gap-2"><button type="button" onClick={() => setSelectedDay((index) => Math.max(0, index - 1))} disabled={selectedDay === 0} aria-label="Previous day" className="grid size-10 place-items-center rounded-xl border border-white/10 text-white hover:bg-white/[0.06] disabled:opacity-30"><ArrowLeft size={16}/></button><button type="button" onClick={() => setSelectedDay((index) => Math.min(itinerary.days.length - 1, index + 1))} disabled={selectedDay >= itinerary.days.length - 1} aria-label="Next day" className="grid size-10 place-items-center rounded-xl border border-white/10 text-white hover:bg-white/[0.06] disabled:opacity-30"><ArrowRight size={16}/></button></div></div></div>
            <div className="space-y-5 p-5 sm:p-7">{([
              { key: 'morning', label: 'Morning', time: 'Start the day', icon: Sun },
              { key: 'afternoon', label: 'Afternoon', time: 'Midday plans', icon: Camera },
              { key: 'evening', label: 'Evening', time: 'Wind down', icon: Moon },
            ] as const).map(({ key, label, time, icon: Icon }) => <section key={key}><div className="mb-3 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-cyan-200/[0.08] text-cyan-100"><Icon size={15}/></span><div><h4 className="text-sm font-semibold text-white">{label}</h4><p className="text-[10px] text-slate-500">{time}</p></div></div><div className="space-y-2.5">{activitiesFor(selected, key).length ? activitiesFor(selected, key).map((activity) => <ActivityCard key={activity.id || `${activity.time}-${activity.title}`} activity={activity} destination={trip.destination} currency={trip.currency}/>) : <p className="rounded-xl border border-dashed border-white/[0.08] px-4 py-3 text-sm text-slate-500">No activity scheduled for this part of the day.</p>}</div></section>)}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.045] px-4 py-3"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-cyan-100">Day estimate</p><p className="mt-1 text-[10px] text-slate-500">Includes allocated shared trip costs</p></div><strong className="text-lg text-white">{money(selected.estimatedDayCost, trip.currency)}</strong></div>
              {selected.tips?.length > 0 && <div className="rounded-2xl border border-indigo-200/10 bg-indigo-300/[0.035] p-4"><p className="text-xs font-semibold text-indigo-100">Travel notes</p><ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-400">{selected.tips.map((tip) => <li key={tip} className="flex gap-2"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-indigo-200"/>{tip}</li>)}</ul></div>}
            </div>
          </article>}
          <div className="grid gap-4 md:grid-cols-2">{itinerary.assumptions?.length > 0 && <section className="rounded-2xl border border-white/[0.07] bg-[#0a1423] p-4"><h4 className="text-xs font-semibold text-slate-200">About these suggestions</h4><ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-400">{itinerary.assumptions.map((item) => <li key={item}>• {item}</li>)}</ul></section>}{itinerary.warnings?.length > 0 && <section role="status" className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-4"><h4 className="inline-flex items-center gap-2 text-xs font-semibold text-amber-100"><CircleAlert size={14}/>Budget and planning notes</h4><ul className="mt-2 space-y-1.5 text-xs leading-5 text-amber-100/75">{itinerary.warnings.map((item) => <li key={item}>• {item}</li>)}</ul></section>}</div>
        </>}
      </div>

      <div className="space-y-5 xl:sticky xl:top-24">{itinerary ? <BudgetBreakdown itinerary={itinerary} trip={trip}/> : <aside className="rounded-3xl border border-white/[0.08] bg-[#0a1423] p-5 sm:p-6"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">Budget preview</p><h3 className="mt-2 text-lg font-semibold text-white">{money(trip.budget, trip.currency)}</h3><p className="mt-2 text-sm leading-6 text-slate-400">Generate your itinerary to see the illustrative cost breakdown for transportation, accommodation, food, activities, local travel, and other expenses.</p></aside>}
        <aside id="itinerary-map-preview" className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a1423] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-cyan-200/[0.08] text-cyan-100"><MapPin size={18}/></span><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-cyan-200">Trip map</p><h3 className="mt-1 text-sm font-semibold text-white">{routeName(trip)}</h3></div></div><p className="mt-3 text-xs leading-5 text-slate-400">The route map below uses your trip’s route data. Generic suggestions are not pinned as if they were verified places.</p><a href="#trip-route-map" className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.04]"><MapPin size={14}/>View route map</a></aside>
      </div>
    </div>
    {totalByCategories !== null && itinerary && Math.abs(totalByCategories - itinerary.estimatedTotalCost) > 0.02 && <p role="alert" className="rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-3 text-xs text-amber-100">The saved category breakdown doesn’t match the estimated total. Review these estimates before relying on them.</p>}
  </section>
}

function routeName(trip: Trip): string { return `${trip.origin} → ${trip.destination}` }
