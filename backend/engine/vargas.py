"""Divisional chart calculations."""

from backend.engine.astro import normalize_deg, sign_of, swe

def navamsa_sign(longitude: float) -> int:
    sign, degree = sign_of(longitude)
    segment = int(degree // (10 / 3))
    start_by_element = {1: 1, 5: 1, 9: 1, 2: 10, 6: 10, 10: 10, 3: 7, 7: 7, 11: 7, 4: 4, 8: 4, 12: 4}
    return ((start_by_element[sign] + segment - 1) % 12) + 1

def get_navamsha_sign(longitude: float) -> int:
    return navamsa_sign(longitude)

def dashamsha_sign(longitude: float) -> int:
    sign, degree = sign_of(longitude)
    segment = int(degree // 3)
    base = sign if sign % 2 == 1 else ((sign + 8 - 1) % 12) + 1
    return ((base + segment - 1) % 12) + 1

def drekkana_sign(longitude: float) -> int:
    sign, degree = sign_of(longitude)
    return ((sign + (int(degree // 10) * 4) - 1) % 12) + 1

def varga_positions(positions: dict) -> dict:
    planets = {name: p for name, p in positions.items() if name != "Lagna"}
    return {
        "D1": {name: p.sign for name, p in positions.items()},
        "D3": {name: drekkana_sign(p.longitude) for name, p in planets.items()},
        "D9": {name: navamsa_sign(p.longitude) for name, p in planets.items()},
        "D10": {name: dashamsha_sign(p.longitude) for name, p in planets.items()},
        "houses": {name: p.house for name, p in positions.items() if p.house is not None},
        "vargottama": {name: p.sign == navamsa_sign(p.longitude) for name, p in planets.items()},
    }

def run_varga_pipeline(planetary_positions: dict[str, float]) -> dict:
    varga_matrix = {}
    for body, lon in planetary_positions.items():
        d1_sign, _degree = sign_of(lon)
        d9_sign = navamsa_sign(lon)
        d10_sign = dashamsha_sign(lon)
        varga_matrix[body] = {
            "d1": d1_sign,
            "d9": d9_sign,
            "d10": d10_sign,
            "is_vargottama": d1_sign == d9_sign,
        }
    return varga_matrix

def whole_sign_houses(ascendant_sign: int) -> dict[int, int]:
    return {house: ((ascendant_sign + house - 2) % 12) + 1 for house in range(1, 13)}

def _arc_contains(start: float, end: float, value: float) -> bool:
    start = normalize_deg(start)
    end = normalize_deg(end)
    value = normalize_deg(value)
    if start > end:
        return value >= start or value < end
    return start <= value < end

def generate_bhava_chalit_matrix(jd_ut: float, lat: float, lon: float, planet_longitudes: dict[str, float]) -> dict:
    if not swe:
        raise RuntimeError("Swiss Ephemeris is required for Sripathi/Bhava Chalit calculations.")
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    cusps, ascmc = swe.houses_ex(jd_ut, lat, lon, b"P", swe.FLG_SIDEREAL)
    cusp_list = [normalize_deg(float(cusps[i])) for i in range(12)]
    bhava_placements = {}
    bhava_boundaries = {}

    for index in range(12):
        start_bound = normalize_deg(cusp_list[index] - 15)
        end_bound = normalize_deg(cusp_list[(index + 1) % 12] - 15)
        bhava_boundaries[index + 1] = {
            "start": start_bound,
            "midpoint": cusp_list[index],
            "end": end_bound,
        }

    for planet, lon_val in planet_longitudes.items():
        assigned_house = 1
        for house, bounds in bhava_boundaries.items():
            if _arc_contains(bounds["start"], bounds["end"], lon_val):
                assigned_house = house
                break
        bhava_placements[planet] = assigned_house

    return {
        "ascendant": normalize_deg(float(ascmc[0])),
        "mc": normalize_deg(float(ascmc[1])),
        "houses": bhava_placements,
        "boundaries": bhava_boundaries,
    }
