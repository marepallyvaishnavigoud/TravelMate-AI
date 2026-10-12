import { Types } from 'mongoose'
import { Itinerary } from '../models/Itinerary.js'
import { Trip } from '../models/Trip.js'
import { AppError } from '../utils/AppError.js'
import type { AssistantItineraryContext, AssistantTripContext } from './assistantService.js'

export type OwnedAssistantContext = { trip: AssistantTripContext; itinerary?: AssistantItineraryContext }
export type AssistantContextRepository = {
  findTrip: (tripId: string, userId: string) => Promise<AssistantTripContext | null>
  findItinerary: (tripId: string, userId: string) => Promise<AssistantItineraryContext | null>
}

const mongoRepository: AssistantContextRepository = {
  async findTrip(tripId, userId) {
    const trip = await Trip.findOne({ _id: new Types.ObjectId(tripId), userId: new Types.ObjectId(userId) })
      .select('title origin destination startDate endDate travelers budget currency transport interests').lean()
    if (!trip) return null
    return {
      title: trip.title, origin: trip.origin, destination: trip.destination,
      startDate: trip.startDate.toISOString(), endDate: trip.endDate.toISOString(),
      travelers: trip.travelers, budget: trip.budget, currency: trip.currency,
      transport: trip.transport, interests: trip.interests,
    }
  },
  async findItinerary(tripId, userId) {
    const saved = await Itinerary.findOne({ tripId: new Types.ObjectId(tripId), userId: new Types.ObjectId(userId) })
      .select('itinerary').lean()
    return (saved?.itinerary as AssistantItineraryContext | undefined) ?? null
  },
}

export async function getOwnedAssistantContext(userId: string, tripId: string, repository = mongoRepository): Promise<OwnedAssistantContext> {
  if (!Types.ObjectId.isValid(tripId)) throw new AppError(404, 'Trip not found.')
  const trip = await repository.findTrip(tripId, userId)
  if (!trip) throw new AppError(404, 'Trip not found.')
  const itinerary = await repository.findItinerary(tripId, userId)
  return itinerary ? { trip, itinerary } : { trip }
}
