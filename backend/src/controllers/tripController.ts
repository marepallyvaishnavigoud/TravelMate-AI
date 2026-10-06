import type { RequestHandler } from 'express'
import { AppError } from '../utils/AppError.js'
import { createTrip, deleteTrip, getTrip, listTrips, updateTrip } from '../services/tripService.js'
import { tripSchema } from '../validators/tripValidators.js'

function currentUserId(request: Parameters<RequestHandler>[0]): string {
  if (!request.authUser) throw new AppError(401, 'Authentication is required.')
  return request.authUser.userId
}

function tripId(request: Parameters<RequestHandler>[0]): string {
  const id = request.params.id
  if (typeof id !== 'string') throw new AppError(404, 'Trip not found.')
  return id
}

export const createTripController: RequestHandler = async (request, response) => {
  const trip = await createTrip(currentUserId(request), tripSchema.parse(request.body))
  response.status(201).json({ success: true, message: 'Trip created.', data: { trip } })
}

export const listTripsController: RequestHandler = async (request, response) => {
  const trips = await listTrips(currentUserId(request))
  response.json({ success: true, data: { trips } })
}

export const getTripController: RequestHandler = async (request, response) => {
  const trip = await getTrip(currentUserId(request), tripId(request))
  response.json({ success: true, data: { trip } })
}

export const updateTripController: RequestHandler = async (request, response) => {
  const trip = await updateTrip(currentUserId(request), tripId(request), tripSchema.parse(request.body))
  response.json({ success: true, message: 'Trip updated.', data: { trip } })
}

export const deleteTripController: RequestHandler = async (request, response) => {
  await deleteTrip(currentUserId(request), tripId(request))
  response.json({ success: true, message: 'Trip deleted.' })
}
