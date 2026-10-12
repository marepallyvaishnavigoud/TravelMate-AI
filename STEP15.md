# Step 15 — Weather Integration

**Status: Complete**

TravelMate AI now has a destination weather page at `/weather`, backed by Open-Meteo's free forecast and geocoding APIs. No API key or payment method is required. The weather page can also open from a saved trip and highlight dates covered by the forecast.

## What was added

- Backend `GET /api/weather` endpoint supporting a destination name or latitude/longitude.
- Open-Meteo geocoding and current conditions plus up to 16 forecast days, with metric units and destination timezone.
- 15-minute in-memory response cache, in-flight request reuse, provider timeouts, input validation, and per-IP rate limiting.
- Weather page with location search, saved-trip selection, loading/error/retry states, current conditions, daily forecast, and trip-date highlighting.
- Open-Meteo weather snapshots available to the Step 14 assistant only when recently cached; it does not fetch or invent live weather during chat.
- Open-Meteo and GeoNames attribution in the UI; forecast dates beyond the returned forecast window are identified as unavailable.

## Verification

- `cd backend && npm test` — passed, 25 tests.
- `cd frontend && npm run build` — passed. Vite reports a large-bundle warning.
- `cd frontend && npm run lint` — passed.

## Run locally

Start MongoDB, then start backend and frontend in separate terminals:

```powershell
cd C:\TravelMate-AI\backend
npm run dev
```

```powershell
cd C:\TravelMate-AI\frontend
npm run dev
```

Open `/weather` in the frontend. Weather lookup needs no Mapbox token and no weather API key. Existing Step 13 itinerary generation continues to use its separate AI service.

## Provider terms

The Open-Meteo free API is for non-commercial use, requires CC BY 4.0 attribution, and has no uptime guarantee. Check Open-Meteo's current [terms](https://open-meteo.com/en/terms), [pricing](https://open-meteo.com/en/pricing), [forecast API](https://open-meteo.com/en/docs), and [geocoding API](https://open-meteo.com/en/docs/geocoding-api) before deploying or using this for a commercial service.
