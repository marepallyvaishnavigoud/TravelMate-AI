from datetime import date
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient

from app.generator import generate_itinerary
from app.main import app
from app.schemas import TripRequest


def trip(start=date(2026, 10, 10), end=date(2026, 10, 10), **overrides):
    fields = dict(title="Goa trip", origin="Hyderabad", destination="Goa", startDate=start,
        endDate=end, travelers=2, budget=Decimal("10000"), currency="INR", transport="train",
        interests=["beaches", "food"], pace="balanced", accommodationPreference="budget")
    fields.update(overrides)
    return TripRequest(**fields)


def test_one_day_and_total_consistency():
    result = generate_itinerary(trip())
    assert len(result.days) == 1
    assert result.days[0].date == date(2026, 10, 10)
    assert result.estimatedTotalCost == sum(day.estimatedDayCost for day in result.days)
    assert result.budgetRemaining == result.budget - result.estimatedTotalCost


def test_six_days_crosses_month_and_has_every_date():
    result = generate_itinerary(trip(date(2026, 10, 29), date(2026, 11, 3)))
    assert len(result.days) == 6
    assert [day.date for day in result.days][0] == date(2026, 10, 29)
    assert [day.date for day in result.days][-1] == date(2026, 11, 3)


def test_over_budget_warning_and_offline_rule_based():
    result = generate_itinerary(trip(budget=Decimal("1")))
    assert result.generationMethod == "rule-based"
    assert result.warnings
    assert all(not a.verifiedPlace for day in result.days for a in day.activities)


def test_validation():
    with pytest.raises(ValueError):
        trip(end=date(2026, 10, 9))
    with pytest.raises(ValueError):
        trip(origin=" ")
    with pytest.raises(ValueError):
        trip(travelers=0)
    with pytest.raises(ValueError):
        trip(end=date(2026, 12, 1))


def test_health_and_generation_endpoints():
    client = TestClient(app)
    assert client.get("/health").json()["success"] is True
    response = client.post("/api/itinerary/generate", json=trip().model_dump(mode="json"))
    assert response.status_code == 200
    assert response.json()["generationMethod"] == "rule-based"
    assert len(response.json()["days"]) == 1

