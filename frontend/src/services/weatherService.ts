import { api } from './authService'

export type DailyWeather = {
  date: string
  weatherCode: number
  condition: string
  temperatureMaxC: number
  temperatureMinC: number
  precipitationProbabilityMax: number | null
  windSpeedMaxKmh: number
}
export type WeatherData = {
  location: { name: string; country: string | null; admin1: string | null; latitude: number; longitude: number; timezone: string }
  timezone: string
  timezoneAbbreviation: string | null
  current: { time: string; temperatureC: number; feelsLikeC: number; humidityPercent: number; windSpeedKmh: number; weatherCode: number; condition: string }
  forecast: DailyWeather[]
  source: { name: 'Open-Meteo'; attribution: string; url: string; geocodingAttribution: string; geocodingUrl: string }
  cached: boolean
}

export const weatherService = {
  async getWeather(location: string): Promise<WeatherData> {
    const { data } = await api.get<{ success: true; data: WeatherData }>('/weather', { params: { location }, timeout: 25_000 })
    return data.data
  },
}
