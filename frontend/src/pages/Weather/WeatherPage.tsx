import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Activity, AlertCircle, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Droplets, MapPin, RefreshCw, Search, ShieldCheck, Sun, Wind } from 'lucide-react'
import { Container } from '../../components/ui/Container'
import { useAuth } from '../../context/AuthContext'
import { authErrorMessage } from '../../services/authService'
import { tripService, type Trip } from '../../services/tripService'
import { weatherService, type DailyWeather, type WeatherData } from '../../services/weatherService'

function WeatherIcon({ code, size = 22, className = '' }: { code: number; size?: number; className?: string }) {
  const Icon = code === 0 || code === 1 ? Sun
    : code === 2 ? CloudSun
      : code === 3 ? Cloud
        : code === 45 || code === 48 ? CloudFog
          : [51, 53, 55, 56, 57].includes(code) ? CloudDrizzle
            : [61, 63, 65, 66, 67, 80, 81, 82].includes(code) ? CloudRain
              : [71, 73, 75, 77, 85, 86].includes(code) ? CloudSnow
                : [95, 96, 99].includes(code) ? CloudLightning
                  : Activity
  return <Icon size={size} className={className} aria-hidden="true"/>
}

function formatLocalTime(value: string, timezone: string): string {
  try { return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(value)) }
  catch { return value }
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }): string {
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
}

function ForecastCard({ day, tripDate }: { day: DailyWeather; tripDate: boolean }) {
  return <article className={`rounded-2xl border p-4 transition ${tripDate ? 'border-cyan-200/25 bg-cyan-200/[0.05]' : 'border-white/[0.07] bg-[#0a1423]'}`}>
    <div className="flex items-center justify-between gap-2"><p className="text-xs font-semibold text-white">{formatDate(day.date)}</p>{tripDate && <span className="text-[9px] font-bold uppercase tracking-wide text-cyan-200">Trip</span>}</div>
    <WeatherIcon code={day.weatherCode} size={21} className="mt-4 text-cyan-100"/>
    <p className="mt-2 text-[11px] text-slate-400">{day.condition}</p>
    <p className="mt-3 text-sm font-semibold text-white">{Math.round(day.temperatureMaxC)}° <span className="font-normal text-slate-500">/ {Math.round(day.temperatureMinC)}°</span></p>
    <div className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-2 text-[10px] text-slate-500">{day.precipitationProbabilityMax !== null && <p className="flex items-center gap-1.5"><Droplets size={11}/>Rain chance {Math.round(day.precipitationProbabilityMax)}%</p>}<p className="flex items-center gap-1.5"><Wind size={11}/>{Math.round(day.windSpeedMaxKmh)} km/h max</p></div>
  </article>
}

