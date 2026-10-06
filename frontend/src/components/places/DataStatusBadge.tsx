type DataStatus = 'LIVE' | 'DEMO' | 'ESTIMATED' | 'UNAVAILABLE'

const styles: Record<DataStatus, string> = {
  LIVE: 'border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200',
  DEMO: 'border-amber-300/20 bg-amber-300/[0.07] text-amber-200',
  ESTIMATED: 'border-sky-300/20 bg-sky-300/[0.07] text-sky-200',
  UNAVAILABLE: 'border-slate-300/15 bg-white/[0.04] text-slate-400',
}

export function DataStatusBadge({ status }: { status: DataStatus }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-[.12em] ${styles[status]}`}>{status}</span>
}
