import { AppError } from '../../utils/AppError.js'
import { geocodeLocation } from '../mapService.js'
import { GooglePlacesProvider } from './providers/googlePlacesProvider.js'
import type { Place, PlaceCategory, PlaceSearchInput, PlacesResult } from './types.js'

const provider = new GooglePlacesProvider()

export type SearchPlacesInput = {
  category: PlaceCategory
  query?: string
  location?: string
  latitude?: number
  longitude?: number
  radiusMeters: number
  limit: number
  textSearch?: boolean
}

async function resolveLocation(input: SearchPlacesInput) {
  if (input.latitude !== undefined && input.longitude !== undefined) {
    return { latitude: input.latitude, longitude: input.longitude }
  }
  if (!input.location) throw new AppError(400, 'Provide a location or a latitude and longitude.')
  const location = await geocodeLocation(input.location, 'places')
  return { latitude: location.latitude, longitude: location.longitude }
}

export async function searchPlaces(input: SearchPlacesInput): Promise<PlacesResult> {
  const location = await resolveLocation(input)
  const query = input.textSearch
    ? input.query?.trim() || `${input.category === 'petrol' ? 'petrol stations' : input.category === 'attraction' ? 'tourist attractions' : `${input.category}s`} in ${input.location ?? 'this area'}`
    : input.query?.trim()
  const providerInput: PlaceSearchInput = {
    category: input.category,
    latitude: location.latitude,
    longitude: location.longitude,
    radiusMeters: input.radiusMeters,
    limit: input.limit,
    ...(query ? { query } : {}),
  }
  return provider.search(providerInput)
}

function distanceMeters(first: [number, number], second: [number, number]): number {
  const radians = (value: number) => value * Math.PI / 180
  const dLat = radians(second[1] - first[1])
  const dLon = radians(second[0] - first[0])
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(first[1])) * Math.cos(radians(second[1])) * Math.sin(dLon / 2) ** 2
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function sampleRoute(coordinates: [number, number][]): Array<{ coordinate: [number, number] }> {
  if (coordinates.length < 2) throw new AppError(422, 'The trip route is not available for place search.')
  const cumulative = [0]
  for (let index = 1; index < coordinates.length; index += 1) cumulative.push(cumulative[index - 1]! + distanceMeters(coordinates[index - 1]!, coordinates[index]!))
  const total = cumulative.at(-1) ?? 0
  if (total === 0) return [{ coordinate: coordinates[0]! }]
  return [0, 0.25, 0.5, 0.75, 1].map((fraction) => {
    const target = total * fraction
    let segment = cumulative.findIndex((distance) => distance >= target)
    if (segment <= 0) return { coordinate: coordinates[0]! }
    const segmentStart = cumulative[segment - 1]!
    const segmentDistance = cumulative[segment]! - segmentStart
    const ratio = segmentDistance ? (target - segmentStart) / segmentDistance : 0
    const first = coordinates[segment - 1]!
    const last = coordinates[segment]!
    return { coordinate: [first[0] + (last[0] - first[0]) * ratio, first[1] + (last[1] - first[1]) * ratio] }
  })
}

export async function searchPlacesAlongRoute(input: { category: PlaceCategory; routeCoordinates: [number, number][]; radiusMeters?: number }): Promise<PlacesResult> {
  const samples = sampleRoute(input.routeCoordinates)
  const outcomes = await Promise.all(samples.map(async ({ coordinate }) => {
    const result = await provider.search({ category: input.category, longitude: coordinate[0], latitude: coordinate[1], radiusMeters: input.radiusMeters ?? 5000, limit: 8 })
    return result.places.map((place) => ({ place, distance: distanceMeters(coordinate, [place.longitude, place.latitude]) }))
  }))
  const byId = new Map<string, { place: Place; distance: number }>()
  for (const item of outcomes.flat()) {
    const existing = byId.get(item.place.id)
    if (!existing || item.distance < existing.distance) byId.set(item.place.id, item)
  }
  const places = [...byId.values()].sort((a, b) => a.distance - b.distance).slice(0, 25).map(({ place, distance }) => ({ ...place, distanceFromRoutePointMeters: Math.round(distance) }))
  return { places, source: 'Google Places', dataStatus: 'LIVE', ...(places.length === 0 ? { message: 'No places found nearby.' } : {}) }
}

export async function getPlaceDetails(placeId: string): Promise<Place> {
  return provider.getDetails(placeId)
}
