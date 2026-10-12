import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { getWeatherController } from '../controllers/weatherController.js'

export const weatherRoutes = Router()

weatherRoutes.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({ success: false, message: 'Too many weather requests. Please wait before refreshing again.' }),
}))
weatherRoutes.get('/', getWeatherController)
