import { z } from 'zod'
import { placeCategories } from '../services/places/types.js'

export const placeSearchSchema = z.object({
  category: z.enum(placeCategories),
  query: z.string().trim().min(1).max(256).optional(),
  location: z.string().trim().min(1).max(120).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(100).max(50000).default(10000),
  limit: z.coerce.number().int().min(1).max(25).default(12),
}).refine((value) => Boolean(value.location) || (value.latitude !== undefined && value.longitude !== undefined), {
  message: 'Provide a location or both latitude and longitude.',
}).refine((value) => (value.latitude === undefined) === (value.longitude === undefined), {
  message: 'Latitude and longitude must be provided together.',
})

export const tripStopsSchema = z.object({ category: z.enum(placeCategories) })

export type PlaceSearchQuery = z.infer<typeof placeSearchSchema>
