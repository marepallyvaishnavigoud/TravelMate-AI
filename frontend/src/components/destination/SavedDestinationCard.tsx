import { ArrowUpRight, Heart, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TravelImage } from '../common/TravelImage'
import type { SavedDestination } from '../../services/savedDestinationService'

export function SavedDestinationCard({ destination, onRemove, removing = false }: { destination: SavedDestination; onRemove: (id: string) => void; removing?: boolean }) {
  const savedDate = new Date(destination.savedAt)
  return <article className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120]">
    <Link to={`/destination/${destination.destinationId}`} className="block"><TravelImage src={destination.destinationImage} alt={`${destination.destinationName} destination`} className="aspect-[1.7] w-full"/><div className="p-4"><h3 className="text-lg font-semibold text-white">{destination.destinationName}</h3><p className="mt-1 text-xs text-slate-500">Saved {Number.isNaN(savedDate.getTime()) ? 'recently' : savedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p></div></Link>
    <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3"><Link to={`/destination/${destination.destinationId}`} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-cyan-200 hover:text-white">View destination <ArrowUpRight size={15}/></Link><button type="button" disabled={removing} onClick={() => onRemove(destination.destinationId)} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-slate-400 transition hover:bg-rose-400/10 hover:text-rose-200 disabled:opacity-50" aria-label={`Remove ${destination.destinationName}`}><Heart size={15} className="fill-rose-400 text-rose-400"/><span className="hidden sm:inline">Unsave</span><Trash2 size={14}/></button></div>
  </article>
}
