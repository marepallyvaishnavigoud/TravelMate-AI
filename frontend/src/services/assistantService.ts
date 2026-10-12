import { api } from './authService'

export type AssistantReply = { success: true; reply: string; source: 'local_rules' | 'open_meteo'; limitations: string[] }

export const assistantService = {
  async chat(message: string, tripId?: string): Promise<AssistantReply> {
    const { data } = await api.post<AssistantReply>('/assistant/chat', { message, ...(tripId ? { tripId } : {}) })
    return data
  },
}
