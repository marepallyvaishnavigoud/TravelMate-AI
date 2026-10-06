import { useState, type FormEvent } from 'react'
import axios from 'axios'
import { LoaderCircle, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { placesService, type PlaceCategory, type PlaceSearchInput, type PlacesResponse } from '../../services/placesService'
import { PlaceCard } from './PlaceCard'
import { DataStatusBadge } from './DataStatusBadge'

const labels: Record<PlaceCategory, string> = { hotel: 'Hotels', restaurant: 'Restaurants', attraction: 'Attractions', petrol: 'Petrol', cafe: 'Cafes' }

type Props = { categories: PlaceCategory[]; initialLocation?: string; compact?: boolean; eyebrow?: string; title?: string; description?: string; mode?: 'nearby' | 'search' }

export function PlacesSearchPanel({ categories, initialLocation = '', compact = false, eyebrow, title, description, mode = 'nearby' }: Props) {
  const [location, setLocation] = useState(initialLocation)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<PlaceCategory | null>(categories.length === 1 ? categories[0] : null)
  const [result, setResult] = useState<PlacesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = async (selected = category) => {
    if (!selected) { setError('Choose a place category to search.'); return }
    if (!location.trim()) { setError('Enter a destination to search around.'); return }
    setLoading(true); setError(''); setResult(null)
    const input: PlaceSearchInput = { category: selected, location: location.trim(), radius: 10000, limit: 12, ...(query.trim() ? { query: query.trim() } : {}) }
    try { setResult(mode === 'search' ? await placesService.searchPlaces(input) : await placesService.getNearbyPlaces(input)) }
    catch (cause) {
      if (axios.isAxiosError(cause) && cause.response?.status === 401) setError('Sign in to search live places.')
      else if (axios.isAxiosError(cause) && cause.response?.status === 400) setError(cause.response.data?.message ?? 'Check your search and try again.')
      else setError('Places are temporarily unavailable. Please try again.')
    } finally { setLoading(false) }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void search() }
  return <section className={`rounded-2xl border border-white/[0.08] bg-[#0B1120] ${compact ? 'p-5 sm:p-6' : 'p-5 sm:p-8'}`}>
    {(eyebrow || title || description) && <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">{eyebrow ?? 'Live place search'}</p>{title && <h2 className="mt-2 text-2xl font-semibold text-white">{title}</h2>}{description && <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>}</div>}
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <label className="text-xs font-medium text-slate-400">Destination or area<input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="e.g. Lisbon, Portugal" className="mt-2 min-h-11 w-full rounded-xl border border-white/[0.09] bg-[#070d19] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/40" /></label>
      <label className="text-xs font-medium text-slate-400">Optional search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or cuisine" className="mt-2 min-h-11 w-full rounded-xl border border-white/[0.09] bg-[#070d19] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/40" /></label>
      <button disabled={loading} type="submit" className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin"/> : <Search size={16}/>}Search</button>
    </form>
    <div className="mt-4 flex flex-wrap gap-2" aria-label="Place category">{categories.map((item) => <button key={item} type="button" disabled={loading} aria-pressed={category === item} onClick={() => { setCategory(item); if (location.trim()) void search(item) }} className={`min-h-9 rounded-full border px-3.5 text-xs font-medium transition ${category === item ? 'border-cyan-200/30 bg-cyan-200/[0.08] text-cyan-100' : 'border-white/[0.08] text-slate-400 hover:text-white'}`}>{labels[item]}</button>)}</div>
    {error && <p role="alert" className="mt-4 text-sm text-rose-200">{error}{error.startsWith('Sign in') && <> <Link className="underline underline-offset-2" to="/login">Log in</Link></>}</p>}
    {loading && <p role="status" className="mt-5 inline-flex items-center gap-2 text-sm text-slate-400"><LoaderCircle size={15} className="animate-spin"/>Searching live places…</p>}
    {result && !loading && <div className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-slate-300">{result.dataStatus === 'LIVE' ? `${result.places.length} ${category ? labels[category].toLowerCase() : 'places'} found` : result.message}</p><DataStatusBadge status={result.dataStatus}/></div>
      {result.dataStatus === 'UNAVAILABLE' ? <p className="mt-3 rounded-xl border border-white/[0.07] bg-[#070d19] p-4 text-sm leading-6 text-slate-400">Places are temporarily unavailable. Please try again.</p> : result.places.length === 0 ? <p className="mt-3 rounded-xl border border-white/[0.07] bg-[#070d19] p-4 text-sm text-slate-400">No places found nearby.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{result.places.map((place) => <PlaceCard key={place.id} place={place}/>)}</div>}
      <p className="mt-4 text-[10px] leading-5 text-slate-500">Place information supplied by {result.source}; fields may be unavailable.</p>
    </div>}
  </section>
}
