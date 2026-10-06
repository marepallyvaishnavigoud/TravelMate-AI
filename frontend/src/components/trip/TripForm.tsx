import { useState, type FormEvent } from 'react'
import { CalendarDays, CarFront, BusFront, TrainFront, Plane, Users, Wallet, MapPin, Sparkles } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { authErrorMessage } from '../../services/authService'
import type { Trip, TripInput, TripTransport } from '../../services/tripService'

const interests = ['Beaches', 'Mountains', 'Adventure', 'Food', 'History', 'Culture', 'Wildlife', 'Shopping', 'Luxury', 'Nature', 'Spiritual']
const transports: Array<{ value: TripTransport; label: string; Icon: typeof CarFront }> = [
  { value: 'car', label: 'Car', Icon: CarFront }, { value: 'bus', label: 'Bus', Icon: BusFront }, { value: 'train', label: 'Train', Icon: TrainFront }, { value: 'flight', label: 'Flight', Icon: Plane },
]
type FormValues = Omit<TripInput, 'travelers' | 'budget'> & { travelers: string; budget: string }
const blank: FormValues = { title: '', origin: '', destination: '', startDate: '', endDate: '', travelers: '1', budget: '0', currency: 'INR', transport: 'car', interests: [] }

function toFormValues(trip?: Trip, initial?: { origin?: string; destination?: string }): FormValues {
  if (!trip) return { ...blank, origin: initial?.origin ?? '', destination: initial?.destination ?? '' }
  return { title: trip.title, origin: trip.origin, destination: trip.destination, startDate: trip.startDate.slice(0, 10), endDate: trip.endDate.slice(0, 10), travelers: String(trip.travelers), budget: String(trip.budget), currency: trip.currency, transport: trip.transport, interests: trip.interests }
}

