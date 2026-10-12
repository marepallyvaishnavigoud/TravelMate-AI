# Step 14 — Travel Assistant

**Status: Complete**

TravelMate AI now has a local, rule-based travel assistant at `/assistant`. The feature does not call a language model, require an AI API key, or depend on the FastAPI itinerary service.

## What was added

- Protected `POST /api/assistant/chat` endpoint with a 1,000-character message limit and per-IP request rate limit.
- Deterministic responses for destination ideas, packing, family and solo travel, budgets, transport, local food, saved itineraries, trip duration, weather, accommodation, safety, and general planning.
- Honest responses for unsupported questions and live information the assistant cannot verify, such as weather, schedules, venue details, availability, prices, and bookings.
- Trip context selected from the signed-in user's trips. The backend checks trip ownership before reading trip or saved itinerary data.
- Responsive chat UI with suggested questions, loading and retry states, session-only message history, and a clear-chat control.
- Backend tests using Node's built-in test runner.

## Verification

- `cd backend && npm test` — passed, 16 tests.
- `cd frontend && npm run build` — passed. Vite reports a large-bundle warning.
- `cd frontend && npm run lint` — passed.

## Run locally

Start MongoDB, then run the backend and frontend in separate terminals:

```powershell
cd C:\TravelMate-AI\backend
npm run dev
```

```powershell
cd C:\TravelMate-AI\frontend
npm run dev
```

The existing FastAPI service is still needed for Step 13 itinerary generation, but not for this assistant.
