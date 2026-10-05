import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { createSavedDestination, deleteSavedDestination, listSavedDestinations, savedDestinationStatus } from '../controllers/savedDestinationController.js'

export const savedDestinationRoutes = Router()
savedDestinationRoutes.use(authMiddleware)
savedDestinationRoutes.get('/', listSavedDestinations)
savedDestinationRoutes.get('/check/:destinationId', savedDestinationStatus)
savedDestinationRoutes.post('/:destinationId', createSavedDestination)
savedDestinationRoutes.delete('/:destinationId', deleteSavedDestination)
