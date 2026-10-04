import { ArrowUpRight, MapPin } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Destination } from '../../data/destinations'
import { TravelImage } from '../common/TravelImage'

export function DestinationCard({ destination, index = 0 }: { destination: Destination; index?: number }) {
  const reduceMotion = useReducedMotion()
  return <motion.article initial={reduceMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, delay: (index % 3) * 0.07 }} className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120]">
    <a href="#plan" className="block focus-visible:outline-offset-[-4px]" aria-label={`Explore ${destination.name}`}>
      <div className="relative aspect-[1.18] overflow-hidden">
        <TravelImage src={destination.image} alt={destination.alt} className="absolute inset-0 size-full" imageClassName="transition-transform duration-700 group-hover:scale-[1.05]" />
        {destination.tag && <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#07101c]/60 px-3 py-1.5 text-[10px] font-medium tracking-wide text-white backdrop-blur">{destination.tag}</span>}
        <span className="absolute bottom-4 right-4 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-slate-950 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={17} /></span>
      </div>
      <div className="flex items-end justify-between gap-3 p-4 sm:p-5">
        <div><h3 className="text-lg font-semibold tracking-tight text-white">{destination.name}</h3><p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500"><MapPin size={12} aria-hidden="true" />{destination.region}</p></div>
        <span className="pb-0.5 text-right text-[11px] text-slate-400">{destination.note}</span>
      </div>
    </a>
  </motion.article>
}
