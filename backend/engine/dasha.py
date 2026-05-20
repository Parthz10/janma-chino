"""Vimshottari dasha timeline generation."""

from datetime import datetime, timedelta
from backend.data.nakshatra_tables import DASHA_ORDER, DASHA_YEARS, NAKSHATRAS

NAK_SPAN = 40 / 3

def birth_dasha_balance(moon_longitude: float) -> dict:
    nak_idx = int(moon_longitude // NAK_SPAN) + 1
    nak = NAKSHATRAS[nak_idx]
    elapsed = (moon_longitude - nak["start_degree"]) / NAK_SPAN
    remaining_fraction = 1 - elapsed
    return {
        "nakshatra_index": nak_idx,
        "nakshatra": nak["name"],
        "lord": nak["lord"],
        "remaining_years": remaining_fraction * DASHA_YEARS[nak["lord"]],
    }

def vimshottari_timeline(birth: datetime, moon_longitude: float, tiers: int = 3) -> list[dict]:
    balance = birth_dasha_balance(moon_longitude)
    start_lord = balance["lord"]
    order = DASHA_ORDER[DASHA_ORDER.index(start_lord):] + DASHA_ORDER[:DASHA_ORDER.index(start_lord)]
    current = birth
    timeline = []
    for cycle in range(2):
        for lord in order:
            years = balance["remaining_years"] if not timeline else DASHA_YEARS[lord]
            end = current + timedelta(days=years * 365.2425)
            timeline.append({"lord": lord, "start": current.isoformat(), "end": end.isoformat(), "years": years})
            current = end
            if len(timeline) >= 9:
                return timeline
    return timeline

