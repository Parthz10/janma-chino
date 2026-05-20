"""Special dosha engines: Kala Sarpa, Sade Sati, and Kuja."""

from backend.data.kala_sarpa_types import KALA_SARPA_TYPES

def kuja_dosha(planet_houses: dict, mars_sign: int | None = None) -> dict:
    mars_house = planet_houses.get("Mars")
    active = mars_house in [1, 2, 4, 7, 8, 12]
    cancelled = active and (mars_house == 4 and mars_sign in [1, 8] or mars_sign in [9, 12])
    return {"active": bool(active and not cancelled), "house": mars_house, "cancelled": bool(cancelled), "mitigation": "Own/Jupiter sign mitigation" if cancelled else None}

def kala_sarpa(planet_houses: dict) -> dict:
    rahu, ketu = planet_houses.get("Rahu"), planet_houses.get("Ketu")
    if not rahu or not ketu:
        return {"active": False}
    others = [h for p, h in planet_houses.items() if p not in ["Rahu", "Ketu"]]
    arc = []
    h = rahu
    while h != ketu:
        arc.append(h)
        h = (h % 12) + 1
    active = all(o in arc for o in others) or all(o not in arc for o in others)
    return {"active": active, "type": KALA_SARPA_TYPES.get((rahu, ketu)) if active else None}

def sade_sati(natal_moon_sign: int, transit_saturn_sign: int) -> dict:
    return {"active": transit_saturn_sign in [((natal_moon_sign - 2) % 12) + 1, natal_moon_sign, (natal_moon_sign % 12) + 1]}

