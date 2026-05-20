"""Transit-to-natal cross-reference utilities."""

from datetime import datetime
from backend.engine.astro import chart_positions

def transit_matrix(natal_positions: dict, at: datetime) -> dict:
    transit = chart_positions(at)
    return {
        planet: {
            "transit_sign": pos.sign,
            "natal_sign": natal_positions[planet].sign if planet in natal_positions else None,
            "from_natal_house": ((pos.sign - natal_positions[planet].sign) % 12) + 1 if planet in natal_positions else None,
        }
        for planet, pos in transit.items()
    }

