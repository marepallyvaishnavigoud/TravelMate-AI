import { ArrowUpRight, Heart, MapPin, Star } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Destination } from '../../data/destinations'
import { TravelImage } from '../common/TravelImage'
import { useAuth } from '../../context/AuthContext'
import { savedDestinationService } from '../../services/savedDestinationService'
import { authErrorMessage } from '../../services/authService'

export function DestinationCard({ destination, index = 0 }: { destination: Destination; index?: number }) {
  const reduceMotion = useReducedMotion()
  const [favorite, setFavorite] = useState(false)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const destinationId = destination.id ?? destination.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  useEffect(() => {
    let active = true
    if (!isAuthenticated) { setFavorite(false); setBusy(false); return () => { active = false } }
    setBusy(true)
    savedDestinationService.checkSavedDestination(destinationId).then((saved) => { if (active) setFavorite(saved) }).catch(() => undefined).finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [destinationId, isAuthenticated])
  const toggleFavorite = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (busy) return
    setBusy(true); setFeedback('')
    try {
      if (favorite) await savedDestinationService.removeSavedDestination(destinationId)
      else await savedDestinationService.saveDestination({ id: destinationId, name: destination.name, image: destination.image })
      setFavorite(!favorite)
    } catch (error) { setFeedback(authErrorMessage(error)) }
    finally { setBusy(false) }
  }
  return <motion.article layout initial={reduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: reduceMotion ? 0 : (index % 3) * 0.045 }} className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120] transition-transform duration-300 hover:-translate-y-1">
    <Link to={`/destination/${destinationId}`} className="block focus-visible:outline-offset-[-4px]" aria-label={`Explore ${destination.name}`}>
      <div className="relative aspect-[1.18] overflow-hidden">
        <TravelImage src={destination.image} alt={destination.alt} className="absolute inset-0 size-full" imageClassName="transition-transform duration-700 group-hover:scale-[1.05]" />
        {destination.tag && <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-[#07101c]/60 px-3 py-1.5 text-[10px] font-medium tracking-wide text-white backdrop-blur">{destination.tag}</span>}
        <span className="absolute bottom-4 right-4 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-slate-950 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></span>
      </div>
      <div className="flex items-end justify-between gap-3 p-4 sm:p-5">
        <div><h3 className="text-lg font-semibold tracking-tight text-white">{destination.name}</h3><p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-400"><MapPin size={12} aria-hidden="true" />{destination.city ? `${destination.city}, ${destination.state}` : destination.region}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{destination.shortDescription ?? destination.note}</p></div>
        <div className="shrink-0 pb-0.5 text-right text-[11px] text-slate-400">{destination.rating && <span className="mb-2 inline-flex items-center gap-1 text-white"><Star size={12} className="fill-amber-300 text-amber-300" />{destination.rating.toFixed(1)}</span>}<span className="block">{destination.country ?? destination.note}</span></div>
      </div>
    </Link>
    <button type="button" disabled={busy} aria-label={`${favorite ? 'Remove' : 'Add'} ${destination.name} ${favorite ? 'from' : 'to'} saved destinations`} aria-pressed={favorite} onClick={() => void toggleFavorite()} className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full border border-white/20 bg-[#07101c]/60 text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-offset-2 disabled:opacity-60"><Heart size={16} className={favorite ? 'fill-rose-400 text-rose-400' : ''} /></button>{feedback && <p role="status" className="absolute left-3 right-3 top-[3.75rem] z-10 rounded-lg bg-[#030712]/90 px-3 py-2 text-xs text-rose-200">{feedback}</p>}
  </motion.article>
}
