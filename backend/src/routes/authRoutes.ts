import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { login, logout, me, register } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { validateBody } from '../middleware/validateBody.js'
import { loginSchema, registerSchema } from '../validators/authValidators.js'

export const authRoutes = Router()
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, message: 'Too many sign-in attempts. Try again in a little while.' } })

authRoutes.post('/register', authLimiter, validateBody(registerSchema), register)
authRoutes.post('/login', authLimiter, validateBody(loginSchema), login)
authRoutes.get('/me', authMiddleware, me)
authRoutes.post('/logout', authMiddleware, logout)
