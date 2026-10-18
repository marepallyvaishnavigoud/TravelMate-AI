import type { StyleSpecification } from 'maplibre-gl'

export const streetMapStyle: StyleSpecification = {
  version: 8,
  name: 'Esri Dark Gray Street Map',
  sources: {
    'dark-gray-base': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Tiles &copy; Esri, HERE, Garmin, FAO, NOAA, USGS, &copy; OpenStreetMap contributors',
    },
    'dark-gray-labels': {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Tiles &copy; Esri, HERE, Garmin, FAO, NOAA, USGS, &copy; OpenStreetMap contributors',
    },
  },
  layers: [
    { id: 'dark-gray-base', type: 'raster', source: 'dark-gray-base', minzoom: 0, maxzoom: 19 },
    { id: 'dark-gray-labels', type: 'raster', source: 'dark-gray-labels', minzoom: 0, maxzoom: 19 },
  ],
}
