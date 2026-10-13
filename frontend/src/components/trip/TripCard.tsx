import { ArrowUpRight, CalendarDays, Users, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Trip } from '../../services/tripService'
import { getDestinationMedia } from '../../data/destinationMedia'

const destinationAliases: Array<[string, string]> = [
  ['srinagar', 'kashmir'], ['nilgiri', 'ooty'], ['puducherry', 'pondicherry'], ['cochin', 'kerala'], ['kochi', 'kerala'],
]
const destinationIds = ['goa', 'kerala', 'manali', 'kashmir', 'jaipur', 'udaipur', 'rishikesh', 'andaman', 'ooty', 'munnar', 'hyderabad', 'mumbai', 'delhi', 'agra', 'varanasi', 'coorg', 'darjeeling', 'pondicherry', 'amritsar', 'jaisalmer', 'kaziranga', 'khajuraho']

export function getTripPhoto(value: string): string {
  const name = value.toLocaleLowerCase()
  const id = destinationAliases.find(([alias]) => name.includes(alias))?.[1] ?? destinationIds.find((destination) => name.includes(destination)) ?? 'kerala'
  return getDestinationMedia(id).src
}

export function TripCard({ trip }: { trip: Trip }) {
  const formatDate = (value: string) => new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  const formatBudget = new Intl.NumberFormat(undefined, { style: 'currency', currency: trip.currency, maximumFractionDigits: 0 }).format(trip.budget)
  return <article className="group overflow-hidden rounded-[24px] border border-white/[0.09] bg-[#0a1220] shadow-[0_18px_55px_rgba(0,0,0,.2)] transition duration-300 hover:-translate-y-1 hover:border-cyan-100/20 hover:shadow-[0_24px_65px_rgba(0,0,0,.3)]">
    <Link to={`/trips/${trip._id}`} className="relative block aspect-[2.55] min-h-44 overflow-hidden sm:aspect-[2.8]">
      <img src={getTripPhoto(trip.destination)} alt={`${trip.destination} travel scenery`} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.04]"/>
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#050a13] via-[#050a13]/25 to-[#050a13]/10"/>
      <span className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/20 bg-[#08111e]/55 px-3 py-1.5 text-[10px] font-semibold capitalize tracking-wide text-white shadow-lg backdrop-blur">{trip.status}</span>
      <span className="absolute right-4 top-4 rounded-xl border border-white/15 bg-[#08111e]/55 px-3 py-2 text-xs capitalize text-white backdrop-blur">{trip.transport}</span>
      <span className="absolute inset-x-0 bottom-0 p-5 sm:p-6"><span className="block text-2xl font-semibold tracking-tight text-white drop-shadow sm:text-[28px]">{trip.title}</span><span className="mt-1.5 block text-sm font-medium capitalize text-white/85">{trip.origin} <span className="mx-1.5 text-cyan-200">→</span> {trip.destination}</span></span>
    </Link>
    <div className="p-4 sm:p-5">
      <div className="grid gap-3 border-b border-white/[0.07] pb-4 text-xs text-slate-300 sm:grid-cols-3">
        <span className="inline-flex items-center gap-2"><CalendarDays size={15} className="shrink-0 text-cyan-200"/><span>{formatDate(trip.startDate)} <span className="text-slate-500">→</span> {formatDate(trip.endDate)}</span></span>
        <span className="inline-flex items-center gap-2"><Users size={15} className="shrink-0 text-indigo-200"/>{trip.travelers} {trip.travelers === 1 ? 'traveler' : 'travelers'}</span>
        <span className="inline-flex items-center gap-2"><Wallet size={15} className="shrink-0 text-indigo-200"/>{formatBudget}</span>
      </div>
      <div className="flex items-center justify-between pt-3"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-slate-500">Your next journey</p><Link to={`/trips/${trip._id}`} className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-cyan-100/15 bg-cyan-100/[0.04] px-3 text-xs font-semibold text-cyan-100 transition hover:border-cyan-100/30 hover:bg-cyan-100/[0.09]">View trip <ArrowUpRight size={14}/></Link></div>
    </div>
  </article>
}
