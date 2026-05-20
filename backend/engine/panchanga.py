"""Panchanga calculations from sidereal Sun/Moon longitudes."""

from __future__ import annotations

from datetime import datetime
from backend.engine.astro import chart_positions, normalize_deg
from backend.data.nakshatra_tables import NAKSHATRAS

YOGAS = ["Vishkumbha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"]
KARANAS = ["Kimstughna", "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga"]

def panchanga(dt: datetime) -> dict:
    pos = chart_positions(dt)
    sun = pos["Sun"].longitude
    moon = pos["Moon"].longitude
    elong = normalize_deg(moon - sun)
    tithi = int(elong // 12) + 1
    nak_idx = int(moon // (40 / 3)) + 1
    yoga_idx = int(normalize_deg(sun + moon) // (40 / 3)) + 1
    karana_slot = int(elong // 6)
    if karana_slot == 0:
        karana = "Kimstughna"
    elif karana_slot >= 57:
        karana = ["Shakuni", "Chatushpada", "Naga"][karana_slot - 57]
    else:
        karana = KARANAS[1 + ((karana_slot - 1) % 7)]
    return {
        "tithi": tithi,
        "paksha": "Shukla" if tithi <= 15 else "Krishna",
        "nakshatra": NAKSHATRAS[nak_idx],
        "nakshatra_index": nak_idx,
        "vara": dt.strftime("%A"),
        "yoga": YOGAS[yoga_idx - 1],
        "yoga_index": yoga_idx,
        "karana": karana,
        "rasi_sandhi": {k: v.degree_in_sign < 1 or v.degree_in_sign > 29 for k, v in pos.items()},
    }

