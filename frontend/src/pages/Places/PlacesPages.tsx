import { Container } from '../../components/ui/Container'
import { PlacesSearchPanel } from '../../components/places/PlacesSearchPanel'
import type { PlaceCategory } from '../../services/placesService'

function PlacesPage({ category, title, description }: { category: PlaceCategory; title: string; description: string }) {
  return <Container className="py-12 sm:py-16"><div className="mx-auto max-w-6xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">Explore nearby</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">{description}</p><div className="mt-7"><PlacesSearchPanel categories={[category]} title={`Find ${title.toLowerCase()} near a destination`} description="Search Google Places. Ratings, photos, and price details appear only when Google supplies them." mode="search"/></div></div></Container>
}

export function HotelsPage() {
  return <PlacesPage category="hotel" title="Hotels" description="Explore hotel locations around a destination. TravelMate does not provide availability, pricing, or booking." />
}

export function RestaurantsPage() {
  return <PlacesPage category="restaurant" title="Restaurants" description="Find restaurants around a destination, with provider-supplied details where available." />
}

