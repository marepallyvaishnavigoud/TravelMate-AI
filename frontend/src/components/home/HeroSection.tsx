import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import { TripSearchCard } from '../trip/TripSearchCard'
import { CinematicBackdrop } from '../common/CinematicBackdrop'

export function HeroSection() {
  const reduceMotion = useReducedMotion()
  return <>
    <section id="home" className="relative isolate flex min-h-[calc(100svh-5.5rem)] items-center overflow-hidden border-b border-white/[0.06]">
      <CinematicBackdrop />
      <Container className="relative pb-28 pt-28 sm:pb-36 sm:pt-36 lg:pb-40">
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="max-w-3xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#07101c]/40 px-3.5 py-2 text-xs font-medium text-slate-100 backdrop-blur"><Sparkles size={14} className="text-cyan-200" aria-hidden="true" /> AI-powered travel planning</div>
          <h1 className="text-[clamp(3rem,7.5vw,6.6rem)] font-semibold leading-[.98] tracking-[-.065em] text-white">Your next journey<br /><span className="text-slate-200">starts here.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-slate-200/90 sm:text-lg sm:leading-8">Find places that move you, then shape every detail into a trip that feels like yours.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button icon className="min-h-12 px-6" onClick={() => document.getElementById('plan')?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'center' })}>Plan Your Trip</Button><a href="#destinations" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-6 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12]">Explore Destinations <ArrowRight size={16} aria-hidden="true" /></a></div>
          <p className="mt-9 flex items-center gap-2 text-xs tracking-wide text-slate-300/80"><span className="size-1.5 rounded-full bg-cyan-300" /> Plan smarter <span className="text-white/40">·</span> Travel better <ArrowDown size={13} className="ml-1 text-white/50" aria-hidden="true" /></p>
        </motion.div>
      </Container>
    </section>
    <Container className="relative z-10 -mt-12 sm:-mt-14"><TripSearchCard /></Container>
  </>
}
