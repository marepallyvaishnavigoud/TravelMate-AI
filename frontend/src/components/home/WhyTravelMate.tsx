import { BrainCircuit, Wallet, Radio, Layers3 } from 'lucide-react'
import { Container } from '../ui/Container'
import { SectionHeading } from '../common/SectionHeading'

const features = [
  { icon: BrainCircuit, title: 'AI-powered planning', text: 'A personal itinerary shaped around your pace, interests, and the time you have.' },
  { icon: Wallet, title: 'Smart expense estimates', text: 'A clearer picture of your trip costs, so you can plan with confidence.' },
  { icon: Radio, title: 'Real-time travel guidance', text: 'A future-ready companion for the details that matter along the way.' },
  { icon: Layers3, title: 'Everything in one place', text: 'Keep destinations, stays, food, and day plans connected in one journey.' },
]

export function WhyTravelMate() {
  return <section id="about" className="py-20 sm:py-28"><Container>
    <SectionHeading eyebrow="Travel, made more considered" title="More of what you love about going." description="A thoughtful travel companion, from your first spark of inspiration to the little details along the way." />
    <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">{features.map(({ icon: Icon, title, text }, index) => <article key={title} className="rounded-2xl border border-white/[0.07] bg-[#0B1120] p-5 transition-colors hover:border-indigo-300/20 sm:p-6"><span className="grid size-10 place-items-center rounded-xl border border-indigo-300/15 bg-indigo-300/[0.07] text-indigo-200"><Icon size={19} aria-hidden="true" /></span><p className="mt-6 text-[10px] font-semibold tracking-[.17em] text-slate-600">0{index + 1}</p><h3 className="mt-2 text-base font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}</div>
  </Container></section>
}
