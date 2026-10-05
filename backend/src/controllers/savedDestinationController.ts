import type { RequestHandler } from 'express'
import { AppError } from '../utils/AppError.js'
import { checkSavedDestination, getDashboardSummary, getSavedDestinations, removeSavedDestination, saveDestination } from '../services/savedDestinationService.js'
import { destinationIdSchema, saveDestinationSchema } from '../validators/savedDestinationValidators.js'

function authId(request: Parameters<RequestHandler>[0]): string {
  if (!request.authUser) throw new AppError(401, 'Authentication is required.')
  return request.authUser.userId
}

function destinationId(request: Parameters<RequestHandler>[0]): string {
  return destinationIdSchema.parse(request.params.destinationId)
}

export const createSavedDestination: RequestHandler = async (request, response) => {
  const item = await saveDestination(authId(request), destinationId(request), saveDestinationSchema.parse(request.body))
  response.status(201).json({ success: true, message: 'Destination saved.', data: { savedDestination: item } })
}
export const deleteSavedDestination: RequestHandler = async (request, response) => {
  await removeSavedDestination(authId(request), destinationId(request))
  response.json({ success: true, message: 'Destination removed from your saved list.' })
}
export const listSavedDestinations: RequestHandler = async (request, response) => {
  const savedDestinations = await getSavedDestinations(authId(request))
  response.json({ success: true, data: { savedDestinations } })
}
export const savedDestinationStatus: RequestHandler = async (request, response) => {
  const saved = await checkSavedDestination(authId(request), destinationId(request))
  response.json({ success: true, saved })
}
export const dashboardSummary: RequestHandler = async (request, response) => {
  const data = await getDashboardSummary(authId(request))
  response.json({ success: true, data })
}
