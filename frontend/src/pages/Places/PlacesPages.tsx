import { ArrowRight, BedDouble, MapPin, Utensils } from 'lucide-react'
import { Container } from '../../components/ui/Container'
import { PlacesSearchPanel } from '../../components/places/PlacesSearchPanel'
import type { PlaceCategory } from '../../services/placesService'

const photography = {
  hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=85',
  restaurant: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=85',
}

function PlacesPage({ category, title, description }: { category: PlaceCategory; title: string; description: string }) {
  const isHotel = category === 'hotel'
  const Icon = isHotel ? BedDouble : Utensils
  const image = isHotel ? photography.hotel : photography.restaurant
  const imageAlt = isHotel ? 'Boutique hotel among tropical gardens' : 'Warmly lit restaurant dining room'
  return <Container className="py-8 sm:py-12"><div className="mx-auto max-w-6xl">
    <header className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#09111f] shadow-[0_24px_75px_rgba(0,0,0,.28)]">
      <img src={image} alt={imageAlt} className="absolute inset-y-0 right-0 h-full w-[66%] object-cover opacity-75"/>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#080e19] via-[#080e19]/85 to-[#080e19]/15"/>
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#080e19]/55 via-transparent to-transparent"/>
      <div className="relative z-10 flex min-h-64 flex-wrap items-end justify-between gap-6 p-6 sm:min-h-72 sm:p-9">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-100/20 bg-[#07101c]/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-100 backdrop-blur"><Icon size={13}/>Explore nearby</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white drop-shadow sm:text-5xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">{description}</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-[#07101c]/55 px-4 py-3 text-xs font-medium text-white/90 shadow-lg backdrop-blur"><MapPin size={15} className="text-cyan-200"/>Search by destination <ArrowRight size={14} className="text-cyan-200"/></div>
      </div>
    </header>
    <div className="mt-5"><PlacesSearchPanel categories={[category]} title={`Find ${title.toLowerCase()} near a destination`} description="Search Google Places. Ratings, photos, and price details appear only when Google supplies them." mode="search"/></div>
  </div></Container>
}

export function HotelsPage() {
  return <PlacesPage category="hotel" title="Hotels" description="Explore hotel locations around a destination. TravelMate does not provide availability, pricing, or booking." />
}

export function RestaurantsPage() {
  return <PlacesPage category="restaurant" title="Restaurants" description="Find local restaurants around your destination, with photos and details when the provider supplies them." />
}
