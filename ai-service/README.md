# TravelMate AI local itinerary service

This service creates deterministic, rule-based itinerary suggestions locally. It has no LLM, API key, map, places, or internet dependency at runtime. Suggestions are generic and unverified. Price figures are illustrative estimates, not quotes.

From the repository root:

```powershell
py -m venv ai-service/.venv
ai-service/.venv/Scripts/Activate.ps1
python -m pip install -r ai-service/requirements.txt
python -m uvicorn app.main:app --app-dir ai-service --host 127.0.0.1 --port 8001
```

Health check: `http://127.0.0.1:8001/health`. Generate: `POST http://127.0.0.1:8001/api/itinerary/generate`.

Tests (from the repository root):

```powershell
Push-Location ai-service
python -m pytest tests -q
Pop-Location
```
