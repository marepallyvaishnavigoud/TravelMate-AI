import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Compass, Mail, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/ui/Container'
import { SavedDestinationCard } from '../../components/destination/SavedDestinationCard'
import { authErrorMessage } from '../../services/authService'
import { savedDestinationService, type DashboardSummary } from '../../services/savedDestinationService'

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setSummary(await savedDestinationService.getDashboardSummary()) }
    catch (cause) { setError(authErrorMessage(cause)) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const remove = async (id: string) => {
    setRemoving(id); setError('')
    try { await savedDestinationService.removeSavedDestination(id); await load() }
    catch (cause) { setError(authErrorMessage(cause)) }
    finally { setRemoving(null) }
  }

  return <Container className="py-10 sm:py-14"><div className="mx-auto max-w-6xl">
    {loading ? <div role="status" className="grid min-h-[45vh] place-items-center text-sm text-slate-400"><span className="inline-flex items-center gap-3"><span className="size-5 animate-spin rounded-full border-2 border-cyan-200/30 border-t-cyan-200"/>Loading your travel dashboard…</span></div> : error && !summary ? <section role="alert" className="mx-auto max-w-xl rounded-2xl border border-rose-300/15 bg-[#0B1120] p-7 text-center"><h1 className="text-xl font-semibold text-white">We couldn’t load your dashboard</h1><p className="mt-2 text-sm text-slate-400">{error}</p><button onClick={() => void load()} className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-medium text-white"><RefreshCw size={15}/>Try again</button></section> : summary && <>
      <header><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">Your TravelMate</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Welcome back, {summary.user.firstName} 👋</h1><p className="mt-2 text-sm text-slate-400">Your journeys start here.</p></header>
      {error && <p role="alert" className="mt-5 rounded-xl border border-rose-300/15 bg-rose-300/[0.04] p-3 text-sm text-rose-200">{error}</p>}
      <section aria-label="Account overview" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5"><p className="text-xs text-slate-500">Saved destinations</p><p className="mt-2 text-3xl font-semibold text-white">{summary.savedDestinationsCount}</p></article>
        <article className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5"><p className="inline-flex items-center gap-2 text-xs text-slate-500"><Mail size={14}/>Account email</p><p className="mt-2 break-all text-sm font-medium text-slate-200">{summary.user.email}</p></article>
        <article className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5"><p className="inline-flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={14}/>Member since</p><p className="mt-2 text-sm font-medium text-slate-200">{new Date(summary.user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p></article>
      </section>
      <section className="mt-12"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">Your collection</p><h2 className="mt-2 text-2xl font-semibold text-white">Saved destinations</h2></div>{summary.savedDestinations.length > 0 && <Link to="/saved" className="text-sm text-cyan-200 hover:text-white">View all</Link>}</div>
        {summary.savedDestinations.length ? <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{summary.savedDestinations.slice(0, 3).map((destination) => <SavedDestinationCard key={destination._id} destination={destination} onRemove={(id) => void remove(id)} removing={removing === destination.destinationId}/>)}</div> : <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0B1120] px-5 py-10 text-center sm:py-14"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-300/10 text-indigo-200"><Compass size={22}/></span><h3 className="mt-4 text-lg font-semibold text-white">Your travel wishlist is empty.</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">Explore destinations and save the places you want to visit.</p><Link to="/explore" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white hover:bg-indigo-400">Explore Destinations</Link></div>}
      </section>
    </>}
  </div></Container>
}
