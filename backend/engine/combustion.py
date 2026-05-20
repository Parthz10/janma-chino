"""Combustion, retrogression, and planetary war checks."""

ORB = {"Moon": 12, "Mars": 17, "Mercury": 14, "Jupiter": 11, "Venus": 10, "Saturn": 15}

def angular_sep(a: float, b: float) -> float:
    diff = abs((a - b + 180) % 360 - 180)
    return diff

def combustion_report(positions: dict) -> dict:
    sun = positions["Sun"].longitude
    return {name: {"combust": angular_sep(p.longitude, sun) <= ORB.get(name, 0), "retrograde": p.retrograde} for name, p in positions.items() if name != "Sun"}

