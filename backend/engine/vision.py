"""Computer vision ingestion for photographed North Indian Janma Chino charts."""

from __future__ import annotations

SYMBOL_MAP = {"सू": "Sun", "चं": "Moon", "मं": "Mars", "बु": "Mercury", "गु": "Jupiter", "बृ": "Jupiter", "शु": "Venus", "श": "Saturn", "शनि": "Saturn", "रा": "Rahu", "के": "Ketu"}

def parse_chart_image(image_path: str) -> dict:
    try:
        import cv2
        import easyocr
    except Exception as exc:
        raise RuntimeError("Install opencv-python and easyocr to parse chart images.") from exc
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Cannot read image: {image_path}")
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 9)
    reader = easyocr.Reader(["ne", "hi", "en"], gpu=False)
    results = reader.readtext(thresh)
    h, w = gray.shape[:2]
    houses = {i: [] for i in range(1, 13)}
    for box, text, conf in results:
        token = text.strip().replace(" ", "")
        planet = SYMBOL_MAP.get(token)
        if not planet:
            continue
        cx = sum(p[0] for p in box) / 4
        cy = sum(p[1] for p in box) / 4
        house = _coordinate_to_house(cx / w, cy / h)
        houses[house].append({"planet": planet, "confidence": float(conf), "raw": text})
    return {"houses": houses, "source": image_path}

def _coordinate_to_house(x: float, y: float) -> int:
    anchors = {
        1: (.50, .35), 2: (.32, .18), 3: (.18, .32), 4: (.35, .50),
        5: (.18, .68), 6: (.32, .82), 7: (.50, .65), 8: (.68, .82),
        9: (.82, .68), 10: (.65, .50), 11: (.82, .32), 12: (.68, .18),
    }
    return min(anchors, key=lambda k: (anchors[k][0] - x) ** 2 + (anchors[k][1] - y) ** 2)

