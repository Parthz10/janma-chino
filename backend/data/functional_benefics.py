"""Functional benefic, malefic, and neutral assignments by lagna sign."""

FUNCTIONAL_NATURE = {
    1: {"benefic": ["Sun", "Jupiter", "Mars"], "malefic": ["Mercury", "Venus", "Saturn"], "neutral": ["Moon"]},
    2: {"benefic": ["Saturn", "Mercury"], "malefic": ["Jupiter", "Venus", "Moon"], "neutral": ["Sun", "Mars"]},
    3: {"benefic": ["Venus", "Saturn"], "malefic": ["Mars", "Jupiter", "Sun"], "neutral": ["Moon", "Mercury"]},
    4: {"benefic": ["Mars", "Jupiter", "Moon"], "malefic": ["Venus", "Saturn", "Mercury"], "neutral": ["Sun"]},
    5: {"benefic": ["Mars", "Sun", "Jupiter"], "malefic": ["Moon", "Mercury", "Venus"], "neutral": ["Saturn"]},
    6: {"benefic": ["Venus", "Mercury"], "malefic": ["Mars", "Jupiter", "Moon"], "neutral": ["Sun", "Saturn"]},
    7: {"benefic": ["Saturn", "Mercury"], "malefic": ["Sun", "Jupiter", "Mars"], "neutral": ["Moon", "Venus"]},
    8: {"benefic": ["Moon", "Sun", "Jupiter"], "malefic": ["Mercury", "Venus", "Saturn"], "neutral": ["Mars"]},
    9: {"benefic": ["Sun", "Mars", "Jupiter"], "malefic": ["Venus", "Moon", "Saturn"], "neutral": ["Mercury"]},
    10: {"benefic": ["Venus", "Mercury", "Saturn"], "malefic": ["Moon", "Mars", "Jupiter"], "neutral": ["Sun"]},
    11: {"benefic": ["Venus", "Saturn"], "malefic": ["Moon", "Mars", "Jupiter"], "neutral": ["Sun", "Mercury"]},
    12: {"benefic": ["Moon", "Mars", "Jupiter"], "malefic": ["Sun", "Venus", "Saturn"], "neutral": ["Mercury"]},
}

