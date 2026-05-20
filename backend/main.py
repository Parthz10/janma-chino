from datetime import datetime
import os
import tempfile
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.engine.astro import chart_positions
from backend.engine.panchanga import panchanga
from backend.engine.vargas import varga_positions
from backend.engine.koota import ashta_koota
from backend.engine.vision import parse_chart_image

app = FastAPI(title="Janma Chino Kundali Platform", version="4.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class BirthRequest(BaseModel):
    iso_datetime: datetime
    latitude: float
    longitude: float

class MatchPerson(BaseModel):
    moon_sign: int | None = None
    moon_nakshatra_index: int
    moon_pada: int

class MatchRequest(BaseModel):
    bride: MatchPerson
    groom: MatchPerson

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
    positions = chart_positions(req.iso_datetime, req.latitude, req.longitude)
    return {"positions": {k: v.__dict__ for k, v in positions.items()}, "panchanga": panchanga(req.iso_datetime), "vargas": varga_positions(positions)}

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


