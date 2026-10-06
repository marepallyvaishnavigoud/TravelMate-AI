import { api } from './authService'

export type PlaceCategory = 'hotel' | 'restaurant' | 'attraction' | 'petrol' | 'cafe'
export type PlaceDataStatus = 'LIVE' | 'UNAVAILABLE'
export type Place = {
  id: string
  name: string
  category: PlaceCategory
  latitude: number
  longitude: number
  address: string | null
  image: string | null
  rating: number | null
  userRatingCount: number | null
  priceLevel: string | null
  openingHours: string[] | null
  websiteUri: string | null
  googleMapsUri: string | null
  photos: Array<{ name: string; widthPx: number | null; heightPx: number | null; authorAttributions: Array<{ displayName: string; uri: string | null }> }>
  distanceFromRoutePointMeters?: number
  description: string | null
  providerCategories: string[]
  source: string
  dataStatus: 'LIVE'
}
export type PlacesResponse = { places: Place[]; source: string; dataStatus: PlaceDataStatus; attribution?: string; message?: string }
export type PlaceSearchInput = {
  category: PlaceCategory
  location?: string
  query?: string
  latitude?: number
  longitude?: number
  radius?: number
  limit?: number
}

async function getPlaces(path: '/places/search' | '/places/nearby', input: PlaceSearchInput): Promise<PlacesResponse> {
  const { data } = await api.get<{ success: true; data: PlacesResponse }>(path, { params: input })
  return data.data
}

export const placesService = {
  searchPlaces(input: PlaceSearchInput) { return getPlaces('/places/search', input) },
  getNearbyPlaces(input: PlaceSearchInput) { return getPlaces('/places/nearby', input) },
  async getTripStops(tripId: string, category: PlaceCategory): Promise<PlacesResponse> {
    const { data } = await api.get<{ success: true; data: PlacesResponse }>(`/trips/${encodeURIComponent(tripId)}/stops`, { params: { category } })
    return data.data
  },
  async getPlaceDetails(placeId: string): Promise<Place> {
    const { data } = await api.get<{ success: true; data: { place: Place } }>(`/places/${encodeURIComponent(placeId)}`)
    return data.data.place
  },
}
