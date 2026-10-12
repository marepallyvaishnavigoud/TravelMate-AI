import type { RequestHandler } from 'express'
import { z } from 'zod'
import { getOwnedAssistantContext } from '../services/assistantContextService.js'
import { answerTravelQuestion } from '../services/assistantService.js'
import { getCachedWeather } from '../services/weatherService.js'
import { AppError } from '../utils/AppError.js'

export const assistantChatSchema = z.object({
  message: z.string().trim().min(1, 'Enter a travel question.').max(1000, 'Messages must be 1,000 characters or fewer.'),
  tripId: z.string().trim().min(1).max(64).optional(),
}).strict()

export const chatWithAssistantController: RequestHandler = async (request, response) => {
  if (!request.authUser) throw new AppError(401, 'Authentication is required.')
  const input = assistantChatSchema.parse(request.body)
  const context = input.tripId ? await getOwnedAssistantContext(request.authUser.userId, input.tripId) : undefined
  const recentWeather = context && /\b(weather|forecast|temperature|rain tomorrow|will it rain)\b/i.test(input.message) ? getCachedWeather(context.trip.destination) : null
  const result = answerTravelQuestion({
    message: input.message,
    ...(context ? { trip: context.trip, ...(context.itinerary ? { itinerary: context.itinerary } : {}) } : {}),
    ...(recentWeather && context ? { weatherSnapshot: { location: recentWeather.location.name, temperatureC: recentWeather.current.temperatureC, feelsLikeC: recentWeather.current.feelsLikeC, humidityPercent: recentWeather.current.humidityPercent, windSpeedKmh: recentWeather.current.windSpeedKmh, condition: recentWeather.current.condition, time: recentWeather.current.time, timezone: recentWeather.timezone, sourceUrl: recentWeather.source.url } } : {}),
  })
  response.json({ success: true, ...result })
}
