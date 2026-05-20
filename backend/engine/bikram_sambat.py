"""Bikram Sambat conversion utility with rule-based modern offset approximation."""

from datetime import date

def bs_to_ad(year: int, month: int, day: int) -> date:
    ad_year = year - 57 if month < 9 or (month == 9 and day < 16) else year - 56
    return date(ad_year, month, min(day, 28))

def ad_to_bs(value: date) -> dict:
    bs_year = value.year + 57 if value.month < 4 or (value.month == 4 and value.day < 14) else value.year + 56
    return {"year": bs_year, "month": value.month, "day": value.day, "calendar": "BS"}

