import axios from 'axios'
import { z } from 'zod'
import { AppError } from '../utils/AppError.js'

const activity = z.object({ id: z.string(), time: z.string(), title: z.string(), description: z.string(), category: z.enum(['transport', 'food', 'attraction', 'rest', 'shopping', 'adventure', 'other']), durationMinutes: z.number().int().positive(), estimatedCost: z.number().nonnegative(), currency: z.string().length(3), verifiedPlace: z.boolean(), genericSuggestion: z.boolean(), period: z.enum(['morning', 'afternoon', 'evening']) })
const itinerarySchema = z.object({
  success: z.literal(true), generationMethod: z.literal('rule-based'),
  tripSummary: z.object({ tripId: z.string().nullable(), title: z.string(), origin: z.string(), destination: z.string(), startDate: z.string(), endDate: z.string(), durationDays: z.number().int(), travelers: z.number().int(), transport: z.string(), interests: z.array(z.string()) }),
  destination: z.string(), summary: z.string(), days: z.array(z.object({ day: z.number().int(), date: z.string(), title: z.string(), summary: z.string(), morning: z.array(activity), afternoon: z.array(activity), evening: z.array(activity), activities: z.array(activity), estimatedDayCost: z.number().nonnegative(), tips: z.array(z.string()) })),
  estimatedTotalCost: z.number().nonnegative(), currency: z.string().length(3), budget: z.number().nonnegative(), budgetRemaining: z.number(),
  budgetEstimate: z.object({ transportation: z.number(), accommodation: z.number(), food: z.number(), activities: z.number(), localTravel: z.number(), miscellaneous: z.number(), appliesTo: z.string() }),
  tips: z.array(z.string()), assumptions: z.array(z.string()), warnings: z.array(z.string()), generatedAt: z.string(),
}).superRefine((value, context) => {
  if (value.days.length !== value.tripSummary.durationDays) context.addIssue({ code: 'custom', path: ['days'], message: 'Day count does not match trip duration.' })
})

export type GeneratedItinerary = z.infer<typeof itinerarySchema>
export type ItineraryRequest = {
  tripId: string; title: string; origin: string; destination: string; startDate: string; endDate: string;
  travelers: number; budget: number; currency: string; transport: 'car' | 'bus' | 'train' | 'flight'; interests: string[];
  pace: 'relaxed' | 'balanced' | 'packed'; accommodationPreference: 'budget' | 'standard' | 'premium'; preferences: string;
}

export async function generateItinerary(trip: ItineraryRequest): Promise<GeneratedItinerary> {
  const serviceUrl = (process.env.AI_SERVICE_URL ?? 'http://127.0.0.1:8001').replace(/\/+$/, '')
  let response
  try {
    response = await axios.post<unknown>(`${serviceUrl}/api/itinerary/generate`, trip, { timeout: 20_000, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 422) throw new AppError(400, 'The trip details could not be used to create an itinerary. Check the dates, travelers, budget, and preferences.')
      if (error.code === 'ECONNABORTED') throw new AppError(504, 'Itinerary generation timed out. Please try again.')
      throw new AppError(503, 'The local itinerary service is unavailable. Start the AI service and try again.')
    }
    throw error
  }
  const parsed = itinerarySchema.safeParse(response.data)
  if (!parsed.success) throw new AppError(502, 'The itinerary service returned an invalid response.')
  return parsed.data
}
