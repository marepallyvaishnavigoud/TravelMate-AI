import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { chatWithAssistantController } from '../controllers/assistantController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

export const assistantRoutes = Router()

assistantRoutes.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_request, response) => response.status(429).json({ success: false, message: 'Too many assistant messages. Please wait a little and try again.' }),
}))
assistantRoutes.use(authMiddleware)
assistantRoutes.post('/chat', chatWithAssistantController)
