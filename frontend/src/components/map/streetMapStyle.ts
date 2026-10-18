import type { StyleSpecification } from 'maplibre-gl'

export const streetMapStyle: StyleSpecification = {
  version: 8,
  name: 'Esri World Street Map',
  sources: {
    'world-streets': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Sources: Esri, HERE, Garmin, FAO, NOAA, USGS, OpenStreetMap contributors, and the GIS User Community',
    },
  },
  layers: [
    { id: 'world-streets', type: 'raster', source: 'world-streets', minzoom: 0, maxzoom: 19 },
  ],
}
