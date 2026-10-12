from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from .generator import generate_itinerary
from .schemas import TripRequest

app = FastAPI(title="TravelMate AI Itinerary Service", version="1.0.0")


@app.get("/health")
def health():
    return {"success": True, "status": "healthy", "generationMethod": "rule-based"}


@app.post("/api/itinerary/generate")
def generate(payload: TripRequest):
    return generate_itinerary(payload)
