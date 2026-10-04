import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { Container } from '../../components/ui/Container'
import { useAuth } from '../../context/AuthContext'

export function Profile() {
  const { user } = useAuth()
  if (!user) return null
  const createdAt = new Date(user.createdAt)
  return <Container className="py-12 sm:py-16"><div className="mx-auto max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">Your account</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Profile</h1><p className="mt-2 text-sm text-slate-400">Your TravelMate account information.</p><section className="mt-8 rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-8"><div className="flex items-center gap-4 border-b border-white/[0.07] pb-6"><span className="grid size-14 place-items-center rounded-2xl border border-indigo-300/20 bg-indigo-300/10 text-indigo-200"><UserRound size={24}/></span><div><h2 className="text-xl font-semibold text-white">{user.firstName} {user.lastName}</h2><p className="mt-1 text-sm text-slate-400">TravelMate member</p></div></div><dl className="mt-5 grid gap-4 sm:grid-cols-2">{[{label:'First name',value:user.firstName,icon:UserRound},{label:'Last name',value:user.lastName,icon:UserRound},{label:'Email',value:user.email,icon:Mail},{label:'Role',value:user.role,icon:ShieldCheck},{label:'Member since',value:Number.isNaN(createdAt.getTime())?'—':createdAt.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}),icon:CalendarDays}].map(({label,value,icon:Icon})=><div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"><dt className="inline-flex items-center gap-2 text-xs text-slate-500"><Icon size={14}/>{label}</dt><dd className="mt-2 break-words text-sm font-medium capitalize text-slate-200">{value}</dd></div>)}</dl></section><Link to="/dashboard" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200 hover:bg-white/[0.05]">Go to dashboard <ArrowRight size={15}/></Link></div></Container>
}
