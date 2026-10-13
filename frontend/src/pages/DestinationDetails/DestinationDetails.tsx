import { useParams, Link } from 'react-router-dom'
import { CalendarDays, Clock3, Languages, Wallet, Coins, Sun, TrainFront, Heart, Phone, ArrowRight, Sparkles, Hotel, Utensils, Compass } from 'lucide-react'
import { Container } from '../../components/ui/Container'
import { SectionHeading } from '../../components/common/SectionHeading'
import { DestinationHero } from '../../components/destination/detail/DestinationHero'
import { ActivityCard, FoodCard, PlaceCard, StayCard } from '../../components/destination/detail/DestinationCards'
import { DestinationGallery } from '../../components/destination/detail/DestinationGallery'
import { MapPreview } from '../../components/destination/detail/MapPreview'
import { TripSearchCard } from '../../components/trip/TripSearchCard'
import { exploreDestinations } from '../../data/destinations'
import { getDestinationDetails } from '../../data/destinationDetails'
import { PlacesSearchPanel } from '../../components/places/PlacesSearchPanel'
import { DataStatusBadge } from '../../components/places/DataStatusBadge'

const tipIcons = { sun: Sun, calendar: CalendarDays, train: TrainFront, heart: Heart, phone: Phone }

function DestinationNotFound() {
  return <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden"><div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_20%,rgba(49,46,129,.25),transparent_45%)]"/><Container className="py-20"><span className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">A little detour</span><h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Destination not found</h1><p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">We couldn’t find that place in our destination guide. Let’s help you discover somewhere else.</p><Link to="/explore" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 hover:bg-slate-200">Explore destinations <ArrowRight size={15}/></Link></Container></section>
}

