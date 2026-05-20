from datetime import datetime, timezone
import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.engine.astro import chart_positions, calculate_utc_julian_day, localize_birth_datetime
from backend.engine.panchanga import panchanga
from backend.engine.vargas import generate_bhava_chalit_matrix, varga_positions
from backend.engine.koota import ashta_koota
from backend.engine.vision import parse_chart_image
from backend.engine.bikram_sambat import convert_bs_to_ad

app = FastAPI(title="Janma Chino Kundali Platform", version="4.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class BirthRequest(BaseModel):
    iso_datetime: datetime
    latitude: float
    longitude: float
    timezone_offset_minutes: int | None = None
    timezone_name: str | None = None

class MatchPerson(BaseModel):
    moon_sign: int | None = None
    moon_nakshatra_index: int
    moon_pada: int

class MatchRequest(BaseModel):
    bride: MatchPerson
    groom: MatchPerson

class ChartCalculateRequest(BaseModel):
    calendar_type: str = "AD"
    year: int | None = None
    month: int | None = None
    day: int | None = None
    bs_year: int | None = None
    bs_month: int | None = None
    bs_day: int | None = None
    hour: int = 0
    minute: int = 0
    latitude: float
    longitude: float
    timezone_offset_minutes: int | None = None
    timezone_name: str | None = None

class SynergyRequest(BaseModel):
    user_profile: dict
    partner_profile: dict
    koota_scores: dict

class ChartExplainRequest(BaseModel):
    chart: dict

def get_moon_sign(nak_idx: int, pada: int) -> int:
    # 40/3 degrees per Nakshatra, 10/3 degrees per Pada
    lon = (nak_idx - 1) * (40 / 3) + (pada - 0.5) * (10 / 3)
    return int(lon // 30) + 1

def resolve_match_person(person: MatchPerson) -> dict:
    data = person.model_dump()
    if data.get("moon_sign") is None:
        data["moon_sign"] = get_moon_sign(data["moon_nakshatra_index"], data["moon_pada"])
    return data

@app.get("/health")
def health():
    return {"status": "ok", "model": "gemini-2.5-flash"}

@app.post("/chart")
def chart(req: BirthRequest):
    if req.iso_datetime.tzinfo is None:
        local_dt, utc_dt, tz_name = localize_birth_datetime(
            req.iso_datetime.year,
            req.iso_datetime.month,
            req.iso_datetime.day,
            req.iso_datetime.hour,
            req.iso_datetime.minute,
            req.latitude,
            req.longitude,
            req.timezone_offset_minutes,
            req.timezone_name,
        )
    else:
        local_dt = req.iso_datetime
        utc_dt = req.iso_datetime.astimezone(timezone.utc)
        tz_name = req.timezone_name or req.iso_datetime.tzname() or "explicit-offset"
    jd_ut = calculate_utc_julian_day(
        local_dt.year, local_dt.month, local_dt.day, local_dt.hour, local_dt.minute,
        req.latitude, req.longitude, req.timezone_offset_minutes, req.timezone_name
    )
    positions = chart_positions(utc_dt, req.latitude, req.longitude)
    planet_longitudes = {name: pos.longitude for name, pos in positions.items() if name != "Lagna"}
    return {
        "local_datetime": local_dt.isoformat(),
        "utc_datetime": utc_dt.isoformat(),
        "timezone": tz_name,
        "timezone_offset_minutes": int(local_dt.utcoffset().total_seconds() // 60) if local_dt.utcoffset() else 0,
        "julian_day_ut": jd_ut,
        "positions": {k: v.__dict__ for k, v in positions.items()},
        "panchanga": panchanga(utc_dt),
        "vargas": varga_positions(positions),
        "bhava_chalit": generate_bhava_chalit_matrix(jd_ut, req.latitude, req.longitude, planet_longitudes),
    }

@app.post("/api/chart/calculate")
def calculate_chart(req: ChartCalculateRequest):
    try:
        if req.calendar_type.upper() == "BS":
            if req.bs_year is None or req.bs_month is None or req.bs_day is None:
                raise ValueError("BS year, month, and day are required.")
            ad_date = convert_bs_to_ad(req.bs_year, req.bs_month, req.bs_day)
            source_date = {"calendar": "BS", "year": req.bs_year, "month": req.bs_month, "day": req.bs_day}
        else:
            if req.year is None or req.month is None or req.day is None:
                raise ValueError("AD year, month, and day are required.")
            ad_date = datetime(req.year, req.month, req.day).date()
            source_date = {"calendar": "AD", "year": req.year, "month": req.month, "day": req.day}
        local_dt, utc_dt, tz_name = localize_birth_datetime(
            ad_date.year,
            ad_date.month,
            ad_date.day,
            req.hour,
            req.minute,
            req.latitude,
            req.longitude,
            req.timezone_offset_minutes,
            req.timezone_name,
        )
        jd_ut = calculate_utc_julian_day(
            ad_date.year,
            ad_date.month,
            ad_date.day,
            req.hour,
            req.minute,
            req.latitude,
            req.longitude,
            req.timezone_offset_minutes,
            req.timezone_name,
        )
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    positions = chart_positions(utc_dt, req.latitude, req.longitude)
    planet_longitudes = {name: pos.longitude for name, pos in positions.items() if name != "Lagna"}
    return {
        "source_date": source_date,
        "gregorian_date": ad_date.isoformat(),
        "local_datetime": local_dt.isoformat(),
        "utc_datetime": utc_dt.isoformat(),
        "timezone": tz_name,
        "timezone_offset_minutes": int(local_dt.utcoffset().total_seconds() // 60) if local_dt.utcoffset() else 0,
        "julian_day_ut": jd_ut,
        "iso_datetime": local_dt.isoformat(),
        "latitude": req.latitude,
        "longitude": req.longitude,
        "positions": {k: v.__dict__ for k, v in positions.items()},
        "panchanga": panchanga(utc_dt),
        "vargas": varga_positions(positions),
        "bhava_chalit": generate_bhava_chalit_matrix(jd_ut, req.latitude, req.longitude, planet_longitudes),
    }

@app.post("/compatibility")
def compatibility(req: MatchRequest):
    bride_data = resolve_match_person(req.bride)
    groom_data = resolve_match_person(req.groom)
    return ashta_koota(bride_data, groom_data)

@app.post("/vision/parse")
async def vision_parse(file: UploadFile = File(...)):
    safe_name = os.path.basename(file.filename or "chart-upload.png")
    path = os.path.join(tempfile.gettempdir(), safe_name)
    with open(path, "wb") as out:
        out.write(await file.read())
    return parse_chart_image(path)

@app.post("/vision/explain")
async def vision_explain(file: UploadFile = File(...)):
    content = await file.read()
    mime_type = file.content_type or "image/png"
    from backend.engine.ai_explain import explain_uploaded_chart
    return explain_uploaded_chart(content, mime_type)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    chart_info: dict
    messages: list[ChatMessage]

@app.post("/chart/chat")
def chart_chat(req: ChatRequest):
    from backend.engine.ai_explain import chat_with_guru
    history = [msg.model_dump() for msg in req.messages]
    response_text = chat_with_guru(req.chart_info, history)
    return {"response": response_text}

class CompatibilityAnalyzeRequest(BaseModel):
    bride: MatchPerson
    groom: MatchPerson

@app.post("/compatibility/analyze")
def compatibility_analyze(req: CompatibilityAnalyzeRequest):
    from backend.engine.ai_explain import evaluate_chart_synergy
    
    bride_data = resolve_match_person(req.bride)
    groom_data = resolve_match_person(req.groom)
    
    koota_result = ashta_koota(bride_data, groom_data)
    synergy_report = evaluate_chart_synergy(bride_data, groom_data, koota_result)
    
    return {
        "koota": koota_result,
        "synergy": synergy_report if isinstance(synergy_report, dict) else synergy_report.model_dump()
    }

@app.post("/api/ai/explain-compatibility")
async def api_explain_compatibility(payload: SynergyRequest):
    try:
        from backend.engine.ai_explain import evaluate_chart_synergy
        report = evaluate_chart_synergy(
            user_json=payload.user_profile,
            partner_json=payload.partner_profile,
            scores_json=payload.koota_scores,
        )
        return report if isinstance(report, dict) else report.model_dump()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gemini Inference Fault: {exc}") from exc

@app.post("/api/ai/explain-chart")
async def api_explain_chart(payload: ChartExplainRequest):
    try:
        from backend.engine.ai_explain import explain_calculated_chart
        report = explain_calculated_chart(payload.chart)
        return report if isinstance(report, dict) else report.model_dump()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gemini Inference Fault: {exc}") from exc

class CompatibilityChatRequest(BaseModel):
    bride: dict
    groom: dict
    koota: dict
    synergy: dict
    messages: list[ChatMessage]

@app.post("/compatibility/chat")
def compatibility_chat(req: CompatibilityChatRequest):
    from backend.engine.ai_explain import chat_with_guru_compatibility
    history = [msg.model_dump() for msg in req.messages]
    response_text = chat_with_guru_compatibility(
        req.bride,
        req.groom,
        req.koota,
        req.synergy,
        history
    )
    return {"response": response_text}
