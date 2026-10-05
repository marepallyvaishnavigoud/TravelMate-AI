import axios, { type AxiosError } from 'axios'

export type AuthUser = { id: string; firstName: string; lastName: string; email: string; avatar: string | null; role: 'user' | 'admin'; createdAt: string }
export type RegisterInput = { firstName: string; lastName: string; email: string; password: string }
type AuthResponse = { success: true; message: string; data: { user: AuthUser; token: string } }
type MeResponse = { success: true; message: string; data: { user: AuthUser } }
type ApiErrorResponse = { success?: false; message?: string; errors?: Array<{ field: string; message: string }> }

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TOKEN_KEY = 'travelmate.auth.token'
export const api = axios.create({ baseURL: API_URL, headers: { 'Content-Type': 'application/json' }, timeout: 12000 })

function readToken(): string | null {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY)
}

// Persistence lives here so this can move to an httpOnly-cookie flow without component changes.
function saveToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token)
}

function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const token = readToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export function authErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const message = error.response?.data?.message
    if (message) return message
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') return 'Can’t reach the TravelMate API. Make sure the backend is running and try again.'
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

export function authFieldErrors(error: unknown): Record<string, string> {
  const axiosError = error as AxiosError<ApiErrorResponse>
  const errors = axiosError.response?.data?.errors
  return errors?.reduce<Record<string, string>>((all, item) => ({ ...all, [item.field]: item.message }), {}) ?? {}
}

async function authenticate(path: '/auth/login' | '/auth/register', payload: object): Promise<{ user: AuthUser }> {
  const { data } = await api.post<AuthResponse>(path, payload)
  saveToken(data.data.token)
  return { user: data.data.user }
}

export const authService = {
  hasSession() { return readToken() !== null },
  login(email: string, password: string) { return authenticate('/auth/login', { email, password }) },
  register(input: RegisterInput) { return authenticate('/auth/register', input) },
  async getCurrentUser(): Promise<AuthUser> {
    const tokenUsedForRequest = readToken()
    try {
      const { data } = await api.get<MeResponse>('/auth/me')
      if (readToken() !== tokenUsedForRequest) throw new Error('Your session changed while your account was loading.')
      return data.data.user
    } catch (error) {
      // A delayed response for an older session must never erase a newer login.
      if (axios.isAxiosError(error) && error.response?.status === 401 && readToken() === tokenUsedForRequest) clearToken()
      throw error
    }
  },
  async logout(): Promise<void> {
    try { if (readToken()) await api.post('/auth/logout') }
    finally { clearToken() }
  },
  clearSession: clearToken,
}
