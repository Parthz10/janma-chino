import json
import time
import logging
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

def generate_content_with_retry(client, model, contents, config, max_retries=5):
    delay = 2.0
    for attempt in range(1, max_retries + 1):
        try:
            return client.models.generate_content(
                model=model,
                contents=contents,
                config=config
            )
        except Exception as e:
            logger.warning(f"Gemini API attempt {attempt} failed: {e}")
            if attempt == max_retries:
                raise e
            time.sleep(delay)
            delay *= 2.0

class CompatibilityCategory(BaseModel):
    score_meaning_en: str = Field(description="Detailed narrative evaluation of this specific Koota score in English.")
    score_meaning_ne: str = Field(description="Detailed narrative evaluation of this specific Koota score in native Nepali.")

class CompatibilityReport(BaseModel):
    overall_percentage: int = Field(description="The calculated matching fraction scaled precisely from 0 to 100.")
    narrative_summary_en: str = Field(description="Fluid, emotionally intelligent psychological and behavioral compatibility narrative in English.")
    narrative_summary_ne: str = Field(description="Fluid, emotionally intelligent psychological and behavioral compatibility narrative in clear, native Nepali.")
    bhakoot_analysis: CompatibilityCategory
    nadi_analysis: CompatibilityCategory
    remedial_measures_en: str = Field(description="Actionable and specific traditional Vedic remedies for conflicts in English.")
    remedial_measures_ne: str = Field(description="Actionable and specific traditional Vedic remedies in standard Nepali.")

def evaluate_chart_synergy(user_json: dict, partner_json: dict, scores_json: dict) -> CompatibilityReport:
    client = genai.Client()
    system_prompt = (
        "You are an expert Vedic Jyotish master scholar. Analyze raw astronomical metrics, "
        "house alignments, and Ashta Koota values to provide comprehensive relationship insight. "
        "Avoid generic templates. Provide deep emotional context and fluent English plus standard Nepali. "
        "If 0-point doshas like Nadi or Bhakoot occur, provide clear, comforting traditional remedies."
    )
    execution_context = (
        "Perform a comprehensive relationship analysis.\n"
        f"User Telemetry: {json.dumps(user_json, ensure_ascii=False)}\n"
        f"Partner Telemetry: {json.dumps(partner_json, ensure_ascii=False)}\n"
        f"Calculated Ashta Koota Point Map: {json.dumps(scores_json, ensure_ascii=False)}"
    )
    response = generate_content_with_retry(
        client=client,
        model="gemini-2.5-flash",
        contents=execution_context,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.2,
            response_mime_type="application/json",
            response_schema=CompatibilityReport,
        ),
    )
    payload = response.parsed if getattr(response, "parsed", None) else json.loads(response.text)
    return payload if isinstance(payload, CompatibilityReport) else CompatibilityReport.model_validate(payload)

class PlanetPlacement(BaseModel):
    name: str = Field(description="The standard full English name of the planet (e.g. 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu').")
    signNumber: int = Field(description="The zodiac sign number (1-12) the planet is placed in, based on the number written in the house.")
    degree: float = Field(default=0.0, description="Estimated degree of the planet placement if legible (default to 0.0 if not readable).")

class HouseInterpretation(BaseModel):
    house: int = Field(description="The house number (1-12) being interpreted.")
    planets: list[str] = Field(description="Names of planets present in this house.")
    meaning_en: str = Field(description="Vedic analysis of this house placement in English.")
    meaning_ne: str = Field(description="Vedic analysis of this house placement in native Nepali.")

class ChartExplanation(BaseModel):
    ascendantSign: int = Field(description="The ascendant sign (rising sign) number (1-12) written in the first house (top-center diamond).")
    placements: list[PlanetPlacement] = Field(description="Complete list of all detected planet placements in the chart.")
    summary_en: str = Field(description="Fluid, emotionally intelligent psychological and behavioral analysis of the chart in English, covering key themes.")
    summary_ne: str = Field(description="Fluid, emotionally intelligent psychological and behavioral analysis of the chart in native Nepali.")
    house_interpretations: list[HouseInterpretation] = Field(description="Astrological interpretations for the active houses containing planets.")
    remedies_en: str = Field(description="Actionable traditional Vedic remedies for any challenging alignments in English.")
    remedies_ne: str = Field(description="Actionable traditional Vedic remedies in clear, standard Nepali.")

