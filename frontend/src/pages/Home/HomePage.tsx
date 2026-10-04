import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Compass, MapPin, Sparkles } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Container } from '../../components/ui/Container'
import { SectionHeading } from '../../components/common/SectionHeading'

export function HomePage() {
  const reduceMotion = useReducedMotion()

  return (
    <>
      <section id="home" className="relative isolate flex min-h-[650px] items-center overflow-hidden border-b border-white/[0.06] sm:min-h-[700px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-36 top-12 size-[520px] rounded-full bg-indigo-600/[0.13] blur-[120px]" />
          <div className="absolute -left-40 bottom-[-250px] size-[500px] rounded-full bg-cyan-500/[0.08] blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(148,163,184,.17)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.17)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]" />
          <motion.div className="absolute right-[12%] top-[20%] size-2 rounded-full bg-cyan-200 shadow-[0_0_22px_5px_rgba(103,232,249,.38)]" animate={reduceMotion ? undefined : { y: [0, -10, 0], opacity: [0.65, 1, 0.65] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
        </div>

        <Container className="relative py-24 sm:py-28 lg:py-32">
          <motion.div initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: 'easeOut' }} className="max-w-3xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-300/15 bg-indigo-300/[0.06] px-3.5 py-2 text-xs font-medium text-indigo-100">
              <Sparkles aria-hidden="true" size={14} className="text-cyan-200" /> A more considered way to travel
            </div>
            <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">Plan. Explore.<br /><span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-cyan-200 bg-clip-text text-transparent">Experience.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">TravelMate AI brings your ideas, planning, and journey into one thoughtful companion—so you can spend less time coordinating and more time discovering.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button icon className="min-h-12 px-6">Plan Your Trip</Button>
              <a href="#explore" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.035] px-6 text-sm font-semibold text-slate-100 transition-colors hover:border-white/20 hover:bg-white/[0.07]">Explore Destinations <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/[0.09] pt-6 text-xs text-slate-500 sm:text-sm">
              <span className="inline-flex items-center gap-2"><Compass size={15} className="text-indigo-300" aria-hidden="true" /> Plans shaped around you</span>
              <span className="inline-flex items-center gap-2"><MapPin size={15} className="text-cyan-300" aria-hidden="true" /> Every detail, in one place</span>
            </div>
          </motion.div>
        </Container>
      </section>

      <section id="explore" className="py-20 sm:py-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-end">
            <SectionHeading eyebrow="Your journey, thoughtfully planned" title="Travel with clarity from the very first idea." />
            <p className="max-w-lg text-sm leading-7 text-slate-400 md:justify-self-end">A calm starting point for your next adventure. Build an itinerary at your own pace, keep your plans close, and leave room for the moments you didn’t plan.</p>
          </div>
          <div id="how-it-works" className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { number: '01', title: 'Find your direction', text: 'Start with a place, a feeling, or a little inspiration.' },
              { number: '02', title: 'Shape your trip', text: 'Bring the moving parts together in a plan that feels like yours.' },
              { number: '03', title: 'Enjoy the journey', text: 'Keep the important details close while you explore.' },
            ].map((item) => <article key={item.number} className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-6 sm:p-7">
              <span className="text-xs font-semibold tracking-[0.18em] text-cyan-300">{item.number}</span>
              <h3 className="mt-5 text-base font-semibold text-slate-100">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.text}</p>
            </article>)}
          </div>
        </Container>
      </section>
    </>
  )
}
