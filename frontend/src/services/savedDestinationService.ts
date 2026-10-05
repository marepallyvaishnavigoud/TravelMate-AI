import { api } from './authService'

export type SavedDestination = { _id: string; destinationId: string; destinationName: string; destinationImage: string; savedAt: string; createdAt: string; updatedAt: string }
export type DashboardSummary = { user: { firstName: string; lastName: string; email: string; createdAt: string }; savedDestinationsCount: number; savedDestinations: SavedDestination[] }

export const savedDestinationService = {
  async getSavedDestinations(): Promise<SavedDestination[]> {
    const { data } = await api.get<{ success: true; data: { savedDestinations: SavedDestination[] } }>('/saved-destinations')
    return data.data.savedDestinations
  },
  async saveDestination(destination: { id: string; name: string; image: string }): Promise<SavedDestination> {
    const { data } = await api.post<{ success: true; data: { savedDestination: SavedDestination } }>(`/saved-destinations/${encodeURIComponent(destination.id)}`, { destinationName: destination.name, destinationImage: destination.image })
    return data.data.savedDestination
  },
  async removeSavedDestination(destinationId: string): Promise<void> {
    await api.delete(`/saved-destinations/${encodeURIComponent(destinationId)}`)
  },
  async checkSavedDestination(destinationId: string): Promise<boolean> {
    const { data } = await api.get<{ success: true; saved: boolean }>(`/saved-destinations/check/${encodeURIComponent(destinationId)}`)
    return data.saved
  },
  async getDashboardSummary(): Promise<DashboardSummary> {
    const { data } = await api.get<{ success: true; data: DashboardSummary }>('/dashboard/summary')
    return data.data
  },
}
