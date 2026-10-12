import { z } from 'zod'

const coordinate = z.string().regex(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/, 'Coordinates must be decimal numbers.').transform(Number)
const location = z.string().trim().min(2, 'Enter at least two characters for a location.').max(120, 'Location must be 120 characters or fewer.')
  .regex(/^[\p{L}\p{N}\s.,'’()\-]+$/u, 'Use a city, region, or country name.')

export const weatherQuerySchema = z.object({
  location: location.optional(),
  latitude: coordinate.optional(),
  longitude: coordinate.optional(),
}).strict().superRefine((query, context) => {
  const hasLatitude = query.latitude !== undefined
  const hasLongitude = query.longitude !== undefined
  if (hasLatitude !== hasLongitude) context.addIssue({ code: 'custom', path: [hasLatitude ? 'longitude' : 'latitude'], message: 'Provide both latitude and longitude.' })
  if (!query.location && !hasLatitude) context.addIssue({ code: 'custom', path: ['location'], message: 'Provide a location or a latitude/longitude pair.' })
  if (query.location && hasLatitude) context.addIssue({ code: 'custom', path: ['location'], message: 'Use a location or coordinates, not both.' })
  if (query.latitude !== undefined && (query.latitude < -90 || query.latitude > 90)) context.addIssue({ code: 'custom', path: ['latitude'], message: 'Latitude must be between -90 and 90.' })
  if (query.longitude !== undefined && (query.longitude < -180 || query.longitude > 180)) context.addIssue({ code: 'custom', path: ['longitude'], message: 'Longitude must be between -180 and 180.' })
})
