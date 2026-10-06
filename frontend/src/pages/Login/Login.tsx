import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Plane } from 'lucide-react'
import { Container } from '../../components/ui/Container'
import { useAuth } from '../../context/AuthContext'
import { authErrorMessage } from '../../services/authService'

export function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (loading) return <div className="grid min-h-[60vh] place-items-center text-sm text-slate-400">Loading…</div>
  if (isAuthenticated) return <Navigate to="/profile" replace />
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setNotice(''); setSubmitting(true)
    try {
      await login(email, password)
      const destination = (location.state as { from?: { pathname?: string; search?: string; hash?: string; state?: unknown } } | null)?.from
      navigate(destination ? { pathname: destination.pathname, search: destination.search, hash: destination.hash } : '/profile', { replace: true, state: destination?.state })
    } catch (cause) { setError(authErrorMessage(cause)) }
    finally { setSubmitting(false) }
  }
  return <Container className="py-12 sm:py-16"><div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0B1120] md:grid-cols-[.9fr_1.1fr]">
    <aside className="relative hidden min-h-[560px] flex-col justify-between overflow-hidden bg-[#111827] p-9 md:flex"><div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,rgba(34,211,238,.14),transparent_40%),radial-gradient(ellipse_at_90%_90%,rgba(99,102,241,.2),transparent_45%)]"/><Link to="/" className="relative inline-flex items-center gap-2 text-sm font-semibold text-white"><span className="grid size-9 place-items-center rounded-xl border border-indigo-300/20 bg-indigo-400/10 text-indigo-200"><Plane size={17}/></span>TravelMate AI</Link><div className="relative"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">Go a little further</p><p className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white">The journeys you imagine, thoughtfully planned.</p><p className="mt-4 text-sm leading-6 text-slate-400">Sign in to keep your travel plans close.</p></div><p className="relative text-xs text-slate-500">Discover more. Travel well.</p></aside>
    <div className="p-6 sm:p-10 lg:p-12"><Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white md:hidden"><Plane size={15}/> TravelMate AI</Link><p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">Welcome back</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Sign in to TravelMate</h1><p className="mt-2 text-sm text-slate-400">Pick up where your next journey begins.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-5"><label className="block"><span className="mb-2 block text-xs font-medium text-slate-300">Email</span><input type="email" name="email" autoComplete="email" required value={email} onChange={(event)=>setEmail(event.target.value)} className="min-h-12 w-full rounded-xl border border-white/10 bg-[#070c16] px-4 text-sm text-white outline-none transition focus:border-cyan-200/50" placeholder="you@example.com"/></label><label className="block"><span className="mb-2 block text-xs font-medium text-slate-300">Password</span><input type="password" name="password" autoComplete="current-password" required value={password} onChange={(event)=>setPassword(event.target.value)} className="min-h-12 w-full rounded-xl border border-white/10 bg-[#070c16] px-4 text-sm text-white outline-none transition focus:border-cyan-200/50" placeholder="Enter your password"/></label><div className="flex items-center justify-between"><span className="text-xs text-slate-500">Forgot your password?</span><span className="text-xs text-slate-600">Password reset coming later</span></div>{error&&<p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">{error}</p>}{notice&&<p role="status" className="text-xs text-slate-300">{notice}</p>}<button type="submit" disabled={submitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-wait disabled:opacity-60">{submitting?'Signing in…':'Sign In'}<ArrowRight size={16}/></button></form>
      <p className="mt-6 text-center text-sm text-slate-400">Don’t have an account? <Link to="/register" className="font-semibold text-cyan-200 hover:text-white">Create one</Link></p>
    </div>
  </div></Container>
}
