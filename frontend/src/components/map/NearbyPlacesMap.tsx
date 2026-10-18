import { useEffect, useRef } from 'react'
import { Map, Marker, NavigationControl, Popup } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

type Position = { latitude: number; longitude: number }

export function NearbyPlacesMap({ position }: { position: Position }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)
  const markersRef = useRef<Marker[]>([])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [position.longitude, position.latitude],
      zoom: 12,
      attributionControl: true,
    })

    mapRef.current = map
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right')
    map.on('error', (event) => { if (import.meta.env.DEV) console.warn('[NearbyPlacesMap] Map resource error.', { status: 'status' in event.error ? event.error.status : undefined }) })
    return () => { markersRef.current.forEach((marker) => marker.remove()); markersRef.current = []; map.remove(); mapRef.current = null }
  }, [position])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []
    const coordinates: [number, number] = [position.longitude, position.latitude]
    markersRef.current.push(new Marker({ color: '#0891b2' }).setLngLat(coordinates).addTo(map))
    new Popup({ className: 'travelmate-map-popup', closeButton: false, closeOnClick: false, offset: 28 })
      .setLngLat(coordinates)
      .setText('Your current location')
      .addTo(map)
    map.flyTo({ center: [position.longitude, position.latitude], zoom: 13, duration: 400 })
  }, [position])

  return <div ref={containerRef} aria-label="Map showing your current position and nearby places" className="h-[360px] min-h-[320px] w-full overflow-hidden rounded-xl sm:h-[460px]" />
}
