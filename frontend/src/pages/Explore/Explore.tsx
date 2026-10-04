import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Compass, MapPin, Search, X } from 'lucide-react'
import { Container } from '../../components/ui/Container'
import { DestinationCard } from '../../components/destination/DestinationCard'
import { TravelImage } from '../../components/common/TravelImage'
import { exploreDestinations, type DestinationCategory, type IndiaRegion } from '../../data/destinations'

const categories: Array<'All' | DestinationCategory> = ['All','Beaches','Mountains','Adventure','Heritage','Nature','Spiritual','Food & Culture','Luxury','Wildlife']
const regions: Array<{ name: IndiaRegion; image: string; description: string }> = [
  { name: 'North India', image: '/images/kashmir.svg', description: 'Himalayan horizons & ancient cities' },
  { name: 'South India', image: '/images/kerala.svg', description: 'Backwaters, hills & coastal calm' },
  { name: 'West India', image: '/images/jaipur.svg', description: 'Desert stories & seaside escapes' },
  { name: 'East India', image: '/images/andaman.svg', description: 'River life & island blues' },
  { name: 'Northeast India', image: '/images/manali.svg', description: 'Wild landscapes & living cultures' },
  { name: 'Central India', image: '/images/wildlife.svg', description: 'Forest reserves & heritage trails' },
]

export function Explore() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'All' | DestinationCategory>('All')
  const [region, setRegion] = useState<IndiaRegion | null>(null)
  const reduced = useReducedMotion()
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase()
    return exploreDestinations.filter((place) => {
      const matchesSearch = !search || [place.name, place.city, place.state, place.country, ...place.tags, place.category].join(' ').toLocaleLowerCase().includes(search)
      return matchesSearch && (category === 'All' || place.category === category) && (!region || place.indiaRegion === region)
    })
  }, [query, category, region])
  const clearFilters = () => { setQuery(''); setCategory('All'); setRegion(null) }
  const popular = exploreDestinations.slice(0, 4)
  const featured = exploreDestinations.find((place) => place.featured)!

  return <>
    <section className="relative isolate overflow-hidden border-b border-white/[0.06]">
      <div aria-hidden="true" className="absolute inset-0 -z-10"><TravelImage src="/images/hero-coast.svg" alt="" className="size-full opacity-30" /><div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/85 to-[#030712]/25" /><div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/30" /></div>
      <Container className="py-14 sm:py-20 lg:py-24">
        <motion.div initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }} className="max-w-3xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-xs text-slate-400"><Link to="/" className="hover:text-white">Home</Link><span className="mx-2 text-slate-600">/</span><span className="text-slate-200">Explore</span></nav>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-cyan-200"><Compass size={14} /> Find your somewhere</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-.055em] text-white sm:text-6xl">Explore the world.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">Discover places worth remembering, from hidden escapes to unforgettable destinations.</p>
          <label className="mt-8 flex min-h-14 max-w-2xl items-center gap-3 rounded-2xl border border-white/10 bg-[#0B1120]/90 px-4 shadow-2xl shadow-black/20 focus-within:border-cyan-300/40 sm:px-5">
            <Search size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search destinations, cities or countries..." aria-label="Search destinations, cities or countries" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="grid size-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white"><X size={16} /></button>}
          </label>
        </motion.div>
      </Container>
    </section>

    <Container className="py-10 sm:py-14">
      <section aria-labelledby="popular-heading">
        <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[.18em] text-cyan-200">A place to start</p><h2 id="popular-heading" className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Popular right now</h2></div><Link to="/explore#destinations" className="mb-1 inline-flex items-center gap-2 text-xs font-medium text-slate-300 hover:text-white">See all <ArrowRight size={14} /></Link></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{popular.map((place, index) => <DestinationCard key={place.id} destination={place} index={index} />)}</div>
      </section>
    </Container>

    <section id="destinations" className="border-y border-white/[0.06] bg-[#080e1a] py-10 sm:py-14"><Container>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-[.18em] text-cyan-200">Made for your kind of trip</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Explore destinations</h2><p className="mt-2 text-sm text-slate-400" aria-live="polite">{filtered.length} {filtered.length === 1 ? 'destination' : 'destinations'} found</p></div></div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]" role="group" aria-label="Filter destinations by category">{categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-full border px-4 text-xs font-medium transition focus-visible:outline-offset-2 ${category === item ? 'border-cyan-200/40 bg-cyan-200/10 text-cyan-100' : 'border-white/10 bg-[#0B1120] text-slate-400 hover:border-white/20 hover:text-white'}`}>{item}</button>)}</div>
      {region && <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">Showing {region}<button type="button" onClick={() => setRegion(null)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-cyan-200 hover:bg-white/5">Clear region <X size={12} /></button></div>}
      {filtered.length ? <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((place, index) => <DestinationCard key={place.id} destination={place} index={index} />)}</motion.div> : <div className="mt-6 rounded-2xl border border-white/[0.08] bg-[#0B1120] px-5 py-14 text-center"><p className="text-lg font-medium text-white">No destinations found.</p><p className="mt-2 text-sm text-slate-400">Try another search or clear your filters.</p><button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-200">Clear search</button></div>}
    </Container></section>

    <Container className="py-12 sm:py-16"><motion.section initial={reduced ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .5 }} className="grid overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0B1120] md:grid-cols-2">
      <div className="relative min-h-[270px] md:min-h-[390px]"><TravelImage src={featured.image} alt={featured.alt} className="absolute inset-0 size-full" /><div className="absolute inset-0 bg-gradient-to-t from-[#030712]/70 to-transparent md:bg-gradient-to-r" /></div>
      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">The editor’s pick · {featured.state}</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">A slower side of {featured.name}.</h2><p className="mt-4 max-w-md text-sm leading-6 text-slate-400">{featured.description}</p><p className="mt-4 text-xs text-slate-400">Nature · Food · Culture</p><Link to={`/destination/${featured.id}`} className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">Explore {featured.name}<ArrowRight size={15} /></Link></div>
    </motion.section></Container>

    <section className="border-y border-white/[0.06] bg-[#080e1a] py-12 sm:py-16"><Container><p className="text-xs font-medium uppercase tracking-[.18em] text-cyan-200">A country of many journeys</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Explore India by region</h2><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{regions.map((item, index) => <button key={item.name} type="button" onClick={() => { setRegion(item.name); document.getElementById('destinations')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' }) }} className="group relative flex min-h-36 items-end overflow-hidden rounded-2xl border border-white/[0.08] text-left focus-visible:outline-offset-2"><TravelImage src={item.image} alt="" className="absolute inset-0 size-full" imageClassName="transition-transform duration-500 group-hover:scale-105" /><span className="absolute inset-0 bg-gradient-to-t from-[#030712]/95 via-[#030712]/25 to-transparent" /><span className="relative p-5"><span className="block text-lg font-semibold text-white">{item.name}</span><span className="mt-1 block text-xs text-slate-300">{item.description}</span></span><span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-black/25 text-white"><MapPin size={14} /><span className="sr-only">Filter by {item.name}</span></span><span className="sr-only">Region {index + 1}</span></button>)}</div></Container></section>

    <Container className="py-12 sm:py-16"><div className="rounded-3xl bg-[#111827] px-6 py-12 text-center sm:px-10"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">Your next story starts somewhere</p><h2 className="mx-auto mt-3 max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-4xl">Find a place that feels like yours.</h2><p className="mt-3 text-sm text-slate-400">Explore at your own pace, then make the journey your own.</p><Link to="/explore#destinations" onClick={clearFilters} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-200">Browse destinations <ArrowRight size={15} /></Link></div></Container>
  </>
}
