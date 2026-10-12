from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class TripRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    tripId: str | None = None
    title: str = Field(min_length=1, max_length=120)
    origin: str = Field(min_length=1, max_length=120)
    destination: str = Field(min_length=1, max_length=120)
    startDate: date
    endDate: date
    travelers: int = Field(ge=1, le=30)
    budget: Decimal = Field(ge=0, le=Decimal("1000000000000"))
    currency: str = Field(default="INR", min_length=3, max_length=3)
    transport: Literal["car", "bus", "train", "flight"]
    interests: list[str] = Field(default_factory=list, max_length=20)
    pace: Literal["relaxed", "balanced", "packed"] = "balanced"
    accommodationPreference: Literal["budget", "standard", "premium"] = "standard"
    preferences: str = Field(default="", max_length=500)

    @field_validator("origin", "destination", "title")
    @classmethod
    def non_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("This field cannot be blank.")
        return value.strip()

    @field_validator("currency")
    @classmethod
    def normalize_currency(cls, value: str) -> str:
        if not value.isalpha():
            raise ValueError("Currency must contain three letters.")
        return value.upper()

    @model_validator(mode="after")
    def valid_dates(self):
        if self.endDate < self.startDate:
            raise ValueError("End date must not be before the start date.")
        if (self.endDate - self.startDate).days + 1 > 30:
            raise ValueError("Trips can be at most 30 calendar days.")
        return self


class Activity(BaseModel):
    id: str
    time: str
    title: str
    description: str
    category: Literal["transport", "food", "attraction", "rest", "shopping", "adventure", "other"]
    durationMinutes: int
    estimatedCost: float
    currency: str
    verifiedPlace: bool = False
    genericSuggestion: bool = True
    period: Literal["morning", "afternoon", "evening"]


class ItineraryDay(BaseModel):
    day: int
    date: date
    title: str
    summary: str
    morning: list[Activity]
    afternoon: list[Activity]
    evening: list[Activity]
    activities: list[Activity]
    estimatedDayCost: float
    tips: list[str]


class TripSummary(BaseModel):
    tripId: str | None
    title: str
    origin: str
    destination: str
    startDate: date
    endDate: date
    durationDays: int
    travelers: int
    transport: str
    interests: list[str]


class BudgetEstimate(BaseModel):
    transportation: float
    accommodation: float
    food: float
    activities: float
    localTravel: float
    miscellaneous: float
    appliesTo: str = "entire trip and all travelers"


class ItineraryResponse(BaseModel):
    success: bool = True
    generationMethod: str = "rule-based"
    tripSummary: TripSummary
    destination: str
    summary: str
    days: list[ItineraryDay]
    estimatedTotalCost: float
    currency: str
    budget: float
    budgetRemaining: float
    budgetEstimate: BudgetEstimate
    tips: list[str]
    assumptions: list[str]
    warnings: list[str]
    generatedAt: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

