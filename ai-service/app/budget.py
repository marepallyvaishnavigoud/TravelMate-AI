from decimal import Decimal, ROUND_HALF_UP


def money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def estimate_budget(days: int, travelers: int, accommodation: str, transport: str, activities: Decimal):
    # Clearly heuristic costs for all travelers; transport is an illustrative trip level allowance.
    daily_stay = {"budget": 1200, "standard": 3000, "premium": 7500}[accommodation]
    transport_allowance = {"car": 1800, "bus": 900, "train": 1200, "flight": 5000}[transport]
    food = Decimal(days * travelers * 700)
    accommodation_cost = Decimal(days * daily_stay)
    local = Decimal(days * travelers * 250)
    miscellaneous = Decimal(days * travelers * 200)
    # Car allowance is shared by the group; public transport/fare estimates are per traveler.
    transportation = Decimal(transport_allowance * (1 if transport == "car" else travelers))
    total = sum([food, accommodation_cost, local, miscellaneous, transportation, activities], Decimal(0))
    return {
        "transportation": money(transportation), "accommodation": money(accommodation_cost),
        "food": money(food), "activities": money(activities), "localTravel": money(local),
        "miscellaneous": money(miscellaneous), "total": money(total),
    }