export function WeatherPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTripId = searchParams.get('tripId') ?? ''
  const { isAuthenticated } = useAuth()
  const [trips, setTrips] = useState<Trip[]>([])
  const [tripsLoading, setTripsLoading] = useState(false)
  const [tripsError, setTripsError] = useState('')
  const [trip, setTrip] = useState<Trip | null>(null)
  const [location, setLocation] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) { setTrips([]); setTripsLoading(false); return }
    let active = true
    setTripsLoading(true)
    void tripService.getTrips().then((items) => { if (active) setTrips(items) }).catch((cause) => { if (active) setTripsError(authErrorMessage(cause)) }).finally(() => { if (active) setTripsLoading(false) })
    return () => { active = false }
  }, [isAuthenticated])

  useEffect(() => {
    if (!requestedTripId || !isAuthenticated) { setTrip(null); return }
    let active = true
    void tripService.getTripById(requestedTripId).then((selected) => {
      if (!active) return
      setTrip(selected)
      setLocation(selected.destination)
      void loadWeather(selected.destination)
    }).catch((cause) => { if (active) { setTrip(null); setError(authErrorMessage(cause)) } })
    return () => { active = false }
  }, [requestedTripId, isAuthenticated])

  async function loadWeather(value: string) {
    const normalized = value.trim()
    if (!normalized) return
    setLoading(true)
    setError('')
    setWeather(null)
    try { setWeather(await weatherService.getWeather(normalized)) }
    catch (cause) { setWeather(null); setError(authErrorMessage(cause)) }
    finally { setLoading(false) }
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setTrip(null); if (requestedTripId) setSearchParams({}); void loadWeather(location) }
  function selectTrip(value: string) {
    setSearchParams(value ? { tripId: value } : {})
    if (!value) setTrip(null)
  }

  const tripStart = trip?.startDate.slice(0, 10)
  const tripEnd = trip?.endDate.slice(0, 10)
  const forecastStart = weather?.forecast[0]?.date
  const forecastEnd = weather?.forecast[weather.forecast.length - 1]?.date
  const tripInForecast = Boolean(tripStart && tripEnd && forecastStart && forecastEnd && tripStart >= forecastStart && tripEnd <= forecastEnd)
  const tripOverlapsForecast = Boolean(tripStart && tripEnd && forecastStart && forecastEnd && tripEnd >= forecastStart && tripStart <= forecastEnd)
  const tripHasEnded = Boolean(tripEnd && forecastStart && tripEnd < forecastStart)
  const tripBeyondForecast = Boolean(tripStart && forecastEnd && tripStart > forecastEnd)
  const tripForecastMessage = tripInForecast
    ? 'Your trip dates are in this forecast'
    : tripOverlapsForecast
      ? 'Only part of your trip is in this forecast'
      : tripHasEnded
        ? 'This trip has already ended'
        : tripBeyondForecast
          ? 'Your trip is beyond the available forecast window'
          : 'A reliable forecast is not available for these trip dates yet'

  return <Container className="py-7 sm:py-10"><div className="mx-auto max-w-6xl">
    <header className="relative isolate overflow-hidden rounded-3xl border border-white/[0.08] bg-[radial-gradient(ellipse_at_80%_0%,rgba(34,211,238,.12),transparent_32%),radial-gradient(ellipse_at_15%_100%,rgba(99,102,241,.16),transparent_38%),#0a1220] p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><span className="inline-flex items-center gap-2 rounded-full border border-cyan-100/15 bg-cyan-100/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.19em] text-cyan-100"><CloudSun size={13}/>Live weather · 16-day forecast</span><h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Weather for your journey</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Current model conditions and the available forecast, with local times for the selected destination. Forecast availability depends on your travel dates.</p></div><span className="hidden size-14 place-items-center rounded-2xl border border-indigo-200/15 bg-indigo-300/10 text-indigo-100 sm:grid"><CloudSun size={24}/></span></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(240px,1fr)_minmax(240px,1fr)] sm:items-end">
        <label className="block text-xs font-semibold text-slate-300">Use one of your trips <span className="mt-1 block font-normal text-slate-500">Or search for any city or region below.</span><select aria-label="Choose a trip destination" value={requestedTripId} onChange={(event) => selectTrip(event.target.value)} disabled={!isAuthenticated || tripsLoading} className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#07101c] px-3 text-sm text-white outline-none focus:border-cyan-200/40 disabled:opacity-60"><option value="">Search any destination</option>{trips.map((item) => <option key={item._id} value={item._id}>{item.title} · {item.destination}</option>)}</select></label>
        <form onSubmit={submitSearch} className="flex items-end gap-2"><label htmlFor="weather-location" className="min-w-0 flex-1 text-xs font-semibold text-slate-300">Destination search<input id="weather-location" value={location} onChange={(event) => setLocation(event.target.value)} minLength={2} maxLength={120} required placeholder="Search a city or region" className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#07101c] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-200/40"/></label><button type="submit" disabled={loading || location.trim().length < 2} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-indigo-500 px-3.5 text-xs font-bold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"><Search size={14}/><span className="hidden sm:inline">Search</span></button></form>
      </div>
      {tripsError && <p role="status" className="mt-3 text-xs text-amber-200">Your saved trips could not be loaded; destination search is still available. {tripsError}</p>}
    </header>

    {error && <section role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-300/15 bg-rose-300/[0.04] p-4"><p className="flex items-center gap-2 text-sm text-rose-100"><AlertCircle size={16}/>{error}</p><button type="button" onClick={() => void loadWeather(location)} disabled={loading || !location.trim()} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-xs font-semibold text-slate-200 disabled:opacity-50"><RefreshCw size={13}/>Retry</button></section>}
    {loading && <div role="status" className="mt-5 grid min-h-64 place-items-center rounded-3xl border border-white/[0.08] bg-[#0a1220] text-sm text-slate-400"><span className="inline-flex items-center gap-3"><RefreshCw size={17} className="animate-spin text-cyan-200"/>Fetching current weather and forecast…</span></div>}
    {!loading && !error && !weather && <div className="mt-5 rounded-3xl border border-dashed border-white/[0.12] bg-[#0a1220] px-5 py-14 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.06] text-cyan-100"><MapPin size={21}/></span><h2 className="mt-4 text-lg font-semibold text-white">Choose a destination to begin</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">Search for a city or pick a saved trip. Weather appears only after it is returned by the live provider.</p></div>}

    {!loading && weather && <div className="mt-5 space-y-5">
      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <article className="relative isolate overflow-hidden rounded-3xl border border-cyan-100/10 bg-[radial-gradient(ellipse_at_80%_0%,rgba(34,211,238,.15),transparent_40%),linear-gradient(140deg,#101c30,#0a1220)] p-5 sm:p-7"><div className="relative z-10 flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">Current model conditions</p><h2 className="mt-2 text-2xl font-bold text-white">{weather.location.name}{weather.location.admin1 && weather.location.admin1 !== weather.location.name ? `, ${weather.location.admin1}` : ''}</h2><p className="mt-1 text-sm text-slate-400">{[weather.location.country].filter(Boolean).join('') || `${weather.location.latitude.toFixed(3)}, ${weather.location.longitude.toFixed(3)}`}</p></div><button type="button" onClick={() => void loadWeather(location)} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#08111e]/50 px-3 text-xs font-semibold text-slate-200 hover:bg-white/[0.05] disabled:opacity-50"><RefreshCw size={13} className={loading ? 'animate-spin' : ''}/>Refresh</button></div>
          <div className="relative z-10 mt-8 flex flex-wrap items-center gap-5"><WeatherIcon code={weather.current.weatherCode} size={54} className="text-cyan-100"/><div><p className="text-5xl font-bold tracking-tight text-white">{Math.round(weather.current.temperatureC)}°<span className="ml-1 text-xl font-medium text-slate-400">C</span></p><p className="mt-1 text-sm font-medium text-slate-300">{weather.current.condition}</p></div></div>
          <div className="relative z-10 mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-4 text-xs text-slate-400"><p>Feels like <strong className="text-slate-200">{Math.round(weather.current.feelsLikeC)}°C</strong></p><p>Local time <strong className="text-slate-200">{formatLocalTime(weather.current.time, weather.timezone)}</strong></p><p>{weather.timezone}{weather.timezoneAbbreviation ? ` · ${weather.timezoneAbbreviation}` : ''}</p></div>
        </article>
        <article className="rounded-3xl border border-white/[0.08] bg-[#0a1423] p-5 sm:p-7"><div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">At a glance</p><h2 className="mt-2 text-lg font-semibold text-white">Current details</h2></div><span className="grid size-10 place-items-center rounded-xl bg-indigo-300/10 text-indigo-100"><ShieldCheck size={18}/></span></div><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/[0.06] bg-[#07101c] p-4"><Droplets size={16} className="text-cyan-200"/><p className="mt-3 text-[10px] text-slate-500">Humidity</p><p className="mt-1 text-lg font-semibold text-white">{Math.round(weather.current.humidityPercent)}%</p></div><div className="rounded-2xl border border-white/[0.06] bg-[#07101c] p-4"><Wind size={16} className="text-cyan-200"/><p className="mt-3 text-[10px] text-slate-500">Wind speed</p><p className="mt-1 text-lg font-semibold text-white">{Math.round(weather.current.windSpeedKmh)} <span className="text-xs font-normal text-slate-500">km/h</span></p></div></div><p className="mt-4 text-xs leading-5 text-slate-500">Model timestamp: {formatLocalTime(weather.current.time, weather.timezone)}. Forecast values can change as new model runs arrive.</p></article>
      </section>

      {trip && tripStart && tripEnd && <section className={`rounded-2xl border p-4 ${tripInForecast ? 'border-emerald-200/15 bg-emerald-200/[0.035]' : 'border-amber-200/15 bg-amber-200/[0.035]'}`}><p className={`text-sm font-semibold ${tripInForecast ? 'text-emerald-100' : 'text-amber-100'}`}>{tripForecastMessage}</p><p className="mt-1 text-xs leading-5 text-slate-400">Trip dates: {formatDate(tripStart, { day: 'numeric', month: 'short', year: 'numeric' })} – {formatDate(tripEnd, { day: 'numeric', month: 'short', year: 'numeric' })}.{forecastStart && forecastEnd ? ` Available forecast: ${formatDate(forecastStart, { day: 'numeric', month: 'short', year: 'numeric' })} – ${formatDate(forecastEnd, { day: 'numeric', month: 'short', year: 'numeric' })}.` : ''}{tripHasEnded ? ' Historical daily weather is not provided here.' : ' Longer-range climate estimates are not shown as a forecast.'}</p></section>}

      <section><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">Daily outlook</p><h2 className="mt-1 text-xl font-semibold text-white">Available forecast</h2><p className="mt-1 text-xs text-slate-500">Local calendar dates · metric units · 16-day provider limit</p></div><p className="text-[10px] text-slate-500">{weather.cached ? 'Using a recent cached response' : 'Latest response received'}</p></div><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">{weather.forecast.map((day) => <ForecastCard key={day.date} day={day} tripDate={Boolean(tripInForecast && tripStart && tripEnd && day.date >= tripStart && day.date <= tripEnd)}/>)}</div></section>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-[#080e18] px-4 py-3 text-[11px] leading-5 text-slate-500"><p>{weather.source.attribution} {weather.source.geocodingAttribution} Model-based information; conditions and forecasts may change.</p><div className="flex gap-4"><a href={weather.source.url} target="_blank" rel="noreferrer" className="font-semibold text-cyan-200 underline decoration-cyan-200/30 underline-offset-4">Open-Meteo source</a><a href={weather.source.geocodingUrl} target="_blank" rel="noreferrer" className="font-semibold text-cyan-200 underline decoration-cyan-200/30 underline-offset-4">GeoNames</a></div></footer>
    </div>}
  </div></Container>
}
