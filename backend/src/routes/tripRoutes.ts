import { Router } from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { createTripController, deleteTripController, getTripController, getTripRouteController, getTripStopsController, listTripsController, updateTripController } from '../controllers/tripController.js'
import { deleteExpensesController, getExpensesController, saveExpensesController } from '../controllers/expenseController.js'

export const tripRoutes = Router()
tripRoutes.use(authMiddleware)
tripRoutes.get('/', listTripsController)
tripRoutes.post('/', createTripController)
tripRoutes.get('/:id/route', getTripRouteController)
tripRoutes.get('/:id/stops', getTripStopsController)
tripRoutes.get('/:id/expenses', getExpensesController)
tripRoutes.post('/:id/expenses', saveExpensesController)
tripRoutes.put('/:id/expenses', saveExpensesController)
tripRoutes.delete('/:id/expenses', deleteExpensesController)
tripRoutes.get('/:id', getTripController)
tripRoutes.put('/:id', updateTripController)
tripRoutes.delete('/:id', deleteTripController)
