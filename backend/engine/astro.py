"""Astronomical primitives backed by Swiss Ephemeris when available."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import math

try:
    import swisseph as swe
except Exception:  # pragma: no cover
    swe = None

PLANET_IDS = {"Sun": 0, "Moon": 1, "Mercury": 2, "Venus": 3, "Mars": 4, "Jupiter": 5, "Saturn": 6, "Rahu": 10, "Ketu": 10}
J2000 = 2451545.0
LAHIRI_J2000 = 23.853222

@dataclass(frozen=True)
class PlanetPosition:
    name: str
    longitude: float
    sign: int
    degree_in_sign: float
    retrograde: bool = False

def normalize_deg(value: float) -> float:
    return value % 360.0

def julian_day(dt: datetime) -> float:
    utc = dt.astimezone(timezone.utc)
    y, m = utc.year, utc.month
    d = utc.day + (utc.hour + (utc.minute + (utc.second + utc.microsecond / 1_000_000) / 60) / 60) / 24
    if m <= 2:
        y -= 1
        m += 12
    a = math.floor(y / 100)
    b = math.floor(a / 4)
    c = 2 - a + b
    return math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1)) + d + c - 1524.5

def lahiri_ayanamsa(jd: float) -> float:
    if swe:
        swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
        return float(swe.get_ayanamsa_ut(jd))
    tropical_years = (jd - J2000) / 365.2425
    return LAHIRI_J2000 + tropical_years * (50.290966 / 3600)

def sign_of(longitude: float) -> tuple[int, float]:
    lon = normalize_deg(longitude)
    return int(lon // 30) + 1, lon % 30

def planet_position(jd: float, planet: str, sidereal: bool = True) -> PlanetPosition:
    if swe:
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        if sidereal:
            swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
            flags |= swe.FLG_SIDEREAL
        body = PLANET_IDS[planet]
        values, _ = swe.calc_ut(jd, body, flags)
        lon = values[0]
        speed = values[3]
        if planet == "Ketu":
            lon = normalize_deg(lon + 180)
        sign, degree = sign_of(lon)
        return PlanetPosition(planet, normalize_deg(lon), sign, degree, speed < 0)
    # Low precision fallback keeps tests/imports alive when ephemeris is absent.
    days = jd - J2000
    mean_motion = {"Sun": .985647, "Moon": 13.176358, "Mercury": 4.09235, "Venus": 1.60213, "Mars": .52402, "Jupiter": .08309, "Saturn": .03346, "Rahu": -.05295, "Ketu": -.05295}[planet]
    lon = normalize_deg((days * mean_motion) - (lahiri_ayanamsa(jd) if sidereal else 0))
    if planet == "Ketu":
        lon = normalize_deg(lon + 180)
    sign, degree = sign_of(lon)
    return PlanetPosition(planet, lon, sign, degree, mean_motion < 0)

def chart_positions(dt: datetime, lat: float | None = None, lon: float | None = None) -> dict[str, PlanetPosition]:
    jd = julian_day(dt)
    return {p: planet_position(jd, p) for p in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]}

