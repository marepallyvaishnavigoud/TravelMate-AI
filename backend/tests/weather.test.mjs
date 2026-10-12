import assert from 'node:assert/strict'
import test from 'node:test'
import { AppError } from '../dist/utils/AppError.js'
import { weatherQuerySchema } from '../dist/validators/weatherValidators.js'
import { createWeatherService, describeWeatherCode, fetchProviderJson } from '../dist/services/weatherService.js'

const dates = Array.from({ length: 16 }, (_, index) => new Date(Date.UTC(2026, 9, 12 + index)).toISOString().slice(0, 10))
const forecast = {
  latitude: 28.61, longitude: 77.2, timezone: 'Asia/Kolkata', timezone_abbreviation: 'GMT+5:30',
  current: { time: '2026-10-12T18:00+05:30', temperature_2m: 29.2, apparent_temperature: 31.1, relative_humidity_2m: 68, wind_speed_10m: 12.3, weather_code: 2 },
  daily: {
    time: dates, weather_code: dates.map(() => 2), temperature_2m_max: dates.map(() => 32),
    temperature_2m_min: dates.map(() => 23), precipitation_probability_max: dates.map(() => 20),
    wind_speed_10m_max: dates.map(() => 18),
  },
}
const place = { name: 'New Delhi', latitude: 28.61, longitude: 77.2, country: 'India', admin1: 'Delhi', timezone: 'Asia/Kolkata' }

function mockedRequest(calls = []) {
  return async (url) => {
    calls.push(url)
    return url.hostname === 'geocoding-api.open-meteo.com' ? { results: [place] } : forecast
  }
}

test('valid destination uses Open-Meteo geocoding and documented metric forecast fields', async () => {
  const calls = []
  const service = createWeatherService({ requestJson: mockedRequest(calls) })
  const result = await service.getWeather({ location: '  Delhi  ' })
  assert.equal(result.location.name, 'New Delhi')
  assert.equal(result.timezone, 'Asia/Kolkata')
  assert.equal(result.current.temperatureC, 29.2)
  assert.equal(result.current.feelsLikeC, 31.1)
  assert.equal(result.current.humidityPercent, 68)
  assert.equal(result.current.windSpeedKmh, 12.3)
  assert.equal(result.forecast.length, 16)
  assert.equal(calls.length, 2)
  const forecastUrl = calls.find((url) => url.hostname === 'api.open-meteo.com')
  assert.equal(forecastUrl.searchParams.get('temperature_unit'), 'celsius')
  assert.equal(forecastUrl.searchParams.get('wind_speed_unit'), 'kmh')
  assert.equal(forecastUrl.searchParams.get('timezone'), 'Asia/Kolkata')
  assert.equal(forecastUrl.searchParams.get('forecast_days'), '16')
  assert.match(result.source.attribution, /CC BY 4.0/)
})

test('valid coordinate requests skip geocoding and keep resolved forecast coordinates', async () => {
  const calls = []
  const service = createWeatherService({ requestJson: mockedRequest(calls) })
  const result = await service.getWeather({ latitude: 28.61, longitude: 77.2 })
  assert.equal(calls.length, 1)
  assert.equal(result.location.latitude, 28.61)
  assert.equal(result.forecast[0].date, dates[0])
})

test('query validation accepts locations or complete coordinate pairs and rejects invalid ranges', () => {
  assert.deepEqual(weatherQuerySchema.parse({ location: ' Goa, India ' }), { location: 'Goa, India' })
  assert.deepEqual(weatherQuerySchema.parse({ latitude: '90', longitude: '-180' }), { latitude: 90, longitude: -180 })
  for (const query of [{}, { latitude: '12' }, { latitude: '91', longitude: '0' }, { latitude: '0', longitude: '181' }, { location: 'x' }, { location: 'Rome', latitude: '1', longitude: '1' }, { location: 'Delhi', extra: 'ignored' }]) assert.throws(() => weatherQuerySchema.parse(query))
})

test('unknown destinations return 404 and are not mistaken for provider failures', async () => {
  const service = createWeatherService({ requestJson: async () => ({ results: [] }) })
  await assert.rejects(() => service.getWeather({ location: 'Not a real place' }), (error) => error instanceof AppError && error.statusCode === 404)
})

test('caching reuses successful data for 15 minutes and exposes cache freshness', async () => {
  let now = 1000
  const calls = []
  const service = createWeatherService({ requestJson: mockedRequest(calls), now: () => now })
  const first = await service.getWeather({ location: 'Delhi' })
  assert.equal(first.cached, false)
  assert.ok(service.getCachedWeather('Delhi'))
  const second = await service.getWeather({ location: 'Delhi' })
  assert.equal(second.cached, true)
  assert.equal(calls.length, 2)
  now += 15 * 60 * 1000 + 1
  assert.equal(service.getCachedWeather('Delhi'), null)
  await service.getWeather({ location: 'Delhi' })
  assert.equal(calls.length, 4)
})

test('provider timeouts and outages map to useful errors', async () => {
  const originalFetch = globalThis.fetch
  try {
    globalThis.fetch = async () => { throw new DOMException('Timed out', 'TimeoutError') }
    await assert.rejects(() => fetchProviderJson(new URL('https://api.open-meteo.com/v1/forecast'), 1), (error) => error instanceof AppError && error.statusCode === 504)
    globalThis.fetch = async () => new Response('{}', { status: 503 })
    await assert.rejects(() => fetchProviderJson(new URL('https://api.open-meteo.com/v1/forecast'), 10), (error) => error instanceof AppError && error.statusCode === 502)
  } finally { globalThis.fetch = originalFetch }
})

test('invalid provider responses fail closed rather than creating weather values', async () => {
  const service = createWeatherService({ requestJson: async (url) => url.hostname === 'geocoding-api.open-meteo.com' ? { results: [place] } : { ...forecast, current: { ...forecast.current, temperature_2m: null } } })
  await assert.rejects(() => service.getWeather({ location: 'Delhi' }), (error) => error instanceof AppError && error.statusCode === 502)
  const badDates = createWeatherService({ requestJson: async (url) => url.hostname === 'geocoding-api.open-meteo.com' ? { results: [place] } : { ...forecast, daily: { ...forecast.daily, temperature_2m_min: dates.map(() => 40) } } })
  await assert.rejects(() => badDates.getWeather({ location: 'Delhi' }), (error) => error instanceof AppError && error.statusCode === 502)
})

test('weather codes map only to their documented WMO descriptions', () => {
  assert.equal(describeWeatherCode(0), 'Clear sky')
  assert.equal(describeWeatherCode(61), 'Rain')
  assert.equal(describeWeatherCode(95), 'Thunderstorm')
  assert.equal(describeWeatherCode(42), 'Weather condition code 42')
})
