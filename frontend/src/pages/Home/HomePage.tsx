import { ArrowRight, MoveRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '../../components/ui/Container'
import { SectionHeading } from '../../components/common/SectionHeading'
import { TravelImage } from '../../components/common/TravelImage'
import { DestinationCard } from '../../components/destination/DestinationCard'
import { ExperienceCard } from '../../components/destination/ExperienceCard'
import { StoryCard } from '../../components/destination/StoryCard'
import { HeroSection } from '../../components/home/HeroSection'
import { AIPlannerPreview } from '../../components/home/AIPlannerPreview'
import { WhyTravelMate } from '../../components/home/WhyTravelMate'
import { trendingDestinations, editorialDestinations } from '../../data/destinations'
import { experiences } from '../../data/experiences'
import { stories } from '../../data/stories'

export function HomePage() {
  const reduceMotion = useReducedMotion()
  const [feature, ...rest] = editorialDestinations
  return <>
    <HeroSection />

    <section id="destinations" className="py-20 sm:py-28"><Container>
      <div className="flex flex-wrap items-end justify-between gap-5"><SectionHeading eyebrow="A good place to begin" title="Trending destinations" description="Places travelers are dreaming about right now." /><a href="#popular" className="mb-1 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white">See all places <ArrowRight size={15} /></a></div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">{trendingDestinations.map((destination, index) => <DestinationCard key={destination.name} destination={destination} index={index} />)}</div>
    </Container></section>

    <section id="experiences" className="border-y border-white/[0.06] bg-[#080e1a] py-20 sm:py-24"><Container>
      <div className="flex flex-wrap items-end justify-between gap-5"><SectionHeading eyebrow="Travel your way" title="Explore by experience" description="Some trips start with a place. Others start with a feeling." /><span className="mb-1 hidden text-xs text-slate-600 sm:block">Scroll to explore →</span></div>
      <div className="mt-9 flex gap-3 overflow-x-auto pb-3 [scrollbar-width:thin] [scrollbar-color:#334155_transparent] sm:grid sm:grid-cols-4 sm:overflow-visible lg:mt-12 lg:grid-cols-8">{experiences.map((experience) => <ExperienceCard key={experience.title} experience={experience} />)}</div>
    </Container></section>

    <AIPlannerPreview />

    <section id="popular" className="py-20 sm:py-28"><Container>
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end"><SectionHeading eyebrow="Made for the curious" title="A little inspiration for the way." description="Distinctive places, with room to make the journey your own." /><a href="#inspiration" className="mb-1 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white">Get inspired <ArrowRight size={15} /></a></div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:grid-rows-2">
        <motion.a href="#plan" initial={reduceMotion ? false : { opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .5 }} className="group relative min-h-[350px] overflow-hidden rounded-3xl border border-white/10 sm:col-span-2 sm:row-span-2 lg:min-h-[520px]">
          <TravelImage src={feature.image} alt={feature.alt} className="absolute inset-0 size-full" imageClassName="transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#030712]/95 via-[#030712]/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9"><span className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">The editor’s pick · {feature.region}</span><h3 className="mt-3 max-w-md text-3xl font-semibold tracking-[-.04em] text-white sm:text-4xl">{feature.name}</h3><p className="mt-2 max-w-sm text-sm text-slate-300">{feature.note}</p><span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">Explore the coast <MoveRight size={16} className="transition group-hover:translate-x-1" /></span></div>
        </motion.a>
        {rest.map((destination, index) => <motion.a key={destination.region} href="#plan" initial={reduceMotion ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .45, delay: index * .06 }} className="group relative min-h-[230px] overflow-hidden rounded-2xl border border-white/10 sm:min-h-[250px] lg:min-h-0">
          <TravelImage src={destination.image} alt={destination.alt} className="absolute inset-0 size-full" imageClassName="transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#030712]/90 via-[#030712]/15 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5"><p className="text-[10px] uppercase tracking-[.16em] text-slate-300">{destination.region}</p><h3 className="mt-1.5 text-xl font-semibold text-white">{destination.name}</h3><p className="mt-1 text-xs text-slate-300">{destination.note}</p></div>
        </motion.a>)}
      </div>
    </Container></section>

    <section id="inspiration" className="border-y border-white/[0.06] bg-[#080e1a] py-20 sm:py-28"><Container>
      <div className="flex flex-wrap items-end justify-between gap-5"><SectionHeading eyebrow="Notes from the road" title="Travel stories that make you want to go." description="A few thoughtful itineraries and ideas to set your imagination moving." /><a href="#inspiration" className="mb-1 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white">More stories <ArrowRight size={15} /></a></div>
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4">{stories.map((story) => <StoryCard key={story.title} story={story} />)}</div>
    </Container></section>

    <WhyTravelMate />

    <section className="px-5 pb-20 sm:px-8 sm:pb-28 lg:px-10"><Container className="relative isolate overflow-hidden rounded-[2rem] border border-white/10 px-6 py-16 text-center sm:py-20">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#111827]" /><div aria-hidden="true" className="absolute inset-0 -z-10 opacity-70" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 115%, rgba(99,102,241,.32), transparent 58%), radial-gradient(ellipse at 10% 0%, rgba(34,211,238,.08), transparent 40%)' }} />
      <p className="text-xs font-semibold uppercase tracking-[.22em] text-cyan-200">The next chapter is yours</p><h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-.045em] text-white sm:text-5xl">Your next adventure is waiting.</h2><p className="mt-4 text-sm text-slate-400 sm:text-base">Stop searching. Start exploring.</p><button type="button" onClick={() => document.getElementById('plan')?.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'center' })} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">Plan Your Trip <ArrowRight size={16} /></button>
    </Container></section>
  </>
}
