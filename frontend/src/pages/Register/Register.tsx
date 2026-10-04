import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Plane } from 'lucide-react'
import { Container } from '../../components/ui/Container'
import { useAuth } from '../../context/AuthContext'
import { authErrorMessage, authFieldErrors } from '../../services/authService'

export function Register() {
  const { register, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName:'',lastName:'',email:'',password:'',confirmPassword:'' })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})
  const [submitting, setSubmitting] = useState(false)
  if (loading) return <div className="grid min-h-[60vh] place-items-center text-sm text-slate-400">Loading…</div>
  if (isAuthenticated) return <Navigate to="/profile" replace />
  const update = (field: keyof typeof form, value: string) => setForm((current)=>({...current,[field]:value}))
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();setError('');setFieldErrors({})
    if(form.password!==form.confirmPassword){setFieldErrors({confirmPassword:'Passwords do not match.'});return}
    if(form.password.length<8){setFieldErrors({password:'Use at least 8 characters.'});return}
    setSubmitting(true)
    try { await register({firstName:form.firstName,lastName:form.lastName,email:form.email,password:form.password});navigate('/profile',{replace:true}) }
    catch(cause){setError(authErrorMessage(cause));setFieldErrors(authFieldErrors(cause))}
    finally{setSubmitting(false)}
  }
  const fields: Array<{key:'firstName'|'lastName'|'email'|'password'|'confirmPassword';label:string;type:string;autocomplete:string;placeholder:string}> = [
    {key:'firstName',label:'First name',type:'text',autocomplete:'given-name',placeholder:'Your first name'},
    {key:'lastName',label:'Last name',type:'text',autocomplete:'family-name',placeholder:'Your last name'},
    {key:'email',label:'Email',type:'email',autocomplete:'email',placeholder:'you@example.com'},
    {key:'password',label:'Password',type:'password',autocomplete:'new-password',placeholder:'At least 8 characters'},
    {key:'confirmPassword',label:'Confirm password',type:'password',autocomplete:'new-password',placeholder:'Enter your password again'},
  ]
  return <Container className="py-10 sm:py-14"><div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0B1120] md:grid-cols-[.9fr_1.1fr]">
    <aside className="relative hidden min-h-[640px] flex-col justify-between overflow-hidden bg-[#111827] p-9 md:flex"><div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_80%,rgba(34,211,238,.13),transparent_42%),radial-gradient(ellipse_at_90%_10%,rgba(99,102,241,.2),transparent_45%)]"/><Link to="/" className="relative inline-flex items-center gap-2 text-sm font-semibold text-white"><span className="grid size-9 place-items-center rounded-xl border border-indigo-300/20 bg-indigo-400/10 text-indigo-200"><Plane size={17}/></span>TravelMate AI</Link><div className="relative"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">Start somewhere</p><p className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-white">Make room for the places you haven’t seen yet.</p><p className="mt-4 text-sm leading-6 text-slate-400">Create an account to get started with TravelMate AI.</p></div><p className="relative text-xs text-slate-500">Your next story starts somewhere.</p></aside>
    <div className="p-6 sm:p-9 lg:p-11"><Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white md:hidden"><Plane size={15}/> TravelMate AI</Link><p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">Create your account</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Join TravelMate</h1><p className="mt-2 text-sm text-slate-400">It starts with a place you want to go.</p><form onSubmit={onSubmit} className="mt-7 space-y-4">{fields.map((field)=><label key={field.key} className="block"><span className="mb-1.5 block text-xs font-medium text-slate-300">{field.label}</span><input type={field.type} name={field.key} autoComplete={field.autocomplete} required minLength={field.key==='firstName'||field.key==='lastName'?2:field.key==='password'?8:undefined} maxLength={field.key==='password'||field.key==='confirmPassword'?128:undefined} value={form[field.key]} onChange={(event)=>update(field.key,event.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-[#070c16] px-4 text-sm text-white outline-none transition focus:border-cyan-200/50" placeholder={field.placeholder}/>{fieldErrors[field.key]&&<span className="mt-1 block text-xs text-rose-200">{fieldErrors[field.key]}</span>}</label>)}{error&&<p role="alert" className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3 text-sm text-rose-200">{error}</p>}<button type="submit" disabled={submitting} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-wait disabled:opacity-60">{submitting?'Creating account…':'Create Account'}<ArrowRight size={16}/></button></form><p className="mt-5 text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="font-semibold text-cyan-200 hover:text-white">Sign in</Link></p></div>
  </div></Container>
}
