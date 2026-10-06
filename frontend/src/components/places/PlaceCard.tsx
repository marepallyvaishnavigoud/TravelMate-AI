import { ExternalLink, MapPin, Star, Clock3, Globe } from 'lucide-react'
import type { Place } from '../../services/placesService'
import { DataStatusBadge } from './DataStatusBadge'

const categoryLabels = { hotel: 'Hotel', restaurant: 'Restaurant', attraction: 'Attraction', petrol: 'Petrol', cafe: 'Cafe' }
const priceLabels: Record<string, string> = { PRICE_LEVEL_FREE: 'Free', PRICE_LEVEL_INEXPENSIVE: '$', PRICE_LEVEL_MODERATE: '$$', PRICE_LEVEL_EXPENSIVE: '$$$', PRICE_LEVEL_VERY_EXPENSIVE: '$$$$' }

export function PlaceCard({ place }: { place: Place }) {
  const maps = place.googleMapsUri ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.latitude},${place.longitude}`)}`
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${place.latitude},${place.longitude}`)}`
  return <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120]">
    {place.image ? <img src={place.image} alt="" loading="lazy" className="h-40 w-full object-cover" /> : <div aria-hidden="true" className="grid h-24 place-items-center bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,.08),transparent_65%),#070d19]"><MapPin size={22} className="text-cyan-200/70"/></div>}
    <div className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-[.14em] text-cyan-200">{categoryLabels[place.category]}</span><DataStatusBadge status={place.dataStatus}/></div>
      <h3 className="mt-2 line-clamp-2 font-semibold text-white">{place.name}</h3>
      {place.providerCategories.length > 0 && <p className="mt-1 text-xs capitalize text-slate-400">{place.providerCategories.join(' · ')}</p>}
      {(place.rating !== null || place.userRatingCount !== null || place.priceLevel !== null) && <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">{place.rating !== null && <span className="inline-flex items-center gap-1"><Star size={13} className="fill-amber-300 text-amber-300"/>{place.rating.toFixed(1)}</span>}{place.userRatingCount !== null && <span className="text-slate-500">{place.userRatingCount.toLocaleString()} reviews</span>}{place.priceLevel !== null && <span>{priceLabels[place.priceLevel] ?? place.priceLevel}</span>}</div>}
      {place.address && <p className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-slate-400"><MapPin size={13} className="mt-0.5 shrink-0 text-slate-500"/>{place.address}</p>}
      {place.openingHours?.length ? <details className="mt-3 text-xs text-slate-400"><summary className="inline-flex cursor-pointer list-none items-center gap-1.5"><Clock3 size={13}/><span>Opening hours</span></summary><ul className="mt-2 space-y-1 pl-5">{place.openingHours.map((hours) => <li key={hours}>{hours}</li>)}</ul></details> : null}
      {place.websiteUri && <a href={place.websiteUri} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-cyan-200 hover:text-white">Website <ExternalLink size={12}/></a>}
      {place.distanceFromRoutePointMeters !== undefined && <p className="mt-2 text-xs text-slate-400">About {(place.distanceFromRoutePointMeters / 1000).toFixed(1)} km from a sampled route point</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] text-slate-500">Source: {place.source}</span><div className="flex gap-2"><a href={maps} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/[0.05]">View on map <ExternalLink size={12}/></a><a href={directions} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/[0.05]">Directions <Globe size={12}/></a></div></div>
    </div>
  </article>
}
