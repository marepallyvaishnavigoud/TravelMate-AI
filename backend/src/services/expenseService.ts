import { Types } from 'mongoose'
import { Expense } from '../models/Expense.js'
import { Trip } from '../models/Trip.js'
import type { ExpenseInput } from '../validators/expenseValidators.js'
import { AppError } from '../utils/AppError.js'

const categories = ['transportation', 'fuel', 'accommodation', 'food', 'activities', 'tickets', 'parkingTolls', 'other'] as const

function objectId(value: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(value)) throw new AppError(404, 'Trip not found.')
  return new Types.ObjectId(value)
}

async function getOwnedTrip(userId: string, tripId: string) {
  const trip = await Trip.findOne({ _id: objectId(tripId), userId: new Types.ObjectId(userId) }).lean()
  if (!trip) throw new AppError(404, 'Trip not found.')
  return trip
}

function summarize(expense: Record<string, unknown> | null, trip: { budget: number; travelers: number; currency: string }) {
  const amounts = Object.fromEntries(categories.map((category) => [category, Number(expense?.[category] ?? 0)])) as Record<(typeof categories)[number], number>
  const total = categories.reduce((sum, category) => sum + amounts[category], 0)
  const budget = trip.budget
  const usage = budget > 0 ? (total / budget) * 100 : total > 0 ? null : 0
  const status = budget === 0 ? (total > 0 ? 'over-budget' : 'no-budget') : usage !== null && usage > 100 ? 'over-budget' : usage !== null && usage >= 70 ? 'near-budget' : 'under-budget'
  return {
    expense: expense ? { ...expense, ...amounts, total } : null,
    summary: {
      ...amounts, total, currency: trip.currency, budget,
      remainingBudget: budget - total,
      perPersonCost: trip.travelers > 0 ? total / trip.travelers : total,
      travelers: trip.travelers,
      budgetUsagePercentage: usage,
      budgetStatus: status,
    },
  }
}

export async function getTripExpenses(userId: string, tripId: string) {
  const trip = await getOwnedTrip(userId, tripId)
  const expense = await Expense.findOne({ tripId: trip._id, userId: trip.userId }).lean()
  return { trip, ...summarize(expense as Record<string, unknown> | null, trip) }
}

export async function saveTripExpenses(userId: string, tripId: string, input: ExpenseInput) {
  const trip = await getOwnedTrip(userId, tripId)
  const total = categories.reduce((sum, category) => sum + input[category], 0)
  const expense = await Expense.findOneAndUpdate(
    { tripId: trip._id, userId: trip.userId },
    { $set: { ...input, total, currency: trip.currency, userId: trip.userId, tripId: trip._id } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean()
  return { trip, ...summarize(expense as Record<string, unknown> | null, trip) }
}

export async function deleteTripExpenses(userId: string, tripId: string) {
  const trip = await getOwnedTrip(userId, tripId)
  await Expense.deleteOne({ tripId: trip._id, userId: trip.userId })
}
