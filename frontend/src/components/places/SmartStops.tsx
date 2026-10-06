import { useState } from 'react'
import axios from 'axios'
import { CarFront, LoaderCircle } from 'lucide-react'
import { placesService, type PlaceCategory, type PlacesResponse } from '../../services/placesService'
import { PlaceCard } from './PlaceCard'
import { DataStatusBadge } from './DataStatusBadge'

const stopCategories: Array<{ category: PlaceCategory; label: string }> = [
  { category: 'restaurant', label: 'Food' }, { category: 'petrol', label: 'Petrol' },
  { category: 'attraction', label: 'Attractions' }, { category: 'cafe', label: 'Cafes' },
]

export function SmartStops({ tripId }: { tripId: string }) {
  const [selected, setSelected] = useState<PlaceCategory | null>(null)
  const [data, setData] = useState<PlacesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const select = async (category: PlaceCategory) => {
    setSelected(category); setLoading(true); setData(null); setError('')
    try { setData(await placesService.getTripStops(tripId, category)) }
    catch (cause) {
      if (axios.isAxiosError(cause) && cause.response?.status === 401) setError('Sign in again to search places for this trip.')
      else if (axios.isAxiosError(cause) && cause.response?.status === 404) setError('Trip not found.')
      else setError('Places are temporarily unavailable. Please try again.')
    } finally { setLoading(false) }
  }

  return <section className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-200"><CarFront size={19}/></span><div><h2 className="font-semibold text-white">Smart Stops</h2><p className="mt-1 text-xs text-slate-500">Places near the origin, destination, and sampled route points</p></div></div>
    <div className="mt-4 flex flex-wrap gap-2">{stopCategories.map(({ category, label }) => <button key={category} type="button" disabled={loading} aria-pressed={selected === category} onClick={() => void select(category)} className={`min-h-9 rounded-full border px-3.5 text-xs font-medium ${selected === category ? 'border-cyan-200/30 bg-cyan-200/[0.08] text-cyan-100' : 'border-white/[0.08] text-slate-400 hover:text-white'}`}>{label}</button>)}</div>
    {loading && <p role="status" className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400"><LoaderCircle size={15} className="animate-spin"/>Looking for stops along the route…</p>}
    {error && <p role="alert" className="mt-4 text-sm text-rose-200">{error}</p>}
    {!selected && !loading && <p className="mt-4 rounded-xl border border-white/[0.07] bg-[#070d19] p-4 text-sm leading-6 text-slate-400">Choose a category to find live places near your trip route.</p>}
    {data && !loading && <div className="mt-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-slate-300">{data.message ?? `${data.places.length} places found near the route`}</p><DataStatusBadge status={data.dataStatus}/></div>{data.dataStatus === 'UNAVAILABLE' ? <p className="mt-3 rounded-xl border border-white/[0.07] bg-[#070d19] p-4 text-sm leading-6 text-slate-400">{data.message}</p> : data.places.length === 0 ? <p className="mt-3 text-sm text-slate-400">No places found nearby.</p> : <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.places.map((place) => <PlaceCard key={place.id} place={place}/>)}</div>}</div>}
  </section>
}
