from datetime import datetime

import pytest

from backend.engine.astro import (
    calculate_utc_julian_day,
    calc_lagna,
    localize_birth_datetime,
    swe,
)
from backend.engine.koota import ashta_koota
from backend.engine.vargas import generate_bhava_chalit_matrix


@pytest.mark.skipif(swe is None, reason="Swiss Ephemeris is required for benchmark validation.")
def test_nepal_lagna_precision_regression():
    jd_ut = calculate_utc_julian_day(
        2000,
        1,
        1,
        12,
        0,
        27.7172,
        85.3240,
        timezone_offset_minutes=345,
    )

    longitude, sign, degree = calc_lagna(jd_ut, 27.7172, 85.3240, house_system="W")

    assert sign == 12
    assert abs(degree - 19.203293424338085) < 0.0001
    assert abs(longitude - 349.2032934243381) < 0.0001


def test_timezone_resolver_handles_global_dst():
    pytz = pytest.importorskip("pytz")
    pytest.importorskip("timezonefinder")

    local_dt, utc_dt, tz_name = localize_birth_datetime(
        2024,
        7,
        1,
        12,
        0,
        40.7128,
        -74.0060,
    )

    assert tz_name == "America/New_York"
    assert local_dt.utcoffset().total_seconds() == -4 * 3600
    assert utc_dt.hour == 16


@pytest.mark.skipif(swe is None, reason="Swiss Ephemeris is required for Bhava Chalit validation.")
def test_bhava_chalit_returns_house_assignments_and_boundaries():
    jd_ut = calculate_utc_julian_day(
        2024,
        4,
        13,
        12,
        0,
        27.7172,
        85.3240,
        timezone_offset_minutes=345,
    )
    matrix = generate_bhava_chalit_matrix(
        jd_ut,
        27.7172,
        85.3240,
        {"Sun": 359.8540839689503, "Moon": 62.64081483696587},
    )

    assert set(matrix["houses"]) == {"Sun", "Moon"}
    assert all(1 <= house <= 12 for house in matrix["houses"].values())
    assert len(matrix["boundaries"]) == 12


def test_ashta_koota_reports_nadi_cancellation_for_same_nakshatra_different_pada():
    result = ashta_koota(
        {"moon_sign": 1, "moon_nakshatra_index": 1, "moon_pada": 1},
        {"moon_sign": 1, "moon_nakshatra_index": 1, "moon_pada": 2},
    )

    assert result["categories"]["Nadi"] == 8
    assert result["doshas"]["nadi"] is False
    assert "Nadi" in result["dosha_details"]["cancellations"]
