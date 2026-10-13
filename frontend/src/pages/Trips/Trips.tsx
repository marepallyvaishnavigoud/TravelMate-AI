import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Compass, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/ui/Container'
import { TripCard, getTripPhoto } from '../../components/trip/TripCard'
import { authErrorMessage } from '../../services/authService'
import { tripService, type Trip } from '../../services/tripService'

export function Trips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { setTrips(await tripService.getTrips()) } catch (cause) { setError(authErrorMessage(cause)) } finally { setLoading(false) } }, [])
  useEffect(() => { void load() }, [load])
  const heroPhoto = getTripPhoto(trips[0]?.destination ?? 'kerala')

  return <Container className="py-8 sm:py-12">
    <div className="mx-auto max-w-6xl">
      <header className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#09111f] shadow-[0_24px_75px_rgba(0,0,0,.28)]">
        <img src={heroPhoto} alt="" aria-hidden="true" className="absolute inset-y-0 right-0 h-full w-[67%] object-cover opacity-65"/>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#080e19] via-[#080e19]/85 to-[#080e19]/20"/>
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#080e19]/50 via-transparent to-transparent"/>
        <div className="relative z-10 flex min-h-56 flex-wrap items-end justify-between gap-6 p-6 sm:min-h-64 sm:p-9">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100/20 bg-[#07101c]/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-100 backdrop-blur"><Compass size={13}/>Your travel plans</span>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white drop-shadow sm:text-5xl">My Trips</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-slate-200">Every journey you’ve planned, together in one place.</p>
          </div>
          <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:flex-col sm:items-end">
            {!loading && !error && <p className="rounded-full border border-white/15 bg-[#07101c]/45 px-3 py-1.5 text-xs text-white/85 backdrop-blur">{trips.length} {trips.length === 1 ? 'trip planned' : 'trips planned'}</p>}
            <Link to="/trip-planner" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400">Plan a trip <ArrowRight size={15}/></Link>
          </div>
        </div>
      </header>

      {loading ? <div role="status" className="mt-7 grid min-h-[35vh] place-items-center text-sm text-slate-400"><span className="inline-flex items-center gap-3"><span className="size-5 animate-spin rounded-full border-2 border-cyan-200/30 border-t-cyan-200"/>Gathering your travel plans…</span></div>
        : error ? <section role="alert" className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] p-4 text-sm text-rose-200"><span>{error}</span><button onClick={() => void load()} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3"><RefreshCw size={14}/>Retry</button></section>
          : trips.length ? <section aria-label="Your trips" className="mt-7 grid gap-5 lg:grid-cols-2">{trips.map((trip) => <TripCard key={trip._id} trip={trip}/>)}</section>
            : <section className="relative isolate mt-7 grid min-h-72 place-items-center overflow-hidden rounded-[26px] border border-white/[0.1] bg-[#0a1220] px-5 py-12 text-center shadow-xl"><img src={heroPhoto} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover opacity-50"/><div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#07101c]/90 via-[#07101c]/55 to-[#07101c]/85"/><div className="relative z-10"><span className="mx-auto grid size-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-cyan-100 shadow-lg backdrop-blur"><Compass size={23}/></span><h2 className="mt-4 text-xl font-semibold text-white">Your next journey starts here</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-200">Create a trip to keep your dates, route, budget and plans together.</p><Link to="/trip-planner" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400">Plan your first trip <ArrowRight size={15}/></Link></div></section>}
    </div>
  </Container>
}
