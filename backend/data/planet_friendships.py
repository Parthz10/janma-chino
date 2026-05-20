"""Natural friendship and dignity constants used by matching and strength engines."""

PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]

NATURAL_RELATIONSHIPS = {
    "Sun": {"friends": ["Moon", "Mars", "Jupiter"], "neutral": ["Mercury"], "enemies": ["Venus", "Saturn", "Rahu", "Ketu"]},
    "Moon": {"friends": ["Sun", "Mercury"], "neutral": ["Mars", "Jupiter", "Venus", "Saturn"], "enemies": ["Rahu", "Ketu"]},
    "Mars": {"friends": ["Sun", "Moon", "Jupiter"], "neutral": ["Venus", "Saturn"], "enemies": ["Mercury", "Rahu", "Ketu"]},
    "Mercury": {"friends": ["Sun", "Venus"], "neutral": ["Mars", "Jupiter", "Saturn"], "enemies": ["Moon", "Rahu", "Ketu"]},
    "Jupiter": {"friends": ["Sun", "Moon", "Mars"], "neutral": ["Saturn"], "enemies": ["Mercury", "Venus", "Rahu", "Ketu"]},
    "Venus": {"friends": ["Mercury", "Saturn"], "neutral": ["Mars", "Jupiter"], "enemies": ["Sun", "Moon", "Rahu", "Ketu"]},
    "Saturn": {"friends": ["Mercury", "Venus"], "neutral": ["Jupiter"], "enemies": ["Sun", "Moon", "Mars", "Rahu", "Ketu"]},
    "Rahu": {"friends": ["Venus", "Saturn", "Mercury"], "neutral": ["Jupiter"], "enemies": ["Sun", "Moon", "Mars", "Ketu"]},
    "Ketu": {"friends": ["Mars", "Venus", "Saturn"], "neutral": ["Mercury", "Jupiter"], "enemies": ["Sun", "Moon", "Rahu"]},
}

EXALTATION = {"Sun": 1, "Moon": 2, "Mars": 10, "Mercury": 6, "Jupiter": 4, "Venus": 12, "Saturn": 7, "Rahu": 2, "Ketu": 8}
DEBILITATION = {"Sun": 7, "Moon": 8, "Mars": 4, "Mercury": 12, "Jupiter": 10, "Venus": 6, "Saturn": 1, "Rahu": 8, "Ketu": 2}

def relation(a: str, b: str) -> str:
    rel = NATURAL_RELATIONSHIPS.get(a, {})
    if b in rel.get("friends", []):
        return "friend"
    if b in rel.get("enemies", []):
        return "enemy"
    return "neutral"

