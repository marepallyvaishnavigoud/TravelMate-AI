import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, RotateCcw, Wallet } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '../../components/ui/Container'
import { emptyExpenseInput, expenseCategories, expenseService, type ExpenseCategory, type ExpenseInput, type TripExpenseData } from '../../services/expenseService'

const inputClass = 'mt-2 w-full rounded-xl border border-white/10 bg-[#070d19] px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-200/40 focus:ring-2 focus:ring-cyan-200/10'
const maxAmount = 1_000_000_000_000
type ExpenseDraft = Record<ExpenseCategory, string> & { notes: string }

function toDraft(expense: ExpenseInput | null): ExpenseDraft {
  return Object.fromEntries([...expenseCategories.map(({ key }) => [key, String(expense?.[key] ?? 0)]), ['notes', expense?.notes ?? '']]) as ExpenseDraft
}

export function ExpenseCalculator() {
  const { id = '' } = useParams()
  const [data, setData] = useState<TripExpenseData | null>(null)
  const [values, setValues] = useState<ExpenseDraft>(() => toDraft(emptyExpenseInput))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const result = await expenseService.get(id)
      setData(result)
      setValues(toDraft(result.expense))
    } catch { setError('Unable to load expenses. Check your connection and try again.') }
    finally { setLoading(false) }
  }, [id])
  useEffect(() => { void load() }, [load])

  const amounts = useMemo(() => Object.fromEntries(expenseCategories.map(({ key }) => { const amount = Number(values[key]); return [key, Number.isFinite(amount) ? amount : 0] })) as Record<ExpenseCategory, number>, [values])
  const total = expenseCategories.reduce((sum, { key }) => sum + amounts[key], 0)
  const trip = data?.trip
  const budget = trip?.budget ?? 0
  const usage = budget > 0 ? total / budget * 100 : total > 0 ? null : 0
  const status = budget === 0 ? (total > 0 ? 'Over Budget' : 'No budget set') : usage !== null && usage > 100 ? 'Over Budget' : usage !== null && usage >= 70 ? 'Near Budget' : 'Under Budget'
  const currency = (value: number) => trip ? new Intl.NumberFormat(undefined, { style: 'currency', currency: trip.currency, maximumFractionDigits: 2 }).format(value) : ''

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFieldError(''); setNotice('')
    const payload = { notes: values.notes, ...Object.fromEntries(expenseCategories.map(({ key }) => [key, Number(values[key])])) } as ExpenseInput
    for (const { key, label } of expenseCategories) {
      if (!/^\d+(\.\d+)?$/.test(values[key]) || !Number.isFinite(payload[key]) || payload[key] < 0 || payload[key] > maxAmount) { setFieldError(`${label} must be a valid amount between 0 and ${maxAmount.toLocaleString()}.`); return }
    }
    if (values.notes.length > 2000) { setFieldError('Notes must be 2,000 characters or fewer.'); return }
    setSaving(true)
    try { const result = await expenseService.save(id, payload); setData(result); setValues(toDraft(result.expense)); setNotice('Expenses saved successfully.') }
    catch { setError('Unable to save expenses. Please try again.'); }
    finally { setSaving(false) }
  }

  const clear = async () => {
    setDeleting(true); setError(''); setNotice('')
    try { await expenseService.delete(id); setValues(toDraft(emptyExpenseInput)); setData((current) => current ? { ...current, expense: null } : current); setNotice('Expenses deleted.') }
    catch { setError('Unable to delete expenses. Please try again.') }
    finally { setDeleting(false) }
  }

  return <Container className="py-8 sm:py-12"><div className="mx-auto max-w-6xl">
    <Link to={id ? `/trips/${encodeURIComponent(id)}` : '/my-trips'} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft size={15}/>Back to trip</Link>
    {loading ? <div role="status" className="grid min-h-[45vh] place-items-center text-sm text-slate-400">Loading expenses…</div> : error && !data ? <section role="alert" className="mt-8 rounded-2xl border border-rose-300/15 bg-[#0B1120] p-6 text-sm text-rose-200">{error}<button onClick={() => void load()} className="ml-3 underline">Try again</button></section> : trip && <>
      <header className="mt-6 rounded-3xl border border-white/[0.08] bg-[radial-gradient(ellipse_at_85%_10%,rgba(79,70,229,.2),transparent_40%),#0B1120] p-6 sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">Trip finances</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Expense Calculator</h1>
        <h2 className="mt-5 text-lg font-medium text-white">{trip.title}</h2><p className="mt-1 text-sm text-slate-300">{trip.origin} <span className="text-cyan-200">→</span> {trip.destination}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400"><span>{new Date(trip.startDate).toLocaleDateString()} – {new Date(trip.endDate).toLocaleDateString()}</span><span>{trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}</span><span>{trip.transport}</span><span>Budget: {currency(budget)}</span></div>
      </header>
      {error && data && <p role="alert" className="mt-4 text-sm text-rose-200">{error}</p>}{notice && <p role="status" className="mt-4 inline-flex items-center gap-2 text-sm text-emerald-200"><Check size={15}/>{notice}</p>}
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <form onSubmit={save} className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-7">
          <div className="mb-5"><h2 className="text-lg font-semibold text-white">Expenses</h2><p className="mt-1 text-xs text-slate-500">Enter estimates in {trip.currency}. Amounts above your budget are allowed.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">{expenseCategories.map(({ key, label }) => <label key={key} className="text-xs font-medium text-slate-400">{label}<input className={inputClass} type="text" inputMode="decimal" autoComplete="off" placeholder="0.00" value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} aria-label={label}/></label>)}</div>
          <label className="mt-4 block text-xs font-medium text-slate-400">Notes<textarea className={`${inputClass} min-h-24 resize-y`} maxLength={2000} value={values.notes} onChange={(event) => setValues((current) => ({ ...current, notes: event.target.value }))} placeholder="Add a note about your trip expenses"/></label>
          {fieldError && <p role="alert" className="mt-3 text-sm text-rose-200">{fieldError}</p>}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between"><button type="submit" disabled={saving || deleting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60">{saving ? 'Saving…' : 'Save Expenses'}</button>{data.expense && <button type="button" disabled={saving || deleting} onClick={() => void clear()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm text-slate-300 hover:bg-white/[0.04] disabled:opacity-60"><RotateCcw size={15}/>{deleting ? 'Deleting…' : 'Delete expenses'}</button>}</div>
        </form>
        <aside className="rounded-2xl border border-white/[0.08] bg-[#0B1120] p-5 sm:p-7">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-indigo-300/10 text-indigo-200"><Wallet size={18}/></span><div><h2 className="font-semibold text-white">Trip summary</h2><p className="text-xs text-slate-500">Live estimate</p></div></div>
          <p className="mt-6 text-xs text-slate-500">Total trip cost</p><p className="mt-1 break-words text-3xl font-semibold text-white">{currency(total)}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">{[{ label: 'Per person', value: currency(trip.travelers > 0 ? total / trip.travelers : total) }, { label: 'Trip budget', value: currency(budget) }, { label: 'Remaining budget', value: currency(budget - total) }, { label: 'Budget used', value: usage === null ? '—' : `${usage.toFixed(1)}%` }].map((item) => <div key={item.label} className="min-w-0 rounded-xl border border-white/[0.06] bg-[#070d19] p-3"><p className="text-[11px] text-slate-500">{item.label}</p><p className="mt-1 break-words text-sm font-medium text-white">{item.value}</p></div>)}</div>
          <p className="mt-4 rounded-xl border border-white/[0.07] bg-[#070d19] p-3 text-sm text-slate-300">Budget status: <strong className="text-white">{status}</strong></p>
          <div className="mt-6"><h3 className="text-sm font-semibold text-white">Expense breakdown</h3><div className="mt-3 space-y-3">{expenseCategories.map(({ key, label }) => { const value = amounts[key]; const share = total > 0 ? value / total * 100 : 0; return <div key={key}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="text-slate-400">{label}</span><span className="shrink-0 text-slate-300">{currency(value)}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-cyan-300/70" style={{ width: `${share}%` }}/></div></div> })}</div></div>
        </aside>
      </div>
    </>}
  </div></Container>
}
