import { api } from './authService'

export type TripTransport = 'car' | 'bus' | 'train' | 'flight'
export type Trip = {
  _id: string
  title: string
  origin: string
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  currency: string
  transport: TripTransport
  interests: string[]
  status: 'planning' | 'upcoming' | 'completed'
  createdAt: string
  updatedAt: string
}
export type TripInput = Omit<Trip, '_id' | 'status' | 'createdAt' | 'updatedAt'>
export type TripRoute = {
  supported: true
  origin: { name: string; latitude: number; longitude: number }
  destination: { name: string; latitude: number; longitude: number }
  distanceKm: number
  durationMinutes: number
  geometry: { type: 'LineString'; coordinates: [number, number][] }
  travelMode: 'driving'
} | { supported: false; message: string }

export type ItineraryActivity = {
  id: string
  time: string
  title: string
  description: string
  category: 'transport' | 'food' | 'attraction' | 'rest' | 'shopping' | 'adventure' | 'other'
  durationMinutes: number
  estimatedCost: number
  currency: string
  verifiedPlace: boolean
  genericSuggestion: boolean
  period: 'morning' | 'afternoon' | 'evening'
}

export type ItineraryDay = {
  day: number
  date: string
  title: string
  summary: string
  activities: ItineraryActivity[]
  estimatedDayCost: number
  morning: ItineraryActivity[]
  afternoon: ItineraryActivity[]
  evening: ItineraryActivity[]
  tips: string[]
}

export type GeneratedItinerary = {
  destination: string
  summary: string
  days: ItineraryDay[]
  estimatedTotalCost: number
  tips: string[]
  warnings: string[]
  success: true
  generationMethod: 'rule-based'
  tripSummary: { tripId: string | null; title: string; origin: string; destination: string; startDate: string; endDate: string; durationDays: number; travelers: number; transport: string; interests: string[] }
  budget: number
  budgetRemaining: number
  budgetEstimate: { transportation: number; accommodation: number; food: number; activities: number; localTravel: number; miscellaneous: number; appliesTo: string }
  assumptions: string[]
  generatedAt: string
}

export const tripService = {
  async createTrip(input: TripInput): Promise<Trip> {
    const { data } = await api.post<{ success: true; data: { trip: Trip } }>('/trips', input)
    return data.data.trip
  },
  async getTrips(): Promise<Trip[]> {
    const { data } = await api.get<{ success: true; data: { trips: Trip[] } }>('/trips')
    return data.data.trips
  },
  async getTripById(id: string): Promise<Trip> {
    const { data } = await api.get<{ success: true; data: { trip: Trip } }>(`/trips/${encodeURIComponent(id)}`)
    return data.data.trip
  },
  async updateTrip(id: string, input: TripInput): Promise<Trip> {
    const { data } = await api.put<{ success: true; data: { trip: Trip } }>(`/trips/${encodeURIComponent(id)}`, input)
    return data.data.trip
  },
  async deleteTrip(id: string): Promise<void> {
    await api.delete(`/trips/${encodeURIComponent(id)}`)
  },
  async getTripRoute(id: string): Promise<TripRoute> {
    const { data } = await api.get<{ success: true; data: TripRoute }>(`/trips/${encodeURIComponent(id)}/route`, { timeout: 45000 })
    return data.data
  },
  async generateTripItinerary(id: string, preferences: { pace: 'relaxed' | 'balanced' | 'packed'; accommodationPreference: 'budget' | 'standard' | 'premium'; preferences: string }): Promise<GeneratedItinerary> {
    const { data } = await api.post<{ success: true; data: { itinerary: GeneratedItinerary } }>(
      `/trips/${encodeURIComponent(id)}/itinerary/generate`,
      preferences,
      { timeout: 25000 },
    )
    return data.data.itinerary
  },
  async getTripItinerary(id: string): Promise<GeneratedItinerary> {
    const { data } = await api.get<{ success: true; data: { itinerary: GeneratedItinerary } }>(`/trips/${encodeURIComponent(id)}/itinerary`)
    return data.data.itinerary
  },
}
