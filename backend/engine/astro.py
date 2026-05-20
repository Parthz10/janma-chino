"""Astronomical primitives backed by Swiss Ephemeris when available."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import math

try:
    import swisseph as swe
except Exception:  # pragma: no cover
    swe = None

try:
    import pytz
    from timezonefinder import TimezoneFinder
except Exception:  # pragma: no cover
    pytz = None
    TimezoneFinder = None

PLANET_IDS = {"Sun": 0, "Moon": 1, "Mercury": 2, "Venus": 3, "Mars": 4, "Jupiter": 5, "Saturn": 6, "Rahu": 10, "Ketu": 10}
J2000 = 2451545.0
LAHIRI_J2000 = 23.853222
_timezone_finder = TimezoneFinder() if TimezoneFinder else None

@dataclass(frozen=True)
class PlanetPosition:
    name: str
    longitude: float
    sign: int
    degree_in_sign: float
    retrograde: bool = False
    house: int | None = None

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

def resolve_timezone_name(latitude: float, longitude: float) -> str:
    if not _timezone_finder:
        return "UTC"
    return _timezone_finder.timezone_at(lat=latitude, lng=longitude) or "UTC"

def localize_birth_datetime(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    latitude: float,
    longitude: float,
    timezone_offset_minutes: int | None = None,
    timezone_name: str | None = None,
) -> tuple[datetime, datetime, str]:
    naive = datetime(year, month, day, hour, minute)
    if timezone_offset_minutes is not None:
        tz = timezone(timedelta(minutes=timezone_offset_minutes))
        local_dt = naive.replace(tzinfo=tz)
        label = f"UTC{timezone_offset_minutes / 60:+g}"
    elif pytz:
        label = timezone_name or resolve_timezone_name(latitude, longitude)
        tz = pytz.timezone(label)
        local_dt = tz.localize(naive, is_dst=None)
    else:
        label = timezone_name or resolve_timezone_name(latitude, longitude)
        local_dt = naive.replace(tzinfo=timezone.utc)
    return local_dt, local_dt.astimezone(timezone.utc), label

def calculate_utc_julian_day(
    year: int,
    month: int,
    day: int,
    hour: int,
    minute: int,
    lat: float,
    lon: float,
    timezone_offset_minutes: int | None = None,
    timezone_name: str | None = None,
) -> float:
    _local_dt, utc_dt, _tz_name = localize_birth_datetime(
        year, month, day, hour, minute, lat, lon, timezone_offset_minutes, timezone_name
    )
    if swe:
        hour_decimal = utc_dt.hour + utc_dt.minute / 60 + utc_dt.second / 3600 + utc_dt.microsecond / 3_600_000_000
        return float(swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, hour_decimal))
    return julian_day(utc_dt)

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

def calc_planet(jd: float, planet: str | int) -> dict:
    if isinstance(planet, int):
        name = next((p for p, body in PLANET_IDS.items() if body == planet and p != "Ketu"), "Sun")
    else:
        name = planet
    position = planet_position(jd, name)
    return position.__dict__

def ascendant_position(jd: float, latitude: float, longitude: float, house_system: bytes = b"W") -> PlanetPosition:
    if not swe:
        raise RuntimeError("Swiss Ephemeris is required for accurate Lagna calculation.")
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    _houses, ascmc = swe.houses_ex(jd, latitude, longitude, house_system, swe.FLG_SIDEREAL)
    asc_lon = normalize_deg(float(ascmc[0]))
    sign, degree = sign_of(asc_lon)
    return PlanetPosition("Lagna", asc_lon, sign, degree, False, 1)

def calc_lagna(jd: float, latitude: float, longitude: float, house_system: str = "W") -> tuple[float, int, float]:
    position = ascendant_position(jd, latitude, longitude, house_system.encode("ascii"))
    return position.longitude, position.sign, position.degree_in_sign

def whole_sign_house(planet_sign: int, ascendant_sign: int) -> int:
    return ((planet_sign - ascendant_sign + 12) % 12) + 1

def with_house(position: PlanetPosition, ascendant_sign: int) -> PlanetPosition:
    return PlanetPosition(
        name=position.name,
        longitude=position.longitude,
        sign=position.sign,
        degree_in_sign=position.degree_in_sign,
        retrograde=position.retrograde,
        house=1 if position.name == "Lagna" else whole_sign_house(position.sign, ascendant_sign),
    )

def chart_positions(dt: datetime, lat: float | None = None, lon: float | None = None) -> dict[str, PlanetPosition]:
    jd = julian_day(dt)
    positions = {p: planet_position(jd, p) for p in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]}
    if lat is not None and lon is not None:
        lagna = ascendant_position(jd, lat, lon)
        positions = {name: with_house(pos, lagna.sign) for name, pos in positions.items()}
        positions["Lagna"] = lagna
    return positions
