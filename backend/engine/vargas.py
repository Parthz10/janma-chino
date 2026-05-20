"""Divisional chart calculations."""

from backend.engine.astro import sign_of

def navamsa_sign(longitude: float) -> int:
    sign, degree = sign_of(longitude)
    segment = int(degree // (10 / 3))
    start_by_element = {1: 1, 5: 1, 9: 1, 2: 10, 6: 10, 10: 10, 3: 7, 7: 7, 11: 7, 4: 4, 8: 4, 12: 4}
    return ((start_by_element[sign] + segment - 1) % 12) + 1

def drekkana_sign(longitude: float) -> int:
    sign, degree = sign_of(longitude)
    return ((sign + (int(degree // 10) * 4) - 1) % 12) + 1

def varga_positions(positions: dict) -> dict:
    return {
        "D1": {name: p.sign for name, p in positions.items()},
        "D3": {name: drekkana_sign(p.longitude) for name, p in positions.items()},
        "D9": {name: navamsa_sign(p.longitude) for name, p in positions.items()},
        "vargottama": {name: p.sign == navamsa_sign(p.longitude) for name, p in positions.items()},
    }

def whole_sign_houses(ascendant_sign: int) -> dict[int, int]:
    return {house: ((ascendant_sign + house - 2) % 12) + 1 for house in range(1, 13)}

