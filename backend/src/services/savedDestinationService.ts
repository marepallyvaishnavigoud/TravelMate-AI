import { Types } from 'mongoose'
import { SavedDestination } from '../models/SavedDestination.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import type { z } from 'zod'
import type { saveDestinationSchema } from '../validators/savedDestinationValidators.js'

export async function saveDestination(userId: string, destinationId: string, snapshot: z.infer<typeof saveDestinationSchema>) {
  try {
    return await SavedDestination.create({ userId: new Types.ObjectId(userId), destinationId, ...snapshot })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      throw new AppError(409, 'This destination is already saved.')
    }
    throw error
  }
}

export async function removeSavedDestination(userId: string, destinationId: string): Promise<void> {
  const result = await SavedDestination.deleteOne({ userId: new Types.ObjectId(userId), destinationId })
  if (!result.deletedCount) throw new AppError(404, 'This destination is not in your saved list.')
}

export async function getSavedDestinations(userId: string) {
  return SavedDestination.find({ userId: new Types.ObjectId(userId) }).sort({ savedAt: -1 }).lean()
}

export async function checkSavedDestination(userId: string, destinationId: string): Promise<boolean> {
  return (await SavedDestination.exists({ userId: new Types.ObjectId(userId), destinationId })) !== null
}

export async function getDashboardSummary(userId: string) {
  const [user, savedDestinations, savedDestinationsCount] = await Promise.all([
    User.findById(userId).select('firstName lastName email createdAt').lean(),
    getSavedDestinations(userId),
    SavedDestination.countDocuments({ userId: new Types.ObjectId(userId) }),
  ])
  if (!user) throw new AppError(401, 'Your account could not be found. Please sign in again.')
  return { user: { firstName: user.firstName, lastName: user.lastName, email: user.email, createdAt: user.createdAt }, savedDestinationsCount, savedDestinations }
}
