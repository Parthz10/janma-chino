"""Canonical Jyotish lookup tables for nakshatras and zodiac signs."""

DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
DASHA_YEARS = {"Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17}

SIGNS = {
    1: {"name": "Aries", "devanagari": "मेष", "lord": "Mars", "element": "Fire", "varna": "Kshatriya", "vashya": "Chatushpad"},
    2: {"name": "Taurus", "devanagari": "वृष", "lord": "Venus", "element": "Earth", "varna": "Vaishya", "vashya": "Chatushpad"},
    3: {"name": "Gemini", "devanagari": "मिथुन", "lord": "Mercury", "element": "Air", "varna": "Shudra", "vashya": "Manav"},
    4: {"name": "Cancer", "devanagari": "कर्कट", "lord": "Moon", "element": "Water", "varna": "Brahmin", "vashya": "Jalchar"},
    5: {"name": "Leo", "devanagari": "सिंह", "lord": "Sun", "element": "Fire", "varna": "Kshatriya", "vashya": "Vanchar"},
    6: {"name": "Virgo", "devanagari": "कन्या", "lord": "Mercury", "element": "Earth", "varna": "Vaishya", "vashya": "Manav"},
    7: {"name": "Libra", "devanagari": "तुला", "lord": "Venus", "element": "Air", "varna": "Shudra", "vashya": "Manav"},
    8: {"name": "Scorpio", "devanagari": "वृश्चिक", "lord": "Mars", "element": "Water", "varna": "Brahmin", "vashya": "Keet"},
    9: {"name": "Sagittarius", "devanagari": "धनु", "lord": "Jupiter", "element": "Fire", "varna": "Kshatriya", "vashya": "Chatushpad"},
    10: {"name": "Capricorn", "devanagari": "मकर", "lord": "Saturn", "element": "Earth", "varna": "Vaishya", "vashya": "Chatushpad"},
    11: {"name": "Aquarius", "devanagari": "कुम्भ", "lord": "Saturn", "element": "Air", "varna": "Shudra", "vashya": "Manav"},
    12: {"name": "Pisces", "devanagari": "मीन", "lord": "Jupiter", "element": "Water", "varna": "Brahmin", "vashya": "Jalchar"},
}

_names = [
    ("Ashwini", "अश्विनी", "Ketu", "Horse", "Deva", "Adi"),
    ("Bharani", "भरणी", "Venus", "Elephant", "Manushya", "Madhya"),
    ("Krittika", "कृत्तिका", "Sun", "Goat", "Rakshasa", "Antya"),
    ("Rohini", "रोहिणी", "Moon", "Serpent", "Manushya", "Antya"),
    ("Mrigashira", "मृगशिरा", "Mars", "Serpent", "Deva", "Madhya"),
    ("Ardra", "आर्द्रा", "Rahu", "Dog", "Manushya", "Adi"),
    ("Punarvasu", "पुनर्वसु", "Jupiter", "Cat", "Deva", "Adi"),
    ("Pushya", "पुष्य", "Saturn", "Goat", "Deva", "Madhya"),
    ("Ashlesha", "आश्लेषा", "Mercury", "Cat", "Rakshasa", "Antya"),
    ("Magha", "मघा", "Ketu", "Rat", "Rakshasa", "Antya"),
    ("Purva Phalguni", "पूर्वाफाल्गुनी", "Venus", "Rat", "Manushya", "Madhya"),
    ("Uttara Phalguni", "उत्तराफाल्गुनी", "Sun", "Cow", "Manushya", "Adi"),
    ("Hasta", "हस्त", "Moon", "Buffalo", "Deva", "Adi"),
    ("Chitra", "चित्रा", "Mars", "Tiger", "Rakshasa", "Madhya"),
    ("Swati", "स्वाती", "Rahu", "Buffalo", "Deva", "Antya"),
    ("Vishakha", "विशाखा", "Jupiter", "Tiger", "Rakshasa", "Antya"),
    ("Anuradha", "अनुराधा", "Saturn", "Deer", "Deva", "Madhya"),
    ("Jyeshtha", "ज्येष्ठा", "Mercury", "Deer", "Rakshasa", "Adi"),
    ("Mula", "मूल", "Ketu", "Dog", "Rakshasa", "Adi"),
    ("Purva Ashadha", "पूर्वाषाढा", "Venus", "Monkey", "Manushya", "Madhya"),
    ("Uttara Ashadha", "उत्तराषाढा", "Sun", "Mongoose", "Manushya", "Antya"),
    ("Shravana", "श्रवण", "Moon", "Monkey", "Deva", "Antya"),
    ("Dhanishta", "धनिष्ठा", "Mars", "Lion", "Rakshasa", "Madhya"),
    ("Shatabhisha", "शतभिषा", "Rahu", "Horse", "Rakshasa", "Adi"),
    ("Purva Bhadrapada", "पूर्वभाद्रपदा", "Jupiter", "Lion", "Manushya", "Adi"),
    ("Uttara Bhadrapada", "उत्तरभाद्रपदा", "Saturn", "Cow", "Manushya", "Madhya"),
    ("Revati", "रेवती", "Mercury", "Elephant", "Deva", "Antya"),
]

NAKSHATRAS = {
    i + 1: {
        "name": row[0],
        "devanagari": row[1],
        "lord": row[2],
        "yoni": row[3],
        "gana": row[4],
        "nadi": row[5],
        "start_degree": i * (40 / 3),
        "end_degree": (i + 1) * (40 / 3),
        "padas": [
            {"pada": p + 1, "start_degree": i * (40 / 3) + p * (10 / 3), "end_degree": i * (40 / 3) + (p + 1) * (10 / 3)}
            for p in range(4)
        ],
    }
    for i, row in enumerate(_names)
}

