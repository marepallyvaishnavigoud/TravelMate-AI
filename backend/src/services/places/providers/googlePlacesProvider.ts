import { AppError } from '../../../utils/AppError.js'
import type { Place, PlaceCategory, PlacePhoto, PlaceSearchInput, PlacesProvider, PlacesResult } from '../types.js'

const source = 'Google Places'
const endpoint = 'https://places.googleapis.com/v1'
const supportedTypes: Record<PlaceCategory, string> = {
  hotel: 'hotel',
  restaurant: 'restaurant',
  attraction: 'tourist_attraction',
  petrol: 'gas_station',
  cafe: 'cafe',
}
const searchFields = [
  'places.id', 'places.displayName', 'places.formattedAddress', 'places.location', 'places.types', 'places.primaryType',
  'places.rating', 'places.userRatingCount', 'places.priceLevel', 'places.regularOpeningHours.weekdayDescriptions',
  'places.websiteUri', 'places.googleMapsUri', 'places.photos.name', 'places.photos.widthPx', 'places.photos.heightPx',
  'places.photos.authorAttributions.displayName', 'places.photos.authorAttributions.uri',
].join(',')
const detailsFields = searchFields.split(',').map((field) => field.replace(/^places\./, '')).join(',')

type GooglePhoto = { name?: string; widthPx?: number; heightPx?: number; authorAttributions?: Array<{ displayName?: string; uri?: string }> }
type GooglePlace = {
  id?: string
  displayName?: { text?: string }
  formattedAddress?: string
  location?: { latitude?: number; longitude?: number }
  types?: string[]
  primaryType?: string
  rating?: number
  userRatingCount?: number
  priceLevel?: string
  regularOpeningHours?: { weekdayDescriptions?: string[] }
  websiteUri?: string
  googleMapsUri?: string
  photos?: GooglePhoto[]
}

function apiKey(): string {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) throw new AppError(503, 'Places are temporarily unavailable. Please try again.')
  return key
}

function normalize(photo: GooglePhoto): PlacePhoto | null {
  if (!photo.name) return null
  return {
    name: photo.name,
    widthPx: typeof photo.widthPx === 'number' ? photo.widthPx : null,
    heightPx: typeof photo.heightPx === 'number' ? photo.heightPx : null,
    authorAttributions: (photo.authorAttributions ?? []).filter((author) => Boolean(author.displayName)).map((author) => ({ displayName: author.displayName!, uri: author.uri ?? null })),
  }
}

function toPlace(item: GooglePlace, category: PlaceCategory): Place | null {
  const id = item.id
  const name = item.displayName?.text
  const latitude = item.location?.latitude
  const longitude = item.location?.longitude
  if (!id || !name || typeof latitude !== 'number' || typeof longitude !== 'number') return null
  return {
    id,
    name,
    category,
    latitude,
    longitude,
    address: item.formattedAddress ?? null,
    image: null,
    rating: typeof item.rating === 'number' ? item.rating : null,
    userRatingCount: typeof item.userRatingCount === 'number' ? item.userRatingCount : null,
    priceLevel: item.priceLevel ?? null,
    openingHours: item.regularOpeningHours?.weekdayDescriptions ?? null,
    websiteUri: item.websiteUri ?? null,
    googleMapsUri: item.googleMapsUri ?? null,
    photos: (item.photos ?? []).map(normalize).filter((photo): photo is PlacePhoto => photo !== null),
    description: null,
    providerCategories: [...new Set([...(item.primaryType ? [item.primaryType] : []), ...(item.types ?? [])])],
    source,
    dataStatus: 'LIVE',
  }
}

