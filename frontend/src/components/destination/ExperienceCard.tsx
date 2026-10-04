import { ArrowUpRight } from 'lucide-react'
import type { Experience } from '../../data/experiences'
import { TravelImage } from '../common/TravelImage'

export function ExperienceCard({ experience }: { experience: Experience }) {
  const Icon = experience.icon
  return <a href="#destinations" className="group relative block aspect-[.86] min-w-[164px] overflow-hidden rounded-2xl border border-white/10 sm:aspect-[.88]">
    <TravelImage src={experience.image} alt={experience.alt} className="absolute inset-0 size-full" imageClassName="transition-transform duration-700 group-hover:scale-105" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#030712]/95 via-[#030712]/15 to-[#030712]/10 transition-colors group-hover:from-[#030712]/85" />
    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
      <span className="mb-3 grid size-9 place-items-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm"><Icon size={17} aria-hidden="true" /></span>
      <h3 className="text-base font-semibold text-white">{experience.title}</h3>
      <div className="mt-1 flex items-center justify-between text-xs text-slate-300"><span>{experience.label}</span><ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" /></div>
    </div>
  </a>
}
