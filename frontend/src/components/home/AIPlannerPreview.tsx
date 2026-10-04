import { ArrowRight, Check, Clock3, MapPin, Sparkles, Wallet, Users, Hotel, Utensils, Route, CalendarDays } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'

const details = [
  { label: 'Route', icon: Route }, { label: 'Hotels', icon: Hotel }, { label: 'Restaurants', icon: Utensils },
  { label: 'Activities', icon: Sparkles }, { label: 'Daily itinerary', icon: CalendarDays }, { label: 'Estimated expenses', icon: Wallet },
]

export function AIPlannerPreview() {
  const reduceMotion = useReducedMotion()
  return <section id="planner" className="relative overflow-hidden border-y border-white/[0.06] bg-[#0B1120] py-20 sm:py-28">
    <Container className="grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
      <motion.div initial={reduceMotion ? false : { opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .55 }}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[.2em] text-cyan-300">The TravelMate difference</p>
        <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-.04em] text-white sm:text-4xl lg:text-5xl">Your trip, intelligently planned.</h2>
        <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">Tell TravelMate where you want to go, how long you have, your budget and what you love. AI turns it into a personalized journey.</p>
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">{details.map(({ label, icon: Icon }) => <li key={label} className="flex items-center gap-2 text-xs text-slate-300"><Check size={14} className="shrink-0 text-cyan-300" aria-hidden="true" /><Icon size={13} className="shrink-0 text-slate-500" aria-hidden="true" />{label}</li>)}</ul>
        <Button icon className="mt-9" onClick={() => document.getElementById('plan')?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'center' })}>Build My Itinerary</Button>
      </motion.div>
      <motion.div initial={reduceMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: .6 }} className="relative mx-auto w-full max-w-xl">
        <div aria-hidden="true" className="absolute -inset-8 rounded-[3rem] bg-indigo-500/[0.09] blur-3xl" />
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#101827] shadow-[0_30px_100px_rgba(0,0,0,.38)]">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-7"><span className="flex items-center gap-2 text-xs font-medium text-slate-300"><Sparkles size={15} className="text-violet-300" /> Your AI trip preview</span><span className="rounded-full border border-cyan-300/15 bg-cyan-300/[0.07] px-2.5 py-1 text-[10px] text-cyan-200">Sample plan</span></div>
          <div className="p-5 sm:p-7">
            <div className="relative flex items-center justify-between gap-2 rounded-2xl border border-white/[0.07] bg-[#0B1120] p-4 sm:p-5"><div><p className="text-[10px] uppercase tracking-[.16em] text-slate-500">Starting in</p><p className="mt-1.5 text-lg font-semibold text-white sm:text-xl">Hyderabad</p></div><div className="flex flex-1 items-center px-3"><span className="h-px flex-1 bg-gradient-to-r from-white/10 via-cyan-300/40 to-white/10" /><span className="mx-2 grid size-8 place-items-center rounded-full border border-indigo-300/20 bg-indigo-300/10 text-indigo-200"><ArrowRight size={14} /></span><span className="h-px flex-1 bg-gradient-to-r from-white/10 via-cyan-300/40 to-white/10" /></div><div className="text-right"><p className="text-[10px] uppercase tracking-[.16em] text-slate-500">Heading to</p><p className="mt-1.5 text-lg font-semibold text-white sm:text-xl">Goa</p></div></div>
            <div className="mt-3 grid grid-cols-3 gap-2.5">{[{ label: 'Duration', value: '5 Days', icon: Clock3 }, { label: 'Travelers', value: '2 People', icon: Users }, { label: 'Budget', value: '₹30,000', icon: Wallet }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"><Icon size={14} className="text-slate-500" /><p className="mt-3 text-[10px] text-slate-500">{label}</p><p className="mt-0.5 text-xs font-semibold text-slate-200 sm:text-sm">{value}</p></div>)}</div>
            <div className="mt-5 flex items-center justify-between"><p className="text-xs font-semibold text-white">Your journey, at a glance</p><span className="text-[10px] text-slate-500">Personalized for you</span></div>
            <div className="mt-3 space-y-2">{[{ title: 'Day 1 · Arrive & unwind', icon: MapPin, tag: 'North Goa' }, { title: 'Day 2 · Coast & local flavors', icon: Utensils, tag: 'A relaxed day' }, { title: 'Day 3 · Old Goa & beyond', icon: Sparkles, tag: 'Culture' }].map(({ title, icon: Icon, tag }) => <div key={title} className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-[#0B1120]/70 px-3.5 py-3"><span className="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-cyan-200"><Icon size={14} /></span><span className="min-w-0 flex-1 truncate text-xs text-slate-200">{title}</span><span className="hidden rounded-full bg-white/[0.04] px-2 py-1 text-[10px] text-slate-500 sm:block">{tag}</span></div>)}</div>
            <p className="mt-4 text-center text-[10px] text-slate-600">Example itinerary · Suggestions are illustrative</p>
          </div>
        </div>
      </motion.div>
    </Container>
  </section>
}
