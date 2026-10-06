import { useCallback, useEffect, useState } from 'react'
import { Compass, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/ui/Container'
import { TripCard } from '../../components/trip/TripCard'
import { authErrorMessage } from '../../services/authService'
import { tripService, type Trip } from '../../services/tripService'

export function Trips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = useCallback(async () => { setLoading(true); setError(''); try { setTrips(await tripService.getTrips()) } catch (cause) { setError(authErrorMessage(cause)) } finally { setLoading(false) } }, [])
  useEffect(() => { void load() }, [load])
  return <Container className="py-10 sm:py-14"><div className="mx-auto max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">Your travel plans</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">My Trips</h1><p className="mt-2 text-sm text-slate-400">Every journey you’ve planned, together in one place.</p></div><Link to="/trip-planner" className="inline-flex min-h-11 items-center rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white hover:bg-indigo-400">Plan a trip</Link></div>
    {loading ? <div role="status" className="grid min-h-[40vh] place-items-center text-sm text-slate-400">Loading your trips…</div> : error ? <section role="alert" className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-300/15 bg-rose-300/[0.04] p-4 text-sm text-rose-200"><span>{error}</span><button onClick={() => void load()} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3"><RefreshCw size={14}/>Retry</button></section> : trips.length ? <div className="mt-7 grid gap-4 lg:grid-cols-2">{trips.map((trip) => <TripCard key={trip._id} trip={trip}/>)}</div> : <div className="mt-7 rounded-2xl border border-white/[0.08] bg-[#0B1120] px-5 py-12 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-300/10 text-indigo-200"><Compass size={22}/></span><h2 className="mt-4 text-lg font-semibold text-white">No trips yet.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">Start planning your next adventure.</p><Link to="/trip-planner" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white hover:bg-indigo-400">Create Your First Trip</Link></div>}
  </div></Container>
}
