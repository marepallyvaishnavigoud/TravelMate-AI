import { AppError } from '../utils/AppError.js'

export type WeatherQuery = { location: string } | { latitude: number; longitude: number }
export type WeatherLocation = {
  name: string
  country: string | null
  admin1: string | null
  latitude: number
  longitude: number
  timezone: string
}
export type DailyWeather = {
  date: string
  weatherCode: number
  condition: string
  temperatureMaxC: number
  temperatureMinC: number
  precipitationProbabilityMax: number | null
  windSpeedMaxKmh: number
}
export type WeatherResponse = {
  location: WeatherLocation
  timezone: string
  timezoneAbbreviation: string | null
  current: {
    time: string
    temperatureC: number
    feelsLikeC: number
    humidityPercent: number
    windSpeedKmh: number
    weatherCode: number
    condition: string
  }
  forecast: DailyWeather[]
  source: { name: 'Open-Meteo'; attribution: string; url: string; geocodingAttribution: string; geocodingUrl: string }
  cached: boolean
}

type WeatherRequestJson = (url: URL, timeoutMs: number) => Promise<unknown>
type WeatherServiceOptions = { requestJson?: WeatherRequestJson; now?: () => number; cacheTtlMs?: number; maxCacheEntries?: number }
type CacheEntry = { expiresAt: number; value: WeatherResponse }
type ResolvedLocation = WeatherLocation & { timezoneHint?: string }

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const ATTRIBUTION_URL = 'https://open-meteo.com/'
const CACHE_TTL_MS = 15 * 60 * 1000
const REQUEST_TIMEOUT_MS = 10_000

export function describeWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Fog'
  if ([51, 53, 55].includes(code)) return 'Drizzle'
  if ([56, 57].includes(code)) return 'Freezing drizzle'
  if ([61, 63, 65].includes(code)) return 'Rain'
  if ([66, 67].includes(code)) return 'Freezing rain'
  if ([71, 73, 75].includes(code)) return 'Snowfall'
  if (code === 77) return 'Snow grains'
  if ([80, 81, 82].includes(code)) return 'Rain showers'
  if ([85, 86].includes(code)) return 'Snow showers'
  if (code === 95) return 'Thunderstorm'
  if (code === 96 || code === 99) return 'Thunderstorm with hail'
  return `Weather condition code ${code}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function normalizedLocation(value: string): string {
  return value.normalize('NFKC').trim().replace(/\s+/g, ' ')
}

function cacheKey(query: WeatherQuery): string {
  return 'location' in query
    ? `location:${normalizedLocation(query.location).toLocaleLowerCase('en')}`
    : `coordinates:${query.latitude.toFixed(5)},${query.longitude.toFixed(5)}`
}

export async function fetchProviderJson(url: URL, timeoutMs: number): Promise<unknown> {
  let response: Response
  try { response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) }) }
  catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') throw new AppError(504, 'The weather source took too long to respond. Please try again.')
    throw new AppError(502, 'The weather source could not be reached. Please try again.')
  }
  if (response.status === 429) throw new AppError(503, 'The weather source is temporarily rate limited. Please wait and retry.')
  if (!response.ok) throw new AppError(502, 'The weather source returned an error. Please try again later.')
  try { return await response.json() as unknown }
  catch { throw new AppError(502, 'The weather source returned an invalid response.') }
}

function parseGeocodingResult(raw: unknown, query: string): ResolvedLocation {
  if (!isRecord(raw) || !Array.isArray(raw.results)) throw new AppError(502, 'The location service returned an invalid response.')
  const first = raw.results[0]
  if (first === undefined) throw new AppError(404, `No matching destination was found for “${query}”. Try adding a region or country.`)
  if (!isRecord(first) || typeof first.name !== 'string' || !finiteNumber(first.latitude) || !finiteNumber(first.longitude)) throw new AppError(502, 'The location service returned incomplete coordinates.')
  if (first.latitude < -90 || first.latitude > 90 || first.longitude < -180 || first.longitude > 180) throw new AppError(502, 'The location service returned invalid coordinates.')
  return {
    name: first.name,
    country: typeof first.country === 'string' ? first.country : null,
    admin1: typeof first.admin1 === 'string' && first.admin1 ? first.admin1 : null,
    latitude: first.latitude,
    longitude: first.longitude,
    timezone: typeof first.timezone === 'string' && first.timezone ? first.timezone : 'auto',
    timezoneHint: typeof first.timezone === 'string' && first.timezone ? first.timezone : undefined,
  }
}

function numberAt(values: unknown, index: number): number | null {
  if (!Array.isArray(values)) return null
  const value = values[index]
  return finiteNumber(value) ? value : null
}

function parseForecast(raw: unknown, location: ResolvedLocation): WeatherResponse {
  if (!isRecord(raw) || !isRecord(raw.current) || !isRecord(raw.daily)) throw new AppError(502, 'The weather source returned an incomplete forecast.')
  const current = raw.current
  const daily = raw.daily
  const currentTime = current.time
  const currentTemperature = current.temperature_2m
  const feelsLike = current.apparent_temperature
  const humidity = current.relative_humidity_2m
  const wind = current.wind_speed_10m
  const currentCode = current.weather_code
  const timezone = typeof raw.timezone === 'string' && raw.timezone ? raw.timezone : ''
  const dates = daily.time
  if (typeof currentTime !== 'string' || !Number.isFinite(Date.parse(currentTime)) || !finiteNumber(currentTemperature) || !finiteNumber(feelsLike) || !finiteNumber(humidity) || !finiteNumber(wind) || !finiteNumber(currentCode) || !Number.isInteger(currentCode) || currentCode < 0 || currentCode > 99 || humidity < 0 || humidity > 100 || wind < 0 || !Array.isArray(dates) || dates.length === 0 || !timezone) {
    throw new AppError(502, 'The weather source returned invalid current conditions or forecast dates.')
  }
  const forecast: DailyWeather[] = []
  for (let index = 0; index < dates.length; index += 1) {
    const date = dates[index]
    const code = numberAt(daily.weather_code, index)
    const max = numberAt(daily.temperature_2m_max, index)
    const min = numberAt(daily.temperature_2m_min, index)
    const windMax = numberAt(daily.wind_speed_10m_max, index)
    const precipitation = numberAt(daily.precipitation_probability_max, index)
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00Z`)) || code === null || !Number.isInteger(code) || code < 0 || code > 99 || max === null || min === null || min > max || windMax === null || windMax < 0 || precipitation !== null && (precipitation < 0 || precipitation > 100)) {
      throw new AppError(502, 'The weather source returned an invalid daily forecast.')
    }
    forecast.push({ date, weatherCode: code, condition: describeWeatherCode(code), temperatureMaxC: max, temperatureMinC: min, precipitationProbabilityMax: precipitation, windSpeedMaxKmh: windMax })
  }
  return {
    location: { name: location.name, country: location.country, admin1: location.admin1, latitude: finiteNumber(raw.latitude) ? raw.latitude : location.latitude, longitude: finiteNumber(raw.longitude) ? raw.longitude : location.longitude, timezone },
    timezone,
    timezoneAbbreviation: typeof raw.timezone_abbreviation === 'string' ? raw.timezone_abbreviation : null,
    current: { time: currentTime, temperatureC: currentTemperature, feelsLikeC: feelsLike, humidityPercent: humidity, windSpeedKmh: wind, weatherCode: currentCode, condition: describeWeatherCode(currentCode) },
    forecast,
    source: { name: 'Open-Meteo', attribution: 'Weather data by Open-Meteo.com, licensed under CC BY 4.0.', url: ATTRIBUTION_URL, geocodingAttribution: 'Location data based on GeoNames.', geocodingUrl: 'https://www.geonames.org/' },
    cached: false,
  }
}

