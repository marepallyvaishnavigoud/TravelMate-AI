import type { RequestHandler } from 'express'
import { AppError } from '../utils/AppError.js'
import { placeSearchSchema } from '../validators/placeValidators.js'
import { getPlaceDetails, searchPlaces } from '../services/places/placesService.js'

export const searchPlacesController: RequestHandler = async (request, response) => {
  const query = placeSearchSchema.parse(request.query)
  const result = await searchPlaces({
    category: query.category,
    textSearch: request.path.endsWith('/search'),
    radiusMeters: query.radius,
    limit: query.limit,
    ...(query.query ? { query: query.query } : {}),
    ...(query.location ? { location: query.location } : {}),
    ...(query.latitude !== undefined ? { latitude: query.latitude } : {}),
    ...(query.longitude !== undefined ? { longitude: query.longitude } : {}),
  })
  response.json({ success: true, data: result })
}

export const getPlaceDetailsController: RequestHandler = async (request, response) => {
  const placeId = request.params.placeId
  if (typeof placeId !== 'string') throw new AppError(400, 'Invalid place ID.')
  const place = await getPlaceDetails(placeId)
  response.json({ success: true, data: { place } })
}
