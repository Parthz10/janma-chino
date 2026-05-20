"""Auspicious timing utilities."""

from datetime import datetime, timedelta
from backend.data.muhurta_tables import DAY_CHOGHADIYA, RAHU_KALA_SEGMENT, HORA_SEQUENCE, WEEKDAY_LORDS

def choghadiya_windows(day: datetime, sunrise: datetime, sunset: datetime) -> list[dict]:
    weekday = day.strftime("%A")
    span = (sunset - sunrise) / 8
    return [{"name": name, "start": (sunrise + i * span).isoformat(), "end": (sunrise + (i + 1) * span).isoformat()} for i, name in enumerate(DAY_CHOGHADIYA[weekday])]

def rahu_kala(day: datetime, sunrise: datetime, sunset: datetime) -> dict:
    idx = RAHU_KALA_SEGMENT[day.strftime("%A")] - 1
    span = (sunset - sunrise) / 8
    return {"start": (sunrise + idx * span).isoformat(), "end": (sunrise + (idx + 1) * span).isoformat()}

def hora_lord(day: datetime, hour_index: int) -> str:
    weekday_lord = WEEKDAY_LORDS[(day.weekday() + 1) % 7]
    start = HORA_SEQUENCE.index(weekday_lord)
    return HORA_SEQUENCE[(start + hour_index) % 7]

