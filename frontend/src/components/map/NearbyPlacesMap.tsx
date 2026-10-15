import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Position = { latitude: number; longitude: number }

export function NearbyPlacesMap({ position }: { position: Position }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
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
      center: [position.longitude, position.latitude],
      zoom: 12,
      attributionControl: true,
    })

    mapRef.current = map
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right')
    map.on('error', (event) => { if (import.meta.env.DEV) console.warn('[NearbyPlacesMap] Map resource error.', { status: 'status' in event.error ? event.error.status : undefined }) })
    return () => { markersRef.current.forEach((marker) => marker.remove()); markersRef.current = []; map.remove(); mapRef.current = null }
  }, [position, token])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
    markersRef.current.push(new mapboxgl.Marker({ color: '#22d3ee' }).setLngLat([position.longitude, position.latitude]).setPopup(new mapboxgl.Popup().setText('Your current location')).addTo(map))
    map.flyTo({ center: [position.longitude, position.latitude], zoom: 13, duration: 400 })
  }, [position])

  return <div ref={containerRef} aria-label="Map showing your current position and nearby places" className="h-[360px] min-h-[320px] w-full overflow-hidden rounded-xl sm:h-[460px]" />
}
