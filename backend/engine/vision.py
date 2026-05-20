"""Computer vision ingestion for photographed North Indian Janma Chino charts."""

from __future__ import annotations

PLANET_ALIASES = {
    "Sun": ["सू", "सु", "sur", "sun", "soorya", "surya"],
    "Moon": ["चं", "चन्द्र", "chandra", "moon", "moo"],
    "Mars": ["मं", "मंगल", "mangal", "mars", "mar"],
    "Mercury": ["बु", "बुध", "budh", "mercury", "mer"],
    "Jupiter": ["गु", "बृ", "गुरु", "guru", "jupiter", "jup"],
    "Venus": ["शु", "शुक्र", "shukra", "venus", "ven"],
    "Saturn": ["श", "शनि", "sani", "shani", "saturn", "sat"],
    "Rahu": ["रा", "राहु", "rahu"],
    "Ketu": ["के", "केतु", "ketu"],
}

def normalize_planet_token(text: str) -> str | None:
    cleaned = text.strip().replace(" ", "").replace(".", "").lower()
    for planet, aliases in PLANET_ALIASES.items():
        if any(alias.lower() in cleaned for alias in aliases):
            return planet
    return None

def optimize_chino_for_ocr(image_path: str):
    try:
        import cv2
    except Exception as exc:
        raise RuntimeError("Install opencv-python-headless to preprocess chart images.") from exc
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Cannot read image: {image_path}")
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(img)
    return cv2.adaptiveThreshold(
        enhanced,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        21,
        4,
    )

def parse_chart_image(image_path: str) -> dict:
    try:
        import cv2
        import easyocr
    except Exception as exc:
        raise RuntimeError("Install opencv-python-headless and easyocr to parse chart images.") from exc

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Cannot read image: {image_path}")

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    thresh = cv2.adaptiveThreshold(
        enhanced,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        21,
        4,
    )

    reader = easyocr.Reader(["ne", "hi", "en"], gpu=False)
    ocr_source = cv2.bitwise_not(thresh)
    results = reader.readtext(ocr_source, detail=1)
    h, w = gray.shape[:2]
    houses = {i: [] for i in range(1, 13)}
    parsed_telemetry = []

    for box, text, conf in results:
        planet = normalize_planet_token(text)
        if not planet:
            continue
        cx = sum(p[0] for p in box) / 4
        cy = sum(p[1] for p in box) / 4
        house = _coordinate_to_house(cx / w, cy / h)
        item = {
            "planet": planet,
            "house": house,
            "confidence": float(conf),
            "raw": text,
            "box": [[float(x), float(y)] for x, y in box],
        }
        houses[house].append(item)
        parsed_telemetry.append(item)

    return {
        "houses": houses,
        "detections": parsed_telemetry,
        "source": image_path,
        "pipeline": "clahe_adaptive_threshold_segmented_coordinates",
    }

def extract_planets_from_chino_photo(image_path: str) -> list[dict]:
    return parse_chart_image(image_path)["detections"]

def _coordinate_to_house(x: float, y: float) -> int:
    anchors = {
        1: (.50, .35), 2: (.32, .18), 3: (.18, .32), 4: (.35, .50),
        5: (.18, .68), 6: (.32, .82), 7: (.50, .65), 8: (.68, .82),
        9: (.82, .68), 10: (.65, .50), 11: (.82, .32), 12: (.68, .18),
    }
    return min(anchors, key=lambda k: (anchors[k][0] - x) ** 2 + (anchors[k][1] - y) ** 2)