export function TripForm({ initialTrip, initialValues, onSubmit, submitLabel = 'Create My Trip' }: { initialTrip?: Trip; initialValues?: { origin?: string; destination?: string }; onSubmit: (input: TripInput) => Promise<void>; submitLabel?: string }) {
  const [values, setValues] = useState<FormValues>(() => toFormValues(initialTrip, initialValues))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [requestError, setRequestError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const reduceMotion = useReducedMotion()
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues((current) => ({ ...current, [key]: value }))
  const toggleInterest = (interest: string) => set('interests', values.interests.includes(interest) ? values.interests.filter((item) => item !== interest) : [...values.interests, interest])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    if (!values.destination.trim()) nextErrors.destination = 'Please enter your destination.'
    if (!values.origin.trim()) nextErrors.origin = 'Please enter your starting location.'
    if (!values.startDate) nextErrors.startDate = 'Please select a start date.'
    if (!values.endDate) nextErrors.endDate = 'Please select an end date.'
    else if (values.startDate && values.endDate < values.startDate) nextErrors.endDate = 'End date must be on or after the start date.'
    if (!Number.isInteger(Number(values.travelers)) || Number(values.travelers) < 1 || Number(values.travelers) > 30) nextErrors.travelers = 'Travelers must be between 1 and 30.'
    if (!values.budget.trim() || !Number.isFinite(Number(values.budget)) || Number(values.budget) < 0) nextErrors.budget = 'Enter a budget of 0 or more.'
    setErrors(nextErrors); setRequestError('')
    if (Object.keys(nextErrors).length) return
    const payload: TripInput = { ...values, title: values.title.trim(), travelers: Number(values.travelers), budget: Number(values.budget), currency: 'INR' }
    setSubmitting(true)
    try { await onSubmit(payload) }
    catch (cause) { setRequestError(authErrorMessage(cause)) }
    finally { setSubmitting(false) }
  }

  const inputClass = 'w-full rounded-xl border border-white/[0.09] bg-[#070d19] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-300/50'
  const fieldError = (field: string) => errors[field] && <p className="mt-2 text-xs text-rose-300">{errors[field]}</p>
  return <motion.form initial={reduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={(event: FormEvent<HTMLFormElement>) => void submit(event)} className="space-y-5" noValidate>
    {requestError && <p role="alert" className="rounded-xl border border-rose-300/15 bg-rose-300/[0.05] px-4 py-3 text-sm text-rose-200">{requestError}</p>}
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-7"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">01 · Your route</p><h2 className="mt-2 text-xl font-semibold text-white">Where are you headed?</h2></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-medium text-slate-400">Destination<input autoComplete="off" className={`${inputClass} mt-2`} placeholder="e.g. Goa" value={values.destination} onChange={(event) => set('destination', event.target.value)} />{fieldError('destination')}</label><label className="text-xs font-medium text-slate-400">Starting from<input autoComplete="off" className={`${inputClass} mt-2`} placeholder="e.g. Hyderabad" value={values.origin} onChange={(event) => set('origin', event.target.value)} />{fieldError('origin')}</label><label className="text-xs font-medium text-slate-400 sm:col-span-2">Trip title <span className="text-slate-600">(optional)</span><input maxLength={120} className={`${inputClass} mt-2`} placeholder="A memorable name for your trip" value={values.title} onChange={(event) => set('title', event.target.value)} /></label></div></section>
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-7"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">02 · When & who</p><h2 className="mt-2 text-xl font-semibold text-white">Set your dates and group</h2></div><div className="grid gap-4 sm:grid-cols-3"><label className="text-xs font-medium text-slate-400"><span className="inline-flex items-center gap-2"><CalendarDays size={14}/>Start date</span><input type="date" className={`${inputClass} mt-2 [color-scheme:dark]`} value={values.startDate} onChange={(event) => { set('startDate', event.target.value); if (values.endDate && event.target.value && values.endDate < event.target.value) set('endDate', '') }} />{fieldError('startDate')}</label><label className="text-xs font-medium text-slate-400"><span className="inline-flex items-center gap-2"><CalendarDays size={14}/>End date</span><input type="date" min={values.startDate || undefined} className={`${inputClass} mt-2 [color-scheme:dark]`} value={values.endDate} onChange={(event) => set('endDate', event.target.value)} />{fieldError('endDate')}</label><label className="text-xs font-medium text-slate-400"><span className="inline-flex items-center gap-2"><Users size={14}/>Travelers</span><input type="number" min="1" max="30" step="1" className={`${inputClass} mt-2`} value={values.travelers} onChange={(event) => set('travelers', event.target.value)} />{fieldError('travelers')}</label></div></section>
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-7"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">03 · The details</p><h2 className="mt-2 text-xl font-semibold text-white">Budget and transport</h2></div><div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><label className="text-xs font-medium text-slate-400"><span className="inline-flex items-center gap-2"><Wallet size={14}/>Total budget (INR)</span><span className="mt-2 flex items-center rounded-xl border border-white/[0.09] bg-[#070d19] px-4 focus-within:border-indigo-300/50"><span className="text-slate-500">₹</span><input type="number" min="0" step="any" className="w-full bg-transparent px-3 py-3 text-sm text-white outline-none" value={values.budget} onChange={(event) => set('budget', event.target.value)} /></span>{fieldError('budget')}</label><fieldset><legend className="mb-2 text-xs font-medium text-slate-400">How will you travel?</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{transports.map(({ value, label, Icon }) => <button key={value} type="button" aria-pressed={values.transport === value} onClick={() => set('transport', value)} className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border px-3 text-sm transition ${values.transport === value ? 'border-indigo-300/40 bg-indigo-400/10 text-white' : 'border-white/[0.08] bg-[#070d19] text-slate-400 hover:border-white/20'}`}><Icon size={17}/>{label}</button>)}</div></fieldset></div></section>
    <section className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-7"><div className="mb-5"><p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">04 · Your kind of journey</p><h2 className="mt-2 text-xl font-semibold text-white">What are you interested in?</h2><p className="mt-1 text-sm text-slate-500">Choose as many as you like.</p></div><div className="flex flex-wrap gap-2">{interests.map((interest) => { const active = values.interests.includes(interest); return <button key={interest} type="button" aria-pressed={active} onClick={() => toggleInterest(interest)} className={`rounded-full border px-4 py-2 text-sm transition ${active ? 'border-cyan-200/40 bg-cyan-200/10 text-cyan-100' : 'border-white/[0.09] bg-[#070d19] text-slate-400 hover:border-white/20 hover:text-white'}`}>{interest}</button> })}</div></section>
    <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center"><p className="inline-flex items-center gap-2 text-xs leading-5 text-slate-500"><MapPin size={14} className="shrink-0"/>Your trip details are private to your account.</p><button type="submit" disabled={submitting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(79,70,229,0.2)] transition hover:bg-indigo-400 disabled:cursor-wait disabled:opacity-60"><Sparkles size={16}/>{submitting ? (initialTrip ? 'Saving trip changes…' : 'Creating your trip…') : submitLabel}</button></div>
  </motion.form>
}
