import { Router } from 'express'
import { dashboardSummary } from '../controllers/savedDestinationController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

export const dashboardRoutes = Router()
dashboardRoutes.get('/summary', authMiddleware, dashboardSummary)
