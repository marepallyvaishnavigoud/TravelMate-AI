import { useEffect, useRef } from 'react'
import { LngLatBounds, Map, Marker, NavigationControl, Popup } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { TripRoute } from '../../services/tripService'
import { streetMapStyle } from './streetMapStyle'

type SupportedRoute = Extract<TripRoute, { supported: true }>

function normalizeRouteCoordinates(route: SupportedRoute): [number, number][] {
  const coordinates = route.geometry.coordinates.filter(([longitude, latitude]) =>
    Number.isFinite(longitude) && Number.isFinite(latitude)
    && Math.abs(longitude) <= 180 && Math.abs(latitude) <= 90,
  )
  if (coordinates.length < 2) return []

  const pointDistance = (coordinate: [number, number], endpoint: { longitude: number; latitude: number }) =>
    (coordinate[0] - endpoint.longitude) ** 2 + (coordinate[1] - endpoint.latitude) ** 2
  const orientationScore = (points: [number, number][]) =>
    Math.min(
      pointDistance(points[0], route.origin) + pointDistance(points[points.length - 1], route.destination),
      pointDistance(points[points.length - 1], route.origin) + pointDistance(points[0], route.destination),
    )
  const swappedCoordinates = coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number])

  return orientationScore(swappedCoordinates) < orientationScore(coordinates)
    ? swappedCoordinates
    : coordinates
}

export function TripRouteMap({ route }: { route: SupportedRoute }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const routeCoordinates = normalizeRouteCoordinates(route)
    const routeGeometry = routeCoordinates.length >= 2
      ? { type: 'LineString' as const, coordinates: routeCoordinates }
      : null
    const map = new Map({
      container: containerRef.current,
      style: streetMapStyle,
      center: [route.origin.longitude, route.origin.latitude],
      zoom: 5,
      attributionControl: true,
    })

    mapRef.current = map
    map.on('error', (event) => {
      const status = 'status' in event.error ? event.error.status : undefined
      if (import.meta.env.DEV) console.warn('[TripRouteMap] Map resource error.', { status })
    })
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    map.on('load', () => {
      if (mapRef.current !== map) return
      if (routeGeometry) {
        map.addSource('trip-route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: routeGeometry },
        })
        map.addLayer({
          id: 'trip-route-casing', type: 'line', source: 'trip-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#0f172a', 'line-width': 9, 'line-opacity': 0.9 },
        })
        map.addLayer({
          id: 'trip-route-line', type: 'line', source: 'trip-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#22d3ee', 'line-width': 5, 'line-opacity': 1 },
        })
      }
      const originCoordinates: [number, number] = [route.origin.longitude, route.origin.latitude]
      const destinationCoordinates: [number, number] = [route.destination.longitude, route.destination.latitude]
      new Marker({ color: '#0891b2' }).setLngLat(originCoordinates).addTo(map)
      new Popup({ className: 'travelmate-map-popup', closeButton: false, closeOnClick: false, offset: 28 })
        .setLngLat(originCoordinates)
        .setText(`Start: ${route.origin.name}`)
        .addTo(map)
      new Marker({ color: '#4f46e5' }).setLngLat(destinationCoordinates).addTo(map)
      new Popup({ className: 'travelmate-map-popup', closeButton: false, closeOnClick: false, offset: 28 })
        .setLngLat(destinationCoordinates)
        .setText(`Destination: ${route.destination.name}`)
        .addTo(map)
      const bounds = new LngLatBounds()
      bounds.extend(originCoordinates)
      bounds.extend(destinationCoordinates)
      routeCoordinates.forEach((coordinate) => bounds.extend(coordinate))
      map.fitBounds(bounds, { padding: 48, maxZoom: 10, duration: 0 })
    })
    return () => {
      map.remove()
      if (mapRef.current === map) mapRef.current = null
    }
  }, [route])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const resize = () => map.resize()
    const observer = new ResizeObserver(resize)
    if (containerRef.current) observer.observe(containerRef.current)
    resize()
    return () => observer.disconnect()
  }, [])

  return <div ref={containerRef} aria-label={`Driving route from ${route.origin.name} to ${route.destination.name}`} className="h-[360px] min-h-[320px] w-full overflow-hidden rounded-xl sm:h-[420px]" />
}
