"""Tajik annual chart helpers."""

from datetime import datetime, timedelta
from backend.engine.astro import chart_positions

def solar_return_seed(birth: datetime, target_year: int) -> dict:
    dt = birth.replace(year=target_year)
    positions = chart_positions(dt)
    return {"year": target_year, "approx_return_time": dt.isoformat(), "positions": {k: v.__dict__ for k, v in positions.items()}, "mudda_sequence": ["Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury", "Ketu", "Venus"]}

