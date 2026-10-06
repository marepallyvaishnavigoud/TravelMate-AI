export const placeCategories = ['hotel', 'restaurant', 'attraction', 'petrol', 'cafe'] as const
export type PlaceCategory = typeof placeCategories[number]
export type PlaceDataStatus = 'LIVE' | 'UNAVAILABLE'

export type PlacePhoto = { name: string; widthPx: number | null; heightPx: number | null; authorAttributions: Array<{ displayName: string; uri: string | null }> }

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
  photos: PlacePhoto[]
  description: string | null
  providerCategories: string[]
  distanceFromRoutePointMeters?: number
  source: 'Google Places'
  dataStatus: 'LIVE'
}

export type PlaceSearchInput = {
  category: PlaceCategory
  latitude: number
  longitude: number
  radiusMeters: number
  limit: number
  query?: string
}

export type PlacesResult = {
  places: Place[]
  source: string
  dataStatus: PlaceDataStatus
  message?: string
}

export interface PlacesProvider {
  search(input: PlaceSearchInput): Promise<PlacesResult>
  getDetails(placeId: string, category?: PlaceCategory): Promise<Place>
}
