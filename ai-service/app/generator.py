from datetime import timedelta
from decimal import Decimal

from .budget import estimate_budget, money
from .catalogue import CATALOGUE
from .schemas import Activity, ItineraryDay, ItineraryResponse, TripRequest, TripSummary


def generate_itinerary(trip: TripRequest) -> ItineraryResponse:
    count = (trip.endDate - trip.startDate).days + 1
    interests = {item.strip().lower() for item in trip.interests}
    pace_count = {"relaxed": 2, "balanced": 3, "packed": 3}[trip.pace]
    ordered = sorted(CATALOGUE, key=lambda item: (0 if item[0] in interests else 1, item[0]))
    days = []
    activity_sum = Decimal(0)
    for index in range(count):
        # Rotate deterministically to reduce repeated suggestions on adjacent days.
        pool = ordered[index % len(ordered):] + ordered[:index % len(ordered)]
        selected = [entry for entry in pool if entry[0] not in last_categories][:pace_count] if index else pool[:pace_count]
        last_categories = {entry[0] for entry in selected}
        items = []
        periods = [("morning", "09:00"), ("afternoon", "13:30"), ("evening", "18:00")]
        for slot, record in enumerate(selected):
            category, title, description, duration, cost = record
            period, time = periods[slot]
            per_person = Decimal(0 if category == "food" else cost)
            group_cost = money(per_person * trip.travelers)
            activity_sum += group_cost
            kind = "food" if category == "food" else "adventure" if category == "adventure" else "attraction" if cost else "rest" if category == "relaxation" else "shopping" if category == "shopping" else "other"
            items.append(Activity(
                id=f"day-{index + 1}-{category}", time=time, title=title,
                description=description, category=kind, durationMinutes=duration,
                estimatedCost=float(group_cost), currency=trip.currency,
                verifiedPlace=False, genericSuggestion=True, period=period,
            ))
        days.append(ItineraryDay(
            day=index + 1, date=trip.startDate + timedelta(days=index),
            title=["A gentle introduction", "Explore at your own pace", "Discover something new"][index % 3],
            summary=f"A flexible day of general {trip.destination} travel ideas. These are not verified local venues.",
            morning=[items[0]], afternoon=[items[1]] if len(items) > 1 else [],
            evening=[items[2]] if len(items) > 2 else [], activities=items,
            estimatedDayCost=0,
            tips=["Check current opening hours, access rules, weather and prices before visiting.", "Allow time for local travel between activities."],
        ))
    budget_parts = estimate_budget(count, trip.travelers, trip.accommodationPreference, trip.transport, activity_sum)
    total = money(budget_parts["total"])
    non_activity = money(sum((budget_parts[key] for key in ("transportation", "accommodation", "food", "localTravel", "miscellaneous")), Decimal(0)))
    per_day = money(non_activity / count)
    allocated = Decimal(0)
    for index, day in enumerate(days):
        activities_cost = sum((Decimal(str(item.estimatedCost)) for item in day.activities), Decimal(0))
        overhead = non_activity - allocated if index == count - 1 else per_day
        allocated += overhead
        day.estimatedDayCost = float(money(activities_cost + overhead))
    warnings = []
    if total > trip.budget:
        warnings.append("The illustrative estimated total exceeds the trip budget. Review or adjust the plan.")
    if trip.budget == 0:
        warnings.append("No trip budget was provided; estimates are still illustrative.")
    return ItineraryResponse(
        tripSummary=TripSummary(tripId=trip.tripId, title=trip.title, origin=trip.origin,
            destination=trip.destination, startDate=trip.startDate, endDate=trip.endDate,
            durationDays=count, travelers=trip.travelers, transport=trip.transport,
            interests=trip.interests),
        destination=trip.destination,
        summary=f"A rule-based {count}-day plan for {trip.destination}, tailored to your interests and travel pace.",
        days=days, estimatedTotalCost=float(total), currency=trip.currency,
        budget=float(trip.budget), budgetRemaining=float(money(trip.budget - total)),
        budgetEstimate={key: float(value) for key, value in budget_parts.items() if key != "total"},
        tips=["All costs are illustrative estimates for the whole travel group, not live quotes.", "Specific businesses, venues and schedules are not verified by this planner."],
        assumptions=["No external AI, map, places, or booking service was used.", "Costs apply to the whole group; accommodation and car travel are shared estimates, while public fares and food are per traveler.", "Heuristic amounts use the selected currency without live exchange-rate conversion.", "Generic ideas must be checked for local availability before travel."],
        warnings=warnings,
    )
