import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { getPlaceDetailsController, searchPlacesController } from '../controllers/placesController.js'

export const placesRoutes = Router()
placesRoutes.use(authMiddleware)
placesRoutes.get('/search', searchPlacesController)
placesRoutes.get('/nearby', searchPlacesController)
placesRoutes.get('/:placeId', getPlaceDetailsController)
