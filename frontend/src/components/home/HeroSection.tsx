import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import { TripSearchCard } from '../trip/TripSearchCard'

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  return <>
    <section id="home" className="relative isolate flex min-h-[650px] items-center overflow-hidden border-b border-white/[0.06] sm:min-h-[730px]">
      <div aria-hidden="true" className="absolute inset-0 -z-10"><img src="/images/hero-coast.svg" alt="" fetchPriority="high" className="size-full object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-r from-[#030712]/95 via-[#030712]/65 to-[#030712]/15" /><div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/15" /><div className="absolute inset-0 bg-[#030712]/10" /></div>
      <Container className="relative pb-28 pt-28 sm:pb-36 sm:pt-36 lg:pb-40">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#07101c]/40 px-3.5 py-2 text-xs font-medium text-slate-100 backdrop-blur"><Sparkles size={14} className="text-cyan-200" aria-hidden="true" /> AI-powered travel planning</div>
          <h1 className="text-[clamp(3.3rem,8vw,7.1rem)] font-semibold leading-[.98] tracking-[-.065em] text-white">Plan. Explore.<br /><span className="text-slate-300">Experience.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-slate-200/85 sm:text-lg sm:leading-8">Discover destinations, build smarter itineraries, manage your budget, and experience every journey with TravelMate AI.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button icon className="min-h-12 px-6" onClick={() => document.getElementById('plan')?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'center' })}>Plan Your Trip</Button><a href="#destinations" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-6 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12]">Explore Destinations <ArrowRight size={16} aria-hidden="true" /></a></div>
          <p className="mt-9 flex items-center gap-2 text-xs tracking-wide text-slate-300/80"><span className="size-1.5 rounded-full bg-cyan-300" /> Plan smarter <span className="text-white/40">·</span> Travel better <ArrowDown size={13} className="ml-1 text-white/50" aria-hidden="true" /></p>
        </motion.div>
      </Container>
    </section>
    <Container className="relative z-10 -mt-12 sm:-mt-14"><TripSearchCard /></Container>
  </>
}
