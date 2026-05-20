"""Compact Shadbala-like scoring helpers in Virupas."""

from backend.data.planet_friendships import EXALTATION, DEBILITATION

def shadbala(positions: dict) -> dict:
    scores = {}
    for name, p in positions.items():
        sthana = 60 if EXALTATION.get(name) == p.sign else 10 if DEBILITATION.get(name) == p.sign else 30
        cheshta = 45 if p.retrograde else 15
        naisargika = {"Sun": 60, "Moon": 51, "Venus": 43, "Jupiter": 34, "Mercury": 26, "Mars": 17, "Saturn": 9}.get(name, 20)
        scores[name] = {"sthana": sthana, "cheshta": cheshta, "naisargika": naisargika, "total_virupas": sthana + cheshta + naisargika}
    return scores

