import { ArrowUpRight } from 'lucide-react'
import { TravelImage } from '../common/TravelImage'
import type { Story } from '../../data/stories'

export function StoryCard({ story }: { story: Story }) {
  return <article className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120]">
    <a href="#inspiration" className="block">
      <div className="relative aspect-[1.48]"><TravelImage src={story.image} alt={story.alt} className="absolute inset-0 size-full" imageClassName="transition-transform duration-700 group-hover:scale-105" /><span className="absolute bottom-3 left-3 rounded-md border border-white/15 bg-[#07101c]/70 px-2.5 py-1.5 text-[9px] font-semibold tracking-[.15em] text-white backdrop-blur">{story.category}</span></div>
      <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-semibold tracking-tight text-white">{story.title}</h3><ArrowUpRight size={17} className="mt-1 shrink-0 text-slate-500 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-200" /></div><p className="mt-2 text-sm leading-6 text-slate-400">{story.description}</p><p className="mt-5 text-xs text-slate-600">{story.readTime}</p></div>
    </a>
  </article>
}
