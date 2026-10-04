import { ArrowUpRight, Clock3, MapPin, Leaf, Fish } from 'lucide-react'
import type { Activity, LocalFood, Place } from '../../../data/destinationDetails'
import { TravelImage } from '../../common/TravelImage'

export function ActivityCard({ activity }: { activity: Activity }) {
  return <article className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120]"><div className="relative aspect-[1.45] overflow-hidden"><TravelImage src={activity.image} alt={activity.alt} className="absolute inset-0 size-full" imageClassName="transition-transform duration-500 group-hover:scale-105" /><span className="absolute left-3 top-3 rounded-full bg-[#030712]/70 px-3 py-1.5 text-[10px] text-white backdrop-blur">{activity.category}</span></div><div className="p-4"><h3 className="font-semibold text-white">{activity.title}</h3><p className="mt-2 text-xs leading-5 text-slate-400">{activity.description}</p><p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-slate-500"><Clock3 size={12} />{activity.duration}</p></div></article>
}

export function PlaceCard({ place, onExplore }: { place: Place; onExplore: () => void }) {
  return <article className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120]"><div className="relative aspect-[1.5] overflow-hidden"><TravelImage src={place.image} alt={place.alt} className="absolute inset-0 size-full" imageClassName="transition-transform duration-500 group-hover:scale-105" /></div><div className="p-4"><span className="text-[10px] font-semibold uppercase tracking-[.15em] text-cyan-200">{place.type}</span><h3 className="mt-1.5 text-base font-semibold text-white">{place.name}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">{place.description}</p><button type="button" onClick={onExplore} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-cyan-200">Explore <ArrowUpRight size={14} /></button></div></article>
}

export function FoodCard({ food }: { food: LocalFood }) {
  return <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120]"><div className="relative aspect-[1.35] overflow-hidden"><TravelImage src={food.image} alt={food.alt} className="absolute inset-0 size-full" /></div><div className="p-4"><h3 className="font-semibold text-white">{food.name}</h3><p className="mt-2 text-xs leading-5 text-slate-400">{food.description}</p><span className={`mt-3 inline-flex items-center gap-1.5 text-[10px] ${food.vegetarian?'text-emerald-300':'text-rose-200'}`}>{food.vegetarian?<Leaf size={12}/>:<Fish size={12}/>} {food.vegetarian?'Vegetarian':'Non-vegetarian'}</span></div></article>
}

export function StayCard({ name, area, rating, price, image, alt, kind }: { name: string; area: string; rating: number; price: string; image: string; alt: string; kind: 'hotel'|'restaurant' }) {
  return <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120]"><div className="relative aspect-[1.55] overflow-hidden"><TravelImage src={image} alt={alt} className="absolute inset-0 size-full" /></div><div className="p-4"><div className="flex items-start justify-between gap-2"><h3 className="font-semibold text-white">{name}</h3><span className="shrink-0 text-xs text-amber-200">★ {rating.toFixed(1)}</span></div><p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-400"><MapPin size={12}/>{area}</p><p className="mt-3 text-xs text-slate-300">{kind==='hotel'?`Sample rate from ${price} / night`:price}</p></div></article>
}
