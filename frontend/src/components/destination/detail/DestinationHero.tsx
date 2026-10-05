import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Heart, Home, ChevronRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { ExploreDestination } from '../../../data/destinations'
import { TravelImage } from '../../common/TravelImage'
import { useAuth } from '../../../context/AuthContext'
import { authErrorMessage } from '../../../services/authService'
import { savedDestinationService } from '../../../services/savedDestinationService'

export function DestinationHero({ place, onPlan }: { place: ExploreDestination; onPlan: () => void }) {
  const [saved, setSaved] = useState(false)
  const [checking, setChecking] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  useEffect(() => {
    let active = true
    if (!isAuthenticated) { setSaved(false); setChecking(false); return () => { active = false } }
    setChecking(true)
    savedDestinationService.checkSavedDestination(place.id).then((value) => { if (active) setSaved(value) }).catch((error: unknown) => { if (active) setFeedback(authErrorMessage(error)) }).finally(() => { if (active) setChecking(false) })
    return () => { active = false }
  }, [isAuthenticated, place.id])
  const toggleSaved = async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (saving || checking) return
    setSaving(true); setFeedback('')
    try {
      if (saved) { await savedDestinationService.removeSavedDestination(place.id); setSaved(false); setFeedback('Removed from your saved destinations.') }
      else { await savedDestinationService.saveDestination({ id: place.id, name: place.name, image: place.image }); setSaved(true); setFeedback('Destination saved to your list.') }
    } catch (error) { setFeedback(authErrorMessage(error)) }
    finally { setSaving(false) }
  }
  return <section className="relative isolate flex min-h-[620px] items-end overflow-hidden sm:min-h-[680px] lg:min-h-[740px]">
    <TravelImage src={place.image} alt={place.alt} loading="eager" className="absolute inset-0 size-full" imageClassName="scale-[1.02]" />
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/55 to-[#030712]/25" />
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#030712]/70 via-transparent to-transparent" />
    <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-32 sm:px-8 sm:pb-16 lg:px-10 lg:pb-20">
      <nav aria-label="Breadcrumb" className="absolute left-5 top-8 flex items-center gap-2 text-xs text-slate-300 sm:left-8 lg:left-10"><Link to="/" className="inline-flex items-center gap-1.5 hover:text-white"><Home size={13} />Home</Link><ChevronRight size={12} className="text-slate-500" /><Link to="/explore" className="hover:text-white">Explore</Link><ChevronRight size={12} className="text-slate-500" /><span aria-current="page" className="text-white">{place.name}</span></nav>
      <motion.div initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }} className="max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-[.2em] text-cyan-200">{place.category} · {place.state}</span>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-.06em] text-white sm:text-7xl lg:text-8xl">{place.name}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">{place.description}</p>
        <div className="mt-6 flex flex-wrap gap-2">{place.tags.slice(0,4).map((tag)=><span key={tag} className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-xs capitalize text-white">{tag}</span>)}</div>
        <div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={onPlan} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 focus-visible:outline-cyan-300">Plan a Trip <ArrowRight size={16} /></button><button type="button" disabled={checking || saving} aria-label={`${saved ? 'Remove' : 'Save'} ${place.name} ${saved ? 'from' : 'to'} saved destinations`} aria-pressed={saved} onClick={()=>void toggleSaved()} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/20 bg-[#030712]/35 px-5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-70"><Heart size={16} className={saved?'fill-rose-400 text-rose-400':''} />{checking ? 'Checking…' : saving ? 'Saving…' : saved ? 'Saved' : 'Save destination'}</button></div>{feedback && <p role="status" className="mt-3 text-sm text-cyan-100">{feedback}</p>}
      </motion.div>
    </div>
  </section>
}
