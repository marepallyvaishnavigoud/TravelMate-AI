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
}
