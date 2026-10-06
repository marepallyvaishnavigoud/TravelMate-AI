import { z } from 'zod'

const amount = z.coerce.number().finite('Enter a valid amount.').min(0, 'Expenses cannot be negative.').max(1_000_000_000_000, 'Amount is too large.')

export const expenseInputSchema = z.object({
  transportation: amount,
  fuel: amount,
  accommodation: amount,
  food: amount,
  activities: amount,
  tickets: amount,
  parkingTolls: amount,
  other: amount,
  notes: z.string().trim().max(2000, 'Notes must be 2,000 characters or fewer.').default(''),
}).strict()

export type ExpenseInput = z.infer<typeof expenseInputSchema>