export function createWeatherService(options: WeatherServiceOptions = {}) {
  const requestJson = options.requestJson ?? fetchProviderJson
  const now = options.now ?? Date.now
  const cacheTtlMs = options.cacheTtlMs ?? CACHE_TTL_MS
  const maxCacheEntries = options.maxCacheEntries ?? 500
  const cache = new Map<string, CacheEntry>()
  const inFlight = new Map<string, Promise<WeatherResponse>>()

  async function resolveLocation(query: WeatherQuery): Promise<ResolvedLocation> {
    if (!('location' in query)) {
      return { name: `Coordinates ${query.latitude.toFixed(4)}, ${query.longitude.toFixed(4)}`, country: null, admin1: null, latitude: query.latitude, longitude: query.longitude, timezone: 'auto' }
    }
    const name = normalizedLocation(query.location)
    const url = new URL(GEOCODING_URL)
    url.searchParams.set('name', name)
    url.searchParams.set('count', '1')
    url.searchParams.set('language', 'en')
    return parseGeocodingResult(await requestJson(url, REQUEST_TIMEOUT_MS), name)
  }

  async function load(query: WeatherQuery): Promise<WeatherResponse> {
    const location = await resolveLocation(query)
    const url = new URL(FORECAST_URL)
    url.searchParams.set('latitude', String(location.latitude))
    url.searchParams.set('longitude', String(location.longitude))
    url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m')
    url.searchParams.set('daily', 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max')
    url.searchParams.set('forecast_days', '16')
    url.searchParams.set('timezone', location.timezoneHint ?? 'auto')
    url.searchParams.set('temperature_unit', 'celsius')
    url.searchParams.set('wind_speed_unit', 'kmh')
    url.searchParams.set('precipitation_unit', 'mm')
    url.searchParams.set('timeformat', 'iso8601')
    const response = await requestJson(url, REQUEST_TIMEOUT_MS)
    return parseForecast(response, location)
  }

  async function getWeather(query: WeatherQuery): Promise<WeatherResponse> {
    const key = cacheKey(query)
    const cached = cache.get(key)
    if (cached && cached.expiresAt > now()) {
      cache.delete(key)
      cache.set(key, cached)
      return { ...cached.value, cached: true }
    }
    if (cached) cache.delete(key)
    const pending = inFlight.get(key)
    if (pending) return pending
    const request = load(query).then((result) => {
      cache.set(key, { value: result, expiresAt: now() + cacheTtlMs })
      while (cache.size > maxCacheEntries) {
        const oldest = cache.keys().next().value
        if (oldest === undefined) break
        cache.delete(oldest)
      }
      return result
    }).finally(() => { inFlight.delete(key) })
    inFlight.set(key, request)
    return request
  }

  function getCachedWeather(location: string): WeatherResponse | null {
    const entry = cache.get(`location:${normalizedLocation(location).toLocaleLowerCase('en')}`)
    return entry && entry.expiresAt > now() ? { ...entry.value, cached: true } : null
  }

  return { getWeather, getCachedWeather, clearCache: () => cache.clear() }
}

const weatherService = createWeatherService()
export const getWeather = weatherService.getWeather
export const getCachedWeather = weatherService.getCachedWeather
