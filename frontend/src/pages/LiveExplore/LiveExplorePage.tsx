import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Activity, LocateFixed, MapPin, Navigation, RefreshCw } from 'lucide-react'
import { Container } from '../../components/ui/Container'
import { NearbyPlacesMap } from '../../components/map/NearbyPlacesMap'
import { placesService, type Place, type PlaceCategory, type PlacesResponse } from '../../services/placesService'
import { getDestinationMedia } from '../../data/destinationMedia'

type Position = { latitude: number; longitude: number }
type TrackingState = 'idle' | 'tracking' | 'paused'
const categories: Array<{ value: PlaceCategory; label: string }> = [
  { value: 'restaurant', label: 'Restaurants' }, { value: 'hotel', label: 'Hotels' }, { value: 'cafe', label: 'Cafes' }, { value: 'attraction', label: 'Attractions' }, { value: 'petrol', label: 'Petrol stations' },
]

function locationError(error: GeolocationPositionError): string {
  if (error.code === error.PERMISSION_DENIED) return 'Location permission was denied. Allow location access in your browser settings, then try again.'
  if (error.code === error.POSITION_UNAVAILABLE) return 'Your location is unavailable right now. Check your device location settings and try again.'
  if (error.code === error.TIMEOUT) return 'The location request timed out. Try refreshing your position.'
  return 'Unable to read your location. Please try again.'
}

