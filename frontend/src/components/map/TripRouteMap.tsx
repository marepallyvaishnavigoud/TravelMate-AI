import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { TripRoute } from '../../services/tripService'

type SupportedRoute = Extract<TripRoute, { supported: true }>

export function TripRouteMap({ route }: { route: SupportedRoute }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const token = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    if (token) {
      mapboxgl.accessToken = token
    }

    const baseStyle = token
      ? 'mapbox://styles/mapbox/dark-v11'
      : ({
          version: 8,
          name: 'OpenStreetMap fallback',
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap contributors',
            },
          },
          layers: [{ id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 }],
        } as mapboxgl.StyleSpecification)

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: baseStyle,
      center: [route.origin.longitude, route.origin.latitude],
      zoom: 5,
      attributionControl: true,
    })

    mapRef.current = map
    map.on('error', (event) => {
      const status = 'status' in event.error ? event.error.status : undefined
      if (import.meta.env.DEV) console.warn('[TripRouteMap] Map resource error.', { status })
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.on('load', () => {
      if (mapRef.current !== map) return
      map.addSource('trip-route', { type: 'geojson', data: route.geometry })
      map.addLayer({
        id: 'trip-route-line', type: 'line', source: 'trip-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: { 'line-color': '#67e8f9', 'line-width': 5, 'line-opacity': 0.9 },
      })
      new mapboxgl.Marker({ color: '#22d3ee' }).setLngLat([route.origin.longitude, route.origin.latitude]).setPopup(new mapboxgl.Popup().setText(route.origin.name)).addTo(map)
      new mapboxgl.Marker({ color: '#818cf8' }).setLngLat([route.destination.longitude, route.destination.latitude]).setPopup(new mapboxgl.Popup().setText(route.destination.name)).addTo(map)
      const bounds = new mapboxgl.LngLatBounds()
      route.geometry.coordinates.forEach((coordinate) => bounds.extend(coordinate))
      map.fitBounds(bounds, { padding: 48, maxZoom: 10, duration: 0 })
    })
    return () => {
      map.remove()
      if (mapRef.current === map) mapRef.current = null
    }
  }, [route, token])

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