export function DestinationDetails() {
  const { id } = useParams()
  const place = exploreDestinations.find((destination) => destination.id === id)
  if (!place) return <DestinationNotFound />
  const detail = getDestinationDetails(place)
  const planTrip = () => document.getElementById('trip-planning')?.scrollIntoView({ behavior:'smooth',block:'center' })
  const infoCards = [
    {label:'Best time',value:detail.info.bestTime,icon:CalendarDays},
    {label:'Recommended duration',value:detail.info.duration,icon:Clock3},
    {label:'Ideal for',value:detail.info.idealFor.join(' · '),icon:Sparkles},
    {label:'Estimated daily budget',value:`${detail.info.dailyBudget} / day`,icon:Wallet},
    {label:'Languages',value:detail.info.languages.join(' · '),icon:Languages},
    {label:'Currency',value:detail.info.currency,icon:Coins},
  ]
  return <>
    <DestinationHero place={place} onPlan={planTrip}/>
    <Container className="py-14 sm:py-20"><div className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
      <section><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">A sense of place</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Discover {place.name}</h2><p className="mt-5 text-sm leading-7 text-slate-300 sm:text-base">{detail.overview}</p></section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{infoCards.map(({label,value,icon:Icon})=><article key={label} className="min-h-28 rounded-2xl border border-white/[0.08] bg-[#0B1120] p-4"><Icon size={17} className="text-cyan-200"/><p className="mt-3 text-[10px] font-medium uppercase tracking-[.12em] text-slate-500">{label}</p><p className="mt-1.5 text-xs font-semibold leading-5 text-slate-200">{value}</p></article>)}</div>
    </div></Container>

    <section className="border-y border-white/[0.06] bg-[#080e1a] py-14 sm:py-20"><Container><SectionHeading eyebrow="Make the most of your stay" title="Things to do" description={`Ideas for making time in ${place.name} your own.`}/><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{detail.activities.map((activity)=><ActivityCard key={activity.title} activity={activity}/>)}</div></Container></section>

    <Container className="py-14 sm:py-20"><div className="flex flex-wrap items-end justify-between gap-3"><SectionHeading eyebrow="Add a few stops to your map" title="Places worth visiting" description={`A few places to start exploring around ${place.name}.`}/><DataStatusBadge status="DEMO"/></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{detail.places.map((item)=><PlaceCard key={item.name} place={item} onExplore={()=>document.getElementById('destination-map')?.scrollIntoView({behavior:'smooth'})}/>)}</div></Container>

    <section className="border-y border-white/[0.06] bg-[#080e1a] py-14 sm:py-20"><Container><PlacesSearchPanel categories={['hotel','restaurant','attraction','petrol','cafe']} initialLocation={`${place.city}, ${place.state}, ${place.country}`} eyebrow="Live provider search" title="Nearby Places" description={`Search Google Places around ${place.name}. Ratings and other details appear only when Google supplies them.`}/></Container></section>

    <section className="border-y border-white/[0.06] bg-[#080e1a] py-14 sm:py-20"><Container><SectionHeading eyebrow="Local flavors" title="Taste the destination" description="Regional favorites and everyday flavors to look out for."/><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{detail.foods.map((food)=><FoodCard key={food.name} food={food}/>)}</div></Container></section>

    <Container className="py-14 sm:py-20"><div className="grid gap-5 lg:grid-cols-[.8fr_1.2fr]"><section className="flex flex-col justify-center rounded-2xl border border-white/[0.08] bg-[#0B1120] p-6 sm:p-8"><span className="grid size-10 place-items-center rounded-xl bg-amber-200/10 text-amber-200"><Sun size={19}/></span><p className="mt-5 text-xs font-semibold uppercase tracking-[.17em] text-cyan-200">Plan with the season in mind</p><h2 className="mt-2 text-2xl font-semibold text-white">When should you visit?</h2><p className="mt-5 text-lg font-semibold text-white">{detail.info.bestTime}</p><p className="mt-2 text-sm text-slate-400">{detail.info.weather}</p><p className="mt-1 text-sm text-slate-400">Approx. {detail.info.temperature}</p><p className="mt-4 text-xs leading-5 text-slate-500">{detail.info.recommendation}</p></section><section className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[.17em] text-cyan-200">A few useful notes</p><h2 className="mt-2 text-2xl font-semibold text-white">Travel tips</h2><ul className="mt-6 grid gap-4 sm:grid-cols-2">{detail.tips.map((tip)=>{const Icon=tipIcons[tip.icon];return <li key={tip.title} className="flex gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-cyan-200"><Icon size={16}/></span><span><span className="block text-sm font-medium text-white">{tip.title}</span><span className="mt-1 block text-xs leading-5 text-slate-400">{tip.description}</span></span></li>})}</ul></section></div></Container>

    <section className="border-y border-white/[0.06] bg-[#080e1a] py-14 sm:py-20"><Container><SectionHeading eyebrow="A closer look" title="See the destination" description={`A small collection of ${place.name} photographs. Select an image to view it larger.`}/><div className="mt-8"><DestinationGallery images={detail.gallery}/></div></Container></section>

    <Container className="py-14 sm:py-20"><div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0B1120] p-7 sm:p-10"><div aria-hidden="true" className="absolute right-0 top-0 size-72 rounded-full bg-indigo-500/[0.07] blur-3xl"/><div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">A preview for later</p><h2 className="mt-2 text-2xl font-semibold text-white">Experience it before you go</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Destination video previews will be added when approved footage is available. No external video is embedded.</p><p className="mt-4 text-xs text-slate-500">{detail.videos[0].title} · {detail.videos[0].duration}</p></div><span className="grid size-14 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-cyan-200"><Compass size={23}/></span></div></div></Container>

    <section className="border-y border-white/[0.06] bg-[#080e1a] py-14 sm:py-20"><Container><div className="flex flex-wrap items-end justify-between gap-4"><SectionHeading eyebrow="Sample ideas · estimated prices" title="Where to stay" description="Example stays to help you think about areas and styles. Rates are estimates; availability is not checked."/><div className="flex items-center gap-2 pb-1"><DataStatusBadge status="DEMO"/><span className="inline-flex items-center gap-2 text-xs text-slate-400"><Hotel size={15}/> No live availability</span></div></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{detail.hotels.map((hotel)=><StayCard key={hotel.name} name={hotel.name} area={hotel.area} rating={hotel.rating} price={hotel.priceEstimate} image={hotel.image} alt={hotel.alt} kind="hotel"/>)}</div><a href="#trip-planning" onClick={planTrip} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-200 hover:text-white">Explore hotel planning <ArrowRight size={15}/></a></Container></section>

    <Container className="py-14 sm:py-20"><div className="flex flex-wrap items-end justify-between gap-4"><SectionHeading eyebrow="Sample ideas" title="Where to eat" description="A few example dining ideas. Details are illustrative and do not include live opening hours."/><div className="flex items-center gap-2"><DataStatusBadge status="DEMO"/><span className="inline-flex items-center gap-2 text-xs text-slate-400"><Utensils size={15}/> Sample listings</span></div></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{detail.restaurants.map((restaurant)=><StayCard key={restaurant.name} name={restaurant.name} area={restaurant.area} rating={restaurant.rating} price={restaurant.priceLevel} image={restaurant.image} alt={restaurant.alt} kind="restaurant"/>)}</div></Container>

    <section className="border-y border-white/[0.06] bg-[#080e1a] py-14 sm:py-20"><Container><SectionHeading eyebrow="Get oriented" title="Explore the destination" description="A place to discover nearby areas. A live interactive map will be connected in a future step."/><div className="mt-8"><MapPreview destination={place.name} nearby={detail.nearbyPlaces}/></div></Container></section>

    <Container className="py-14 sm:py-20"><section id="trip-planning" className="scroll-mt-24 rounded-3xl border border-white/[0.08] bg-[#111827] p-5 sm:p-8 lg:p-10"><div className="mx-auto mb-7 max-w-2xl text-center"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">A journey made for you</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Ready to explore {place.name}?</h2><p className="mt-3 text-sm leading-6 text-slate-400">Build a personalized itinerary around your interests, budget and travel dates.</p></div><TripSearchCard destination={place.name}/></section></Container>
  </>
}
