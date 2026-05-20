"""Planetary aspect mapping."""

SPECIAL = {"Mars": [4, 7, 8], "Jupiter": [5, 7, 9], "Saturn": [3, 7, 10]}

def aspects(positions: dict) -> dict:
    result = {}
    for name, p in positions.items():
        offsets = SPECIAL.get(name, [7])
        result[name] = [((p.sign + off - 2) % 12) + 1 for off in offsets]
    return result

