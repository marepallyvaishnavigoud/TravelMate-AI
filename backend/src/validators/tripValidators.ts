import { z } from 'zod'

export const tripSchema = z.object({
  title: z.string().trim().max(120, 'Trip title must be 120 characters or fewer.').optional(),
  origin: z.string().trim().min(1, 'Please enter your starting location.').max(120),
  destination: z.string().trim().min(1, 'Please enter your destination.').max(120),
  startDate: z.coerce.date({ error: 'Please select a valid start date.' }),
  endDate: z.coerce.date({ error: 'Please select a valid end date.' }),
  travelers: z.coerce.number().int('Travelers must be a whole number.').min(1, 'Travelers must be at least 1.').max(30),
  budget: z.preprocess((value) => value === '' ? Number.NaN : value, z.coerce.number().finite('Enter a valid budget.').min(0, 'Budget cannot be negative.')),
  currency: z.string().trim().length(3).default('INR'),
  transport: z.enum(['car', 'bus', 'train', 'flight']),
  interests: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
}).strict().superRefine((trip, context) => {
  if (trip.endDate < trip.startDate) context.addIssue({ code: 'custom', path: ['endDate'], message: 'End date must not be before the start date.' })
})

export type TripInput = z.infer<typeof tripSchema>

export const routePreviewSchema = z.object({
  origin: z.string().trim().min(1, 'Enter an origin.').max(120),
  destination: z.string().trim().min(1, 'Enter a destination.').max(120),
}).strict().refine((input) => input.origin.toLocaleLowerCase() !== input.destination.toLocaleLowerCase(), {
  message: 'Origin and destination must be different.',
  path: ['destination'],
})
