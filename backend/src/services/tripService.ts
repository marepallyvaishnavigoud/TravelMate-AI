import { Types } from 'mongoose'
import { Trip } from '../models/Trip.js'
import type { TripInput } from '../validators/tripValidators.js'
import { AppError } from '../utils/AppError.js'

function generatedTitle(origin: string, destination: string): string {
  return `${origin} → ${destination} Trip`.slice(0, 120)
}

function tripFields(input: TripInput) {
  return { ...input, title: input.title?.trim() || generatedTitle(input.origin, input.destination) }
}

function objectId(value: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) throw new AppError(404, 'Trip not found.')
  return new Types.ObjectId(value)
}

export async function createTrip(userId: string, input: TripInput) {
  return Trip.create({ ...tripFields(input), userId: new Types.ObjectId(userId) })
}

export async function listTrips(userId: string) {
  return Trip.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean()
}

export async function getTrip(userId: string, id: string) {
  const trip = await Trip.findOne({ _id: objectId(id), userId: new Types.ObjectId(userId) }).lean()
  if (!trip) throw new AppError(404, 'Trip not found.')
  return trip
}

export async function updateTrip(userId: string, id: string, input: TripInput) {
  const trip = await Trip.findOneAndUpdate(
    { _id: objectId(id), userId: new Types.ObjectId(userId) },
    { $set: tripFields(input) },
    { new: true, runValidators: true },
  )
  if (!trip) throw new AppError(404, 'Trip not found.')
  return trip
}

export async function deleteTrip(userId: string, id: string): Promise<void> {
  const trip = await Trip.findOneAndDelete({ _id: objectId(id), userId: new Types.ObjectId(userId) })
  if (!trip) throw new AppError(404, 'Trip not found.')
}
