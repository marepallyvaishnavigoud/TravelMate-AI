import { AtSign, BriefcaseBusiness, Camera, Plane } from 'lucide-react'
import { Container } from '../ui/Container'

const columns = [
  { title: 'Explore', links: [['Destinations', '#destinations'], ['Experiences', '#experiences'], ['Travel stories', '#inspiration']] },
  { title: 'Plan', links: [['Trip planner', '#plan'], ['Hotels', '#planner'], ['Restaurants', '#planner']] },
  { title: 'Company', links: [['About us', '#about'], ['Contact', 'mailto:hello@travelmate.ai']] },
  { title: 'Legal', links: [['Privacy', '#legal'], ['Terms', '#legal']] },
]

export function Footer() {
  return <footer id="legal" className="border-t border-white/[0.07] bg-[#070c16] pt-14 sm:pt-16">
    <Container>
      <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_repeat(4,1fr)] lg:gap-8">
        <div className="max-w-xs"><a href="#home" className="inline-flex items-center gap-2.5 text-sm font-semibold text-white"><span className="grid size-9 place-items-center rounded-xl border border-indigo-300/20 bg-indigo-400/10 text-indigo-200"><Plane size={16} /></span>TravelMate AI</a><p className="mt-4 text-sm leading-6 text-slate-500">Plan. Explore. Experience.<br />A more thoughtful way to see the world.</p><div className="mt-5 flex gap-2"><a aria-label="Photo sharing" href="#social" className="grid size-9 place-items-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:text-white"><Camera size={15} /></a><a aria-label="Contact" href="mailto:hello@travelmate.ai" className="grid size-9 place-items-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:text-white"><AtSign size={15} /></a><a aria-label="Professional network" href="#social" className="grid size-9 place-items-center rounded-lg border border-white/[0.08] text-slate-500 transition hover:text-white"><BriefcaseBusiness size={15} /></a></div></div>
        {columns.map((column) => <div key={column.title}><h2 className="text-xs font-semibold text-slate-200">{column.title}</h2><ul className="mt-4 space-y-3">{column.links.map(([label, href]) => <li key={label}><a href={href} className="text-xs text-slate-500 transition hover:text-slate-200">{label}</a></li>)}</ul></div>)}
      </div>
      <div className="flex flex-col gap-2 border-t border-white/[0.07] py-5 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between"><p>&copy; {new Date().getFullYear()} TravelMate AI. All rights reserved.</p><p>Made for the journeys that stay with you.</p></div>
    </Container>
  </footer>
}

