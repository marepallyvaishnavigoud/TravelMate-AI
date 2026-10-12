import { AppError } from '../utils/AppError.js'

export type RouteCoordinate = { latitude: number; longitude: number }
export type RouteGeometry = { type: 'LineString'; coordinates: [number, number][] }

type GeocodingFeature = { place_name?: string; center?: [number, number]; context?: Array<{ id?: string; short_code?: string }> }
type DirectionsRoute = { distance?: number; duration?: number; geometry?: RouteGeometry }

export function getMapboxToken(): string {
  const token = process.env.MAPBOX_ACCESS_TOKEN?.trim()
  if (!token || /^(your_|replace_|example|<)/i.test(token) || !/^(sk|pk)\./.test(token)) {
    if (process.env.NODE_ENV !== 'production') console.warn('[mapService] MAPBOX_ACCESS_TOKEN is not configured.')
    throw new AppError(503, 'Set MAPBOX_ACCESS_TOKEN to a real Mapbox token in backend/.env, then restart the backend. Do not use a sample placeholder.')
  }
  return token
}

async function providerJson<T>(url: URL, stage: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(12000) })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.warn('[mapService] Mapbox request could not be reached.', { stage, errorName: error instanceof Error ? error.name : 'UnknownError' })
    throw new AppError(502, 'The map service could not be reached. Please try again.')
  }
  if (!response.ok) {
    if (process.env.NODE_ENV !== 'production') console.warn('[mapService] Mapbox returned an unsuccessful response.', { stage, status: response.status })
    if (response.status === 401 || response.status === 403) {
      throw new AppError(503, 'Mapbox rejected the token. Check that it is active, permitted for geocoding and directions, and has no URL restrictions blocking backend requests.')
    }
    if (response.status === 429) throw new AppError(503, 'Mapbox rate limit reached. Please wait and retry the route.')
    throw new AppError(502, 'The map service could not calculate this route. Check the locations and try again.')
  }
  try { return await response.json() as T }
  catch {
    if (process.env.NODE_ENV !== 'production') console.warn('[mapService] Mapbox returned invalid JSON.', { stage, status: response.status })
    throw new AppError(502, 'The map service returned an invalid response.')
  }
}

export async function geocodeLocation(name: string, stage: 'origin' | 'destination' | 'places'): Promise<{ name: string; countryCode: string | null } & RouteCoordinate> {
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(name)}.json`)
  url.searchParams.set('access_token', getMapboxToken())
  url.searchParams.set('limit', '1')
  url.searchParams.set('types', 'place,locality,region,address')
  const result = await providerJson<{ features?: GeocodingFeature[] }>(url, `geocoding-${stage}`)
  const feature = result.features?.[0]
  if (!feature?.center || feature.center.length < 2) throw new AppError(422, `Unable to find ${name}. Check the location and try again.`)
  const [longitude, latitude] = feature.center
  const countryCode = feature.context?.find((item) => item.id?.startsWith('country.'))?.short_code?.split('-').at(-1)?.toUpperCase() ?? null
  return { name: feature.place_name || name, latitude, longitude, countryCode }
}

export async function getDrivingDirections(origin: RouteCoordinate, destination: RouteCoordinate) {
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`
  const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}`)
  url.searchParams.set('access_token', getMapboxToken())
  url.searchParams.set('geometries', 'geojson')
  url.searchParams.set('overview', 'full')
  const result = await providerJson<{ routes?: DirectionsRoute[] }>(url, 'directions')
  const route = result.routes?.[0]
  if (!route || typeof route.distance !== 'number' || typeof route.duration !== 'number' || !route.geometry?.coordinates?.length) {
    throw new AppError(422, 'A driving route could not be found for these locations.')
  }
  return { distanceKm: route.distance / 1000, durationMinutes: route.duration / 60, geometry: route.geometry }
}