function distanceMeters(a: Position, b: Position) {
  const rad = (n: number) => n * Math.PI / 180
  const dLat = rad(b.latitude - a.latitude), dLon = rad(b.longitude - a.longitude)
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

export function LiveExplorePage() {
  const [position, setPosition] = useState<Position | null>(null)
  const [tracking, setTracking] = useState<TrackingState>('idle')
  const [locationMessage, setLocationMessage] = useState('')
  const [category, setCategory] = useState<PlaceCategory>('restaurant')
  const [radius, setRadius] = useState(5000)
  const [result, setResult] = useState<PlacesResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [placesError, setPlacesError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const watcherRef = useRef<number | null>(null)
  const activeRef = useRef(false)

  const stopWatcher = useCallback(() => {
    if (watcherRef.current !== null && navigator.geolocation) navigator.geolocation.clearWatch(watcherRef.current)
    watcherRef.current = null
  }, [])

  const startWatcher = useCallback(() => {
    if (!activeRef.current || document.visibilityState !== 'visible' || !navigator.geolocation || watcherRef.current !== null) return
    watcherRef.current = navigator.geolocation.watchPosition((current) => {
      setPosition({ latitude: current.coords.latitude, longitude: current.coords.longitude })
      setLocationMessage('Location updated.')
    }, (error) => {
      setLocationMessage(locationError(error))
      if (error.code === error.PERMISSION_DENIED) { activeRef.current = false; stopWatcher(); setTracking('idle') }
    }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 })
    setTracking('tracking')
  }, [stopWatcher])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') { stopWatcher(); if (activeRef.current) setTracking('paused') }
      else if (activeRef.current) startWatcher()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => { document.removeEventListener('visibilitychange', handleVisibility); activeRef.current = false; stopWatcher() }
  }, [startWatcher, stopWatcher])

  const enableTracking = () => {
    if (!navigator.geolocation) { setLocationMessage('This browser does not support location services.'); return }
    setLocationMessage('Waiting for your location…')
    activeRef.current = true
    startWatcher()
  }

  const stopTracking = () => { activeRef.current = false; stopWatcher(); setTracking('idle'); setLocationMessage('Live tracking stopped. Your last position remains on this page until you leave.') }

  const refreshLocation = () => {
    if (!navigator.geolocation) { setLocationMessage('This browser does not support location services.'); return }
    setLocationMessage('Refreshing your position…')
    navigator.geolocation.getCurrentPosition((current) => { setPosition({ latitude: current.coords.latitude, longitude: current.coords.longitude }); setLocationMessage('Location refreshed.') }, (error) => setLocationMessage(locationError(error)), { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 })
  }

  const search = async (selected = category, selectedRadius = radius) => {
    if (!position) return
    setLoading(true); setPlacesError(''); setResult(null); setSelectedId(null)
    try { setResult(await placesService.getNearbyPlaces({ category: selected, latitude: position.latitude, longitude: position.longitude, radius: selectedRadius, limit: 20 })) }
    catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) setPlacesError('Your session expired. Sign in again to search nearby places.')
      else if (axios.isAxiosError(error) && error.response?.status === 400) setPlacesError(error.response.data?.message ?? 'Check the search settings and try again.')
      else if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') setPlacesError(error.response.data.message)
      else setPlacesError('Nearby places are temporarily unavailable. Please try again.')
    } finally { setLoading(false) }
  }

  const places = result?.places ?? []
  const selected = places.find((place) => place.id === selectedId)
  return <Container className="py-8 sm:py-12"><div className="mx-auto max-w-7xl">
    <header className="relative isolate overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#09111f] shadow-[0_24px_75px_rgba(0,0,0,.28)]"><img src={getDestinationMedia('kerala').src} alt="" aria-hidden="true" className="absolute inset-y-0 right-0 h-full w-[58%] object-cover opacity-55"/><div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#080e19] via-[#080e19]/85 to-[#080e19]/20"/><div className="relative z-10 flex min-h-52 items-end p-6 sm:min-h-60 sm:p-9"><div className="max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-cyan-100/20 bg-[#07101c]/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-100 backdrop-blur"><LocateFixed size={13}/>Live explore</span><h1 className="mt-4 text-4xl font-semibold tracking-tight text-white drop-shadow sm:text-5xl">Find what’s around you</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-200">Use your current position to discover nearby places. Your precise location stays in this browser and is sent only when you search for places.</p></div></div></header>

    <section aria-labelledby="location-title" className="mt-5 rounded-3xl border border-white/[0.09] bg-[radial-gradient(ellipse_at_100%_0%,rgba(34,211,238,.06),transparent_36%),linear-gradient(145deg,#0d1727,#0a1120)] p-5 shadow-[0_18px_50px_rgba(0,0,0,.18)] sm:p-6">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><h2 id="location-title" className="flex items-center gap-2 text-lg font-semibold text-white"><LocateFixed size={19} className="text-cyan-200"/>Your location</h2><p className="mt-1 text-sm text-slate-400">Location is used to show nearby places and center the map. Permission is requested only after you press Enable Live Location.</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={enableTracking} disabled={tracking === 'tracking'} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"><LocateFixed size={16}/>Enable Live Location</button><button type="button" onClick={refreshLocation} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-medium text-slate-200 hover:bg-white/[0.05]"><RefreshCw size={15}/>Refresh</button>{tracking !== 'idle' && <button type="button" onClick={stopTracking} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-300/20 px-4 text-sm font-medium text-rose-200 hover:bg-rose-300/[0.06]">Stop Tracking</button>}</div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.06] pt-4 text-sm"><span role="status" className="inline-flex items-center gap-2 text-slate-300"><Activity size={15} className={tracking === 'tracking' ? 'text-emerald-300' : 'text-slate-500'}/>{tracking === 'tracking' ? 'Tracking while this page is active' : tracking === 'paused' ? 'Tracking paused while page is hidden' : position ? 'Location available' : 'Location not enabled'}</span>{position && <span className="font-mono text-xs text-slate-400">{position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}</span>}</div>
      {locationMessage && <p className="mt-2 text-sm text-slate-400">{locationMessage}</p>}
    </section>

    <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,.85fr)]">
      <section aria-label="Your location map" className="rounded-3xl border border-white/[0.09] bg-gradient-to-br from-[#101c2d] to-[#08101d] p-3 shadow-xl shadow-black/15 sm:p-4">{position ? <NearbyPlacesMap position={position}/> : <div className="relative isolate grid min-h-[320px] place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#07101c] p-6 text-center"><img src={getDestinationMedia('kerala').src} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover opacity-45"/><div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#07101c]/80 via-[#07101c]/65 to-[#07101c]/80"/><div className="relative z-10"><span className="mx-auto grid size-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-cyan-100 backdrop-blur"><MapPin size={22}/></span><p className="mt-3 font-semibold text-white">Your map is ready when you are</p><p className="mt-1 text-sm text-slate-200">Enable location to see your position here.</p></div></div>}</section>
      <section aria-labelledby="nearby-title" className="rounded-3xl border border-white/[0.09] bg-[radial-gradient(ellipse_at_100%_0%,rgba(99,102,241,.07),transparent_34%),#0B1120] p-5 shadow-xl shadow-black/15 sm:p-6">
        <h2 id="nearby-title" className="text-lg font-semibold text-white">Nearby recommendations</h2><p className="mt-1 text-sm text-slate-400">Results come from Google Places. Google requires its place results to be shown on a Google map, so this Mapbox map shows your position while place details and directions appear here. Availability and prices are not provided.</p>
        <div className="mt-5"><span className="text-xs font-medium text-slate-400">Category</span><div className="mt-2 flex flex-wrap gap-2">{categories.map((item) => <button key={item.value} type="button" aria-pressed={category === item.value} onClick={() => { setCategory(item.value); if (position) void search(item.value) }} className={`min-h-9 rounded-full border px-3 text-xs font-medium transition ${category === item.value ? 'border-cyan-200/30 bg-cyan-200/[0.08] text-cyan-100' : 'border-white/[0.08] text-slate-400 hover:text-white'}`}>{item.label}</button>)}</div></div>
        <label className="mt-4 block text-xs font-medium text-slate-400">Search radius<select value={radius} onChange={(event) => { const value = Number(event.target.value); setRadius(value); if (position) void search(category, value) }} className="mt-2 min-h-11 w-full rounded-xl border border-white/[0.09] bg-[#070d19] px-3 text-sm text-white"><option value={1000}>1 km</option><option value={3000}>3 km</option><option value={5000}>5 km</option><option value={10000}>10 km</option><option value={20000}>20 km</option></select></label>
        <button type="button" onClick={() => void search()} disabled={!position || loading} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50">{loading ? 'Searching…' : <><Navigation size={16}/>Search this area</>}</button>
        {!position && <p className="mt-3 text-sm text-slate-400">Enable location to search for nearby places.</p>}{loading && <p role="status" className="mt-3 text-sm text-slate-400">Searching Google Places…</p>}{placesError && <p role="alert" className="mt-3 rounded-xl border border-rose-300/15 bg-rose-300/[0.04] p-3 text-sm text-rose-200">{placesError}</p>}
        {result && !loading && <div className="mt-4"><p className="text-xs text-slate-400">{places.length} {categories.find((item) => item.value === category)?.label.toLowerCase()} · {result.source}</p>{places.length === 0 ? <p className="mt-3 rounded-xl bg-[#070d19] p-4 text-sm text-slate-400">No nearby places found in this radius. Try a wider search area.</p> : <div className="mt-3 max-h-[500px] space-y-2 overflow-y-auto pr-1">{places.map((place) => <PlaceRow key={place.id} place={place} position={position!} selected={place.id === selectedId} onSelect={() => setSelectedId(place.id)}/>)}</div>}{selected && <div className="mt-3 rounded-xl border border-cyan-200/15 bg-cyan-200/[0.04] p-3 text-sm"><p className="font-semibold text-white">{selected.name}</p>{selected.address && <p className="mt-1 text-slate-400">{selected.address}</p>}{selected.rating !== null && <p className="mt-1 text-slate-300">★ {selected.rating.toFixed(1)}{selected.userRatingCount !== null ? ` · ${selected.userRatingCount.toLocaleString()} ratings` : ''}</p>}<a className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-medium text-cyan-100 hover:bg-white/[0.05]" href={selected.googleMapsUri ?? `https://www.google.com/maps/dir/?api=1&origin=${position!.latitude},${position!.longitude}&destination=${selected.latitude},${selected.longitude}`} target="_blank" rel="noreferrer">Directions <Navigation size={13}/></a></div>}<p className="mt-3 text-right text-xs font-semibold text-slate-400">Google</p></div>}
      </section>
    </div>
    <p className="mt-4 text-xs text-slate-500">Places and ratings are shown only when supplied by Google. Distances are calculated from coordinates returned by the provider.</p>
  </div></Container>
}

function PlaceRow({ place, position, selected, onSelect }: { place: Place; position: Position; selected: boolean; onSelect: () => void }) {
  const meters = distanceMeters(position, { latitude: place.latitude, longitude: place.longitude })
  const distance = meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
  return <button type="button" onClick={onSelect} aria-pressed={selected} className={`block w-full rounded-xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200 ${selected ? 'border-cyan-200/30 bg-cyan-200/[0.07]' : 'border-white/[0.07] bg-[#070d19] hover:border-white/15'}`}><span className="flex items-start justify-between gap-3"><span className="min-w-0"><span className="block truncate text-sm font-medium text-white">{place.name}</span>{place.address && <span className="mt-1 block line-clamp-2 text-xs leading-5 text-slate-400">{place.address}</span>}</span><span className="shrink-0 text-xs text-slate-400">{distance}</span></span>{place.rating !== null && <span className="mt-2 block text-xs text-amber-200">★ {place.rating.toFixed(1)}{place.userRatingCount !== null ? ` · ${place.userRatingCount.toLocaleString()}` : ''}</span>}</button>
}