def explain_uploaded_chart(image_bytes: bytes, mime_type: str) -> ChartExplanation:
    from PIL import Image
    import io
    
    # Load image using PIL for safety and compatibility
    image = Image.open(io.BytesIO(image_bytes))
    
    client = genai.Client()
    system_prompt = (
        "You are an expert Vedic Jyotish master scholar. Analyze the uploaded image of a North Indian "
        "Kundali chart (Janma Chino layout). Extract the ascendant sign (written as a number in the "
        "top-center diamond/1st house) and locate each planet (e.g., 'सू' for Sun, 'चं' for Moon, 'मं' for Mars, "
        "'बु' for Mercury, 'गु' or 'बृ' for Jupiter, 'शु' for Venus, 'श' or 'शनि' for Saturn, 'रा' for Rahu, "
        "'के' for Ketu) in their respective houses. Determine their zodiac sign numbers by reading the number "
        "written in each house. Then, generate a deep, emotionally intelligent, and comforting "
        "Vedic Jyotish reading in both English and standard native Nepali. Format your response "
        "precisely according to the schema."
    )
    
    response = generate_content_with_retry(
        client=client,
        model="gemini-2.5-flash",
        contents=[image, "Please digitize and interpret this North Indian Kundali chart."],
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.3,
            response_mime_type="application/json",
            response_schema=ChartExplanation,
        ),
    )
    
    payload = response.parsed if getattr(response, "parsed", None) else json.loads(response.text)
    return payload if isinstance(payload, ChartExplanation) else ChartExplanation.model_validate(payload)

def chat_with_guru(chart_info: dict, chat_history: list) -> str:
    client = genai.Client()
    system_prompt = (
        "You are an expert Vedic Jyotish master scholar and compassionate spiritual counselor (Guru). "
        "The user is asking questions about their personal birth chart. "
        "Here is their Birth Chart Telemetry:\n"
        f"{json.dumps(chart_info, ensure_ascii=False)}\n\n"
        "Provide warm, highly personalized, comforting, and accurate answers as a wise Jyotish Guru. "
        "Tailor your explanations to their chart placements. Keep responses concise and easy to understand. "
        "If they ask in Nepali, reply in native Nepali. If in English, reply in English. "
        "Avoid generic advice and focus on guiding them pathwise with remedies if they ask."
    )
    
    contents = []
    for msg in chat_history:
        contents.append(
            types.Content(
                role="user" if msg["role"] == "user" else "model",
                parts=[types.Part.from_text(text=msg["content"])]
            )
        )
        
    response = generate_content_with_retry(
        client=client,
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.7,
        ),
    )
    return response.text

def chat_with_guru_compatibility(bride: dict, groom: dict, koota: dict, synergy: dict, chat_history: list) -> str:
    client = genai.Client()
    system_prompt = (
        "You are an expert Vedic Jyotish master scholar and compassionate relationship counselor (Guru). "
        "The user is asking questions about the compatibility between two people (Bride and Groom). "
        "Here are the relationship details:\n"
        f"Bride: {json.dumps(bride, ensure_ascii=False)}\n"
        f"Groom: {json.dumps(groom, ensure_ascii=False)}\n"
        f"Ashta Koota Score: {koota.get('total', 0)} / 36\n"
        f"Koota Details: {json.dumps(koota.get('categories', {}), ensure_ascii=False)}\n"
        f"Synergy Analysis: {json.dumps(synergy, ensure_ascii=False)}\n\n"
        "Provide warm, highly personalized, wise relationship guidance as a Vedic Guru. "
        "Explain the strengths of their match, address any Doshas (like Nadi or Bhakoot) comfortingly, "
        "and suggest realistic remedies if they ask. "
        "If they ask in Nepali, reply in native Nepali. If in English, reply in English. "
        "Keep responses friendly, helpful, and concise."
    )
    
    contents = []
    for msg in chat_history:
        contents.append(
            types.Content(
                role="user" if msg["role"] == "user" else "model",
                parts=[types.Part.from_text(text=msg["content"])]
            )
        )
        
    response = generate_content_with_retry(
        client=client,
        model="gemini-2.5-flash",
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.7,
        ),
    )
    return response.text



