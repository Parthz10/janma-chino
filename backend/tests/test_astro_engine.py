from datetime import datetime, timezone

import pytest

from backend.engine.astro import chart_positions, julian_day, swe


@pytest.mark.skipif(swe is None, reason="Swiss Ephemeris is required for Lagna precision tests.")
def test_chart_positions_include_real_lagna_and_whole_sign_houses():
    positions = chart_positions(
        datetime(2000, 1, 1, 6, 15, tzinfo=timezone.utc),
        lat=27.7172,
        lon=85.3240,
    )

    assert "Lagna" in positions
    assert positions["Lagna"].house == 1
    assert 1 <= positions["Lagna"].sign <= 12
    assert 0 <= positions["Lagna"].degree_in_sign < 30

    for planet, position in positions.items():
        assert 1 <= position.sign <= 12
        assert 0 <= position.degree_in_sign < 30
        assert 1 <= position.house <= 12, planet


@pytest.mark.skipif(swe is None, reason="Swiss Ephemeris is required for Lagna precision tests.")
def test_lagna_matches_swiss_ephemeris_ascmc():
    dt = datetime(2024, 4, 13, 6, 15, tzinfo=timezone.utc)
    jd = julian_day(dt)
    swe.set_sid_mode(swe.SIDM_LAHIRI, 0, 0)
    _houses, ascmc = swe.houses_ex(jd, 27.7172, 85.3240, b"W", swe.FLG_SIDEREAL)

    positions = chart_positions(dt, lat=27.7172, lon=85.3240)

    assert abs(positions["Lagna"].longitude - (ascmc[0] % 360)) < 0.000001
