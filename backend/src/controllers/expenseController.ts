import type { RequestHandler } from 'express'
import { deleteTripExpenses, getTripExpenses, saveTripExpenses } from '../services/expenseService.js'
import { expenseInputSchema } from '../validators/expenseValidators.js'
import { AppError } from '../utils/AppError.js'

function currentUserId(request: Parameters<RequestHandler>[0]): string {
  if (!(request as any).authUser) throw new AppError(401, 'Authentication is required.')
  return (request as any).authUser.userId
}

function tripId(request: Parameters<RequestHandler>[0]): string {
  return typeof (request as any).params.id === 'string' ? (request as any).params.id : ''
}

export const getExpensesController: RequestHandler = async (request, response) => {
  const data = await getTripExpenses(currentUserId(request), tripId(request))
  response.json({ success: true, data })
}

export const saveExpensesController: RequestHandler = async (request, response) => {
  const data = await saveTripExpenses(currentUserId(request), tripId(request), expenseInputSchema.parse(request.body))
  response.json({ success: true, message: 'Expenses saved.', data })
}

export const deleteExpensesController: RequestHandler = async (request, response) => {
  await deleteTripExpenses(currentUserId(request), tripId(request))
  response.json({ success: true, message: 'Expenses deleted.' })
}
const authUser = (req as any).authUser;
const params = (req as any).params;