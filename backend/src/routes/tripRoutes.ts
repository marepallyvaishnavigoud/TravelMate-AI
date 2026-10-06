import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { createTripController, deleteTripController, getTripController, getTripRouteController, listTripsController, updateTripController } from '../controllers/tripController.js'

export const tripRoutes = Router()
tripRoutes.use(authMiddleware)
tripRoutes.get('/', listTripsController)
tripRoutes.post('/', createTripController)
tripRoutes.get('/:id/route', getTripRouteController)
tripRoutes.get('/:id', getTripController)
tripRoutes.put('/:id', updateTripController)
tripRoutes.delete('/:id', deleteTripController)
