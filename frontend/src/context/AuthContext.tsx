import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authService, type AuthUser, type RegisterInput } from '../services/authService'

type AuthContextValue = { user: AuthUser | null; isAuthenticated: boolean; loading: boolean; login: (email: string, password: string) => Promise<void>; register: (input: RegisterInput) => Promise<void>; logout: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let active = true
    if (!authService.hasSession()) { setLoading(false); return () => { active = false } }
    authService.getCurrentUser().then((currentUser) => { if (active) setUser(currentUser) }).catch(() => { if (active) setUser(null) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: user !== null,
    loading,
    async login(email, password) { const result = await authService.login(email, password); setUser(result.user) },
    async register(input) { const result = await authService.register(input); setUser(result.user) },
    async logout() { try { await authService.logout() } finally { setUser(null) } },
  }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
