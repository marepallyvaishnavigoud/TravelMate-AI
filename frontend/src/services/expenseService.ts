import { api } from './authService'

export const expenseCategories = [
  { key: 'transportation', label: 'Transportation' },
  { key: 'fuel', label: 'Fuel' },
  { key: 'accommodation', label: 'Hotel / Accommodation' },
  { key: 'food', label: 'Food' },
  { key: 'activities', label: 'Activities' },
  { key: 'tickets', label: 'Tickets / Entry fees' },
  { key: 'parkingTolls', label: 'Parking / Tolls' },
  { key: 'other', label: 'Other expenses' },
] as const

export type ExpenseCategory = typeof expenseCategories[number]['key']
export type ExpenseInput = Record<ExpenseCategory, number> & { notes: string }
export type TripExpenseData = {
  trip: { _id: string; title: string; origin: string; destination: string; startDate: string; endDate: string; travelers: number; budget: number; currency: string; transport: string }
  expense: (ExpenseInput & { total: number; currency: string }) | null
  summary: Record<ExpenseCategory, number> & { total: number; currency: string; budget: number; remainingBudget: number; perPersonCost: number; travelers: number; budgetUsagePercentage: number | null; budgetStatus: 'under-budget' | 'near-budget' | 'over-budget' | 'no-budget' }
}

export const emptyExpenseInput: ExpenseInput = { transportation: 0, fuel: 0, accommodation: 0, food: 0, activities: 0, tickets: 0, parkingTolls: 0, other: 0, notes: '' }

export const expenseService = {
  async get(tripId: string): Promise<TripExpenseData> {
    const { data } = await api.get<{ success: true; data: TripExpenseData }>(`/trips/${encodeURIComponent(tripId)}/expenses`)
    return data.data
  },
  async save(tripId: string, input: ExpenseInput): Promise<TripExpenseData> {
    const { data } = await api.put<{ success: true; data: TripExpenseData }>(`/trips/${encodeURIComponent(tripId)}/expenses`, input)
    return data.data
  },
  async delete(tripId: string): Promise<void> {
    await api.delete(`/trips/${encodeURIComponent(tripId)}/expenses`)
  },
}
