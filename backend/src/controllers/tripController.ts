import { generateItinerary } from '../services/aiService.js'
import type { RequestHandler } from 'express'
import { AppError } from '../utils/AppError.js'
import { createTrip, deleteTrip, getTrip, listTrips, updateTrip } from '../services/tripService.js'
import { routePreviewSchema, tripSchema } from '../validators/tripValidators.js'
import { getDrivingDirections, geocodeLocation } from '../services/mapService.js'
import { searchPlacesAlongRoute } from '../services/places/placesService.js'
import { tripStopsSchema } from '../validators/placeValidators.js'
import { Itinerary } from '../models/Itinerary.js'
import { Types } from 'mongoose'
import { z } from 'zod'

const itineraryPreferencesSchema = z.object({
  pace: z.enum(['relaxed', 'balanced', 'packed']).default('balanced'),
  accommodationPreference: z.enum(['budget', 'standard', 'premium']).default('standard'),
  preferences: z.string().trim().max(500).default(''),
}).strict()

export const getTripItineraryController: RequestHandler = async (request, response) => {
  const userId = currentUserId(request)
  const id = tripId(request)
  await getTrip(userId, id)
  const saved = await Itinerary.findOne({ tripId: new Types.ObjectId(id), userId: new Types.ObjectId(userId) }).lean()
  if (!saved) throw new AppError(404, 'No saved itinerary exists for this trip yet.')
  response.json({ success: true, data: { itinerary: saved.itinerary, createdAt: saved.createdAt, updatedAt: saved.updatedAt } })
}

function currentUserId(request: Parameters<RequestHandler>[0]): string {
  if (!(request as any).authUser) throw new AppError(401, 'Authentication is required.')
  return (request as any).authUser.userId
}

function tripId(request: Parameters<RequestHandler>[0]): string {
  const id = (request as any).params.id
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

export const getTripRouteController: RequestHandler = async (request, response) => {
  const trip = await getTrip(currentUserId(request), tripId(request))
  if (trip.transport !== 'car') {
    response.json({ success: true, data: { supported: false, message: 'Road routing is currently available for car travel only.' } })
    return
  }
  const origin = await geocodeLocation(trip.origin, 'origin')
  const destination = await geocodeLocation(trip.destination, 'destination')
  const route = await getDrivingDirections(origin, destination)
  response.json({ success: true, data: { supported: true, origin, destination, ...route, travelMode: 'driving' } })
}

export const previewDrivingRouteController: RequestHandler = async (request, response) => {
  const input = routePreviewSchema.parse(request.body)
  const origin = await geocodeLocation(input.origin, 'origin')
  const destination = await geocodeLocation(input.destination, 'destination')
  const route = await getDrivingDirections(origin, destination)
  response.json({ success: true, data: { supported: true, origin, destination, ...route, travelMode: 'driving' } })
}

export const getTripStopsController: RequestHandler = async (request, response) => {
  const trip = await getTrip(currentUserId(request), tripId(request))
  const { category } = tripStopsSchema.parse(request.query)
  if (trip.transport !== 'car') {
    response.json({ success: true, data: { places: [], source: 'Google Places', dataStatus: 'UNAVAILABLE', message: 'Smart Stops are currently available for car trips only.' } })
    return
  }
  const origin = await geocodeLocation(trip.origin, 'origin')
  const destination = await geocodeLocation(trip.destination, 'destination')
  const route = await getDrivingDirections(origin, destination)
  const result = await searchPlacesAlongRoute({
    category,
    routeCoordinates: route.geometry.coordinates,
  })
  response.json({ success: true, data: result })
}

export const updateTripController: RequestHandler = async (request, response) => {
  const trip = await updateTrip(currentUserId(request), tripId(request), tripSchema.parse(request.body))
  response.json({ success: true, message: 'Trip updated.', data: { trip } })
}

export const deleteTripController: RequestHandler = async (request, response) => {
  await deleteTrip(currentUserId(request), tripId(request))
  response.json({ success: true, message: 'Trip deleted.' })
}
export const generateTripItineraryController: RequestHandler = async (request, response) => {
  const userId = currentUserId(request)
  const id = tripId(request)
  const trip = await getTrip(userId, id)
  const preferences = itineraryPreferencesSchema.parse(request.body ?? {})

  const itinerary = await generateItinerary({
    tripId: trip._id.toString(),
    title: trip.title,
    origin: trip.origin,
    destination: trip.destination,
    startDate: trip.startDate.toISOString().slice(0, 10),
    endDate: trip.endDate.toISOString().slice(0, 10),
    travelers: trip.travelers,
    budget: trip.budget,
    currency: trip.currency,
    transport: trip.transport,
    interests: trip.interests,
    ...preferences,
  })

  await Itinerary.findOneAndUpdate(
    { tripId: new Types.ObjectId(id), userId: new Types.ObjectId(userId) },
    { $set: { generationMethod: itinerary.generationMethod, itinerary } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  )

  response.json({
    success: true,
    message: 'Itinerary generated successfully.',
    data: { itinerary },
  })
}
