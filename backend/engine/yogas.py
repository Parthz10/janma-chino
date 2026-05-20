"""Yoga activation engine."""

from backend.data.yoga_rules import YOGA_RULES

def _house_from(a: int, b: int) -> int:
    return ((b - a) % 12) + 1

def active_yogas(positions: dict) -> list[dict]:
    active = []
    if "Moon" in positions and "Jupiter" in positions and _house_from(positions["Moon"].sign, positions["Jupiter"].sign) in [1, 4, 7, 10]:
        active.append({"name": "Gaja Kesari", **YOGA_RULES["Gaja Kesari"]})
    if "Sun" in positions and "Mercury" in positions and positions["Sun"].sign == positions["Mercury"].sign:
        active.append({"name": "Budha Aditya", **YOGA_RULES["Budha Aditya"]})
    if "Moon" in positions and "Mars" in positions and _house_from(positions["Moon"].sign, positions["Mars"].sign) in [1, 7]:
        active.append({"name": "Chandra Mangal", **YOGA_RULES["Chandra Mangal"]})
    return active