async function googleRequest<T>(url: string, body: unknown, fields: string, stage: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey(), 'X-Goog-FieldMask': fields },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(12000),
    })
  } catch (error) {
    if (error instanceof AppError) throw error
    console.warn('[places] Google Places request failed.', { stage, errorName: error instanceof Error ? error.name : 'UnknownError' })
    throw new AppError(502, 'Places are temporarily unavailable. Please try again.')
  }
  if (!response.ok) {
    console.warn('[places] Google Places returned an unsuccessful response.', { stage, status: response.status })
    if (response.status === 400) throw new AppError(400, 'Check the place search and try again.')
    if (response.status === 401 || response.status === 403 || response.status === 429) throw new AppError(503, 'Places are temporarily unavailable. Please try again.')
    throw new AppError(502, 'Places are temporarily unavailable. Please try again.')
  }
  try { return await response.json() as T }
  catch {
    console.warn('[places] Google Places returned invalid JSON.', { stage, status: response.status })
    throw new AppError(502, 'Places are temporarily unavailable. Please try again.')
  }
}

function validateCategory(category: PlaceCategory): string {
  const type = supportedTypes[category]
  if (!type) throw new AppError(400, 'This place category is not supported.')
  return type
}

export class GooglePlacesProvider implements PlacesProvider {
  async search(input: PlaceSearchInput): Promise<PlacesResult> {
    const type = validateCategory(input.category)
    const radius = Math.max(100, Math.min(input.radiusMeters, 50_000))
    const body = input.query?.trim()
      ? {
          textQuery: input.query.trim(),
          includedType: type,
          locationBias: { circle: { center: { latitude: input.latitude, longitude: input.longitude }, radius } },
          maxResultCount: Math.max(1, Math.min(input.limit, 20)),
          languageCode: 'en',
        }
      : {
          includedTypes: [type],
          locationRestriction: { circle: { center: { latitude: input.latitude, longitude: input.longitude }, radius } },
          maxResultCount: Math.max(1, Math.min(input.limit, 20)),
          rankPreference: 'DISTANCE',
          languageCode: 'en',
        }
    const path = input.query?.trim() ? 'places:searchText' : 'places:searchNearby'
    const result = await googleRequest<{ places?: GooglePlace[] }>(`${endpoint}/${path}`, body, searchFields, path)
    return { places: (result.places ?? []).map((place) => toPlace(place, input.category)).filter((place): place is Place => place !== null), source, dataStatus: 'LIVE' }
  }

  async getDetails(placeId: string, category: PlaceCategory = 'attraction'): Promise<Place> {
    const id = placeId.trim()
    if (!id || id.length > 256 || /[?#]/.test(id)) throw new AppError(400, 'Invalid place ID.')
    const url = `${endpoint}/places/${encodeURIComponent(id)}`
    let response: Response
    try {
      response = await fetch(url, { headers: { 'X-Goog-Api-Key': apiKey(), 'X-Goog-FieldMask': detailsFields }, signal: AbortSignal.timeout(12000) })
    } catch (error) {
      if (error instanceof AppError) throw error
      console.warn('[places] Google Place Details request failed.', { errorName: error instanceof Error ? error.name : 'UnknownError' })
      throw new AppError(502, 'Places are temporarily unavailable. Please try again.')
    }
    if (!response.ok) {
      console.warn('[places] Google Place Details returned an unsuccessful response.', { status: response.status })
      if (response.status === 400) throw new AppError(400, 'Invalid place ID.')
      if (response.status === 404) throw new AppError(404, 'Place not found.')
      if (response.status === 401 || response.status === 403 || response.status === 429) throw new AppError(503, 'Places are temporarily unavailable. Please try again.')
      throw new AppError(502, 'Places are temporarily unavailable. Please try again.')
    }
    let item: GooglePlace
    try { item = await response.json() as GooglePlace }
    catch {
      console.warn('[places] Google Place Details returned invalid JSON.', { status: response.status })
      throw new AppError(502, 'Places are temporarily unavailable. Please try again.')
    }
    const detectedTypes = [item.primaryType, ...(item.types ?? [])]
    const detectedCategory = (Object.entries(supportedTypes).find(([, type]) => detectedTypes.includes(type))?.[0] ?? category) as PlaceCategory
    const place = toPlace(item, detectedCategory)
    if (!place) throw new AppError(502, 'Places are temporarily unavailable. Please try again.')
    return place
  }
}
