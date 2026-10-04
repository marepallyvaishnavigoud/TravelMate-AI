import { useState } from 'react'
import { CalendarDays, MapPin, Search, Users, Wallet } from 'lucide-react'
import { Button } from '../ui/Button'

const fields = [
  { label: 'From', placeholder: 'Your starting city', icon: MapPin },
  { label: 'Where to?', placeholder: 'Where do you want to go?', icon: Search },
  { label: 'Travel dates', placeholder: 'Add your dates', icon: CalendarDays },
  { label: 'Travelers', placeholder: '2 travelers', icon: Users },
  { label: 'Budget', placeholder: '₹30,000', icon: Wallet },
]

export function TripSearchCard({ destination = '' }: { destination?: string }) {
  const [submitted, setSubmitted] = useState(false)
  return <form id="plan" onSubmit={(event) => { event.preventDefault(); setSubmitted(true) }} className="rounded-3xl border border-white/10 bg-[#0B1120] p-4 shadow-[0_30px_90px_rgba(0,0,0,.35)] sm:p-5 lg:p-6">
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1.3fr_1fr_.9fr_.9fr_auto] lg:items-end">
      {fields.map(({ label, placeholder, icon: Icon }) => <label key={label} className="block rounded-xl border border-white/[0.07] bg-white/[0.025] px-3.5 py-3 transition focus-within:border-indigo-300/50">
        <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.15em] text-slate-500">{label}</span>
        <span className="flex items-center gap-2.5"><Icon size={15} className="shrink-0 text-slate-500" aria-hidden="true" /><input aria-label={label} placeholder={placeholder} defaultValue={label === 'Where to?' ? destination : undefined} className="min-w-0 w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-500" /></span>
      </label>)}
      <Button type="submit" icon className="min-h-[54px] sm:col-span-2 lg:col-span-1">Create My Trip</Button>
    </div>
    {submitted && <p role="status" className="mt-3 px-1 text-xs text-cyan-200">Your trip planner is ready for the next step.</p>}
  </form>
}
