"""Declarative yoga definitions consumed by backend.engine.yogas."""

YOGA_RULES = {
    "Gaja Kesari": {"requires": ["Moon", "Jupiter"], "relation": "kendra_from_moon", "benefic": True},
    "Raja Yoga": {"requires": ["Kendra lord", "Trikona lord"], "relation": "association_or_mutual_aspect", "benefic": True},
    "Dhana Yoga": {"requires": ["2nd lord", "11th lord"], "relation": "association_or_exchange", "benefic": True},
    "Budha Aditya": {"requires": ["Sun", "Mercury"], "relation": "same_house", "benefic": True},
    "Chandra Mangal": {"requires": ["Moon", "Mars"], "relation": "same_house_or_opposition", "benefic": True},
    "Pancha Mahapurusha Ruchaka": {"requires": ["Mars"], "relation": "own_or_exalted_in_kendra", "benefic": True},
    "Pancha Mahapurusha Bhadra": {"requires": ["Mercury"], "relation": "own_or_exalted_in_kendra", "benefic": True},
    "Pancha Mahapurusha Hamsa": {"requires": ["Jupiter"], "relation": "own_or_exalted_in_kendra", "benefic": True},
    "Pancha Mahapurusha Malavya": {"requires": ["Venus"], "relation": "own_or_exalted_in_kendra", "benefic": True},
    "Pancha Mahapurusha Sasa": {"requires": ["Saturn"], "relation": "own_or_exalted_in_kendra", "benefic": True},
    "Kemadruma": {"requires": ["Moon"], "relation": "no_planets_2_12_from_moon", "benefic": False},
    "Viparita Raja": {"requires": ["6th lord", "8th lord", "12th lord"], "relation": "dusthana_lords_in_dusthana", "benefic": True},
}

