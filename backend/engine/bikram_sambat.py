"""Bikram Sambat conversion utility backed by a calendar library when installed."""

from datetime import date

def convert_bs_to_ad(bs_year: int, bs_month: int, bs_day: int) -> date:
    try:
        from bikram_sambat import date as BSDate
    except ImportError as exc:
        raise RuntimeError(
            "bikram-sambat is not installed. Run pip install bikram-sambat or rebuild Docker."
        ) from exc

    try:
        nepali_date = BSDate(bs_year, bs_month, bs_day)
        return nepali_date.togregorian()
    except ValueError as exc:
        raise ValueError(f"Invalid Bikram Sambat date parameters: {exc}") from exc

def get_nepali_month_matrix(bs_year: int, bs_month: int):
    try:
        from bikram_sambat.helpers import monthcalendar
    except ImportError as exc:
        raise RuntimeError(
            "bikram-sambat is not installed. Run pip install bikram-sambat or rebuild Docker."
        ) from exc
    return monthcalendar(year=bs_year, month=bs_month)

def bs_to_ad(year: int, month: int, day: int) -> date:
    return convert_bs_to_ad(year, month, day)

def ad_to_bs(value: date) -> dict:
    try:
        from bikram_sambat import date as BSDate
    except ImportError as exc:
        raise RuntimeError(
            "bikram-sambat is not installed. Run pip install bikram-sambat or rebuild Docker."
        ) from exc
    bs_value = BSDate.fromgregorian(value)
    return {"year": bs_value.year, "month": bs_value.month, "day": bs_value.day, "calendar": "BS"}
