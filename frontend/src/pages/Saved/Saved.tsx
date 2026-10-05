import { useCallback, useEffect, useState } from 'react'
import { Compass, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/ui/Container'
import { SavedDestinationCard } from '../../components/destination/SavedDestinationCard'
import { authErrorMessage } from '../../services/authService'
import { savedDestinationService, type SavedDestination } from '../../services/savedDestinationService'

export function Saved() {
  const [destinations, setDestinations] = useState<SavedDestination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [removing, setRemoving] = useState<string | null>(null)
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try { setDestinations(await savedDestinationService.getSavedDestinations()) }
    catch (cause) { setError(authErrorMessage(cause)) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  const remove = async (id: string) => {
    setRemoving(id); setError('')
    try { await savedDestinationService.removeSavedDestination(id); setDestinations((items) => items.filter((item) => item.destinationId !== id)) }
    catch (cause) { setError(authErrorMessage(cause)) }
    finally { setRemoving(null) }
  }
  return <Container className="py-10 sm:py-14"><div className="mx-auto max-w-6xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">Your collection</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Saved Destinations</h1><p className="mt-2 text-sm text-slate-400">Places you’ve kept for a future journey.</p>
    {error && <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-300/15 bg-rose-300/[0.04] p-4 text-sm text-rose-200"><span>{error}</span><button onClick={() => void load()} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3"><RefreshCw size={14}/>Retry</button></div>}
    {loading ? <div role="status" className="grid min-h-[40vh] place-items-center text-sm text-slate-400"><span className="inline-flex items-center gap-3"><span className="size-5 animate-spin rounded-full border-2 border-cyan-200/30 border-t-cyan-200"/>Loading saved destinations…</span></div> : destinations.length ? <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{destinations.map((destination) => <SavedDestinationCard key={destination._id} destination={destination} onRemove={(id) => void remove(id)} removing={removing === destination.destinationId}/>)}</div> : !error && <div className="mt-7 rounded-2xl border border-white/[0.08] bg-[#0B1120] px-5 py-12 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-300/10 text-indigo-200"><Compass size={22}/></span><h2 className="mt-4 text-lg font-semibold text-white">Your travel wishlist is empty.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">Explore destinations and save the places you want to visit.</p><Link to="/explore" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white hover:bg-indigo-400">Explore Destinations</Link></div>}
  </div></Container>
}
