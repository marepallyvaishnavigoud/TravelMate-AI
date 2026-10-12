import type { RequestHandler } from 'express'
import { getWeather } from '../services/weatherService.js'
import { weatherQuerySchema } from '../validators/weatherValidators.js'

export const getWeatherController: RequestHandler = async (request, response) => {
  const input = weatherQuerySchema.parse(request.query)
  const result = await getWeather(input.location ? { location: input.location } : { latitude: input.latitude!, longitude: input.longitude! })
  response.json({ success: true, data: result })
}
