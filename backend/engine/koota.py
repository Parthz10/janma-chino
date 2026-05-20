"""Ashta Koota 36-guna compatibility engine."""

from backend.data.nakshatra_tables import NAKSHATRAS, SIGNS
from backend.data.planet_friendships import relation

VARNA_RANK = {"Shudra": 1, "Vaishya": 2, "Kshatriya": 3, "Brahmin": 4}
SAFE_TARA = {0, 2, 4, 6, 8}
YONI_ENEMIES = {("Cat", "Rat"), ("Rat", "Cat"), ("Serpent", "Mongoose"), ("Mongoose", "Serpent"), ("Dog", "Deer"), ("Deer", "Dog"), ("Cow", "Tiger"), ("Tiger", "Cow")}
GRAHA_POINTS = {("friend", "friend"): 5, ("friend", "neutral"): 4, ("neutral", "friend"): 4, ("neutral", "neutral"): 3, ("friend", "enemy"): 1, ("enemy", "friend"): 1, ("enemy", "enemy"): 0, ("neutral", "enemy"): 0.5, ("enemy", "neutral"): 0.5}
BAD_BHAKOOT = {(2, 12), (12, 2), (6, 8), (8, 6), (5, 9), (9, 5)}

def count_nak(from_idx: int, to_idx: int) -> int:
    return ((to_idx - from_idx) % 27) + 1

def distance(from_sign: int, to_sign: int) -> int:
    return ((to_sign - from_sign) % 12) + 1

def ashta_koota(bride: dict, groom: dict) -> dict:
    b_nak, g_nak = NAKSHATRAS[bride["moon_nakshatra_index"]], NAKSHATRAS[groom["moon_nakshatra_index"]]
    b_sign, g_sign = SIGNS[bride["moon_sign"]], SIGNS[groom["moon_sign"]]
    varna = 1 if VARNA_RANK[g_sign["varna"]] >= VARNA_RANK[b_sign["varna"]] else 0
    vashya = 2 if b_sign["vashya"] == g_sign["vashya"] else 1 if "Manav" in [b_sign["vashya"], g_sign["vashya"]] else 0.5
    tara_good = sum(1 for c in [count_nak(bride["moon_nakshatra_index"], groom["moon_nakshatra_index"]) % 9, count_nak(groom["moon_nakshatra_index"], bride["moon_nakshatra_index"]) % 9] if c in SAFE_TARA)
    tara = 1.5 * tara_good
    yoni = 4 if b_nak["yoni"] == g_nak["yoni"] else 0 if (b_nak["yoni"], g_nak["yoni"]) in YONI_ENEMIES else 2
    rel1 = relation(b_sign["lord"], g_sign["lord"])
    rel2 = relation(g_sign["lord"], b_sign["lord"])
    graha = GRAHA_POINTS[(rel1, rel2)]
    gana = 6 if b_nak["gana"] == g_nak["gana"] or (g_nak["gana"], b_nak["gana"]) == ("Deva", "Manushya") else 0 if "Rakshasa" in [b_nak["gana"], g_nak["gana"]] else 3
    bh_dist = (distance(bride["moon_sign"], groom["moon_sign"]), distance(groom["moon_sign"], bride["moon_sign"]))
    bhakoot = 0 if bh_dist in BAD_BHAKOOT else 7
    same_nadi = b_nak["nadi"] == g_nak["nadi"]
    same_nakshatra_distinct_pada = bride["moon_nakshatra_index"] == groom["moon_nakshatra_index"] and bride.get("moon_pada") != groom.get("moon_pada")
    nadi = 0 if same_nadi and not same_nakshatra_distinct_pada else 8
    categories = {"Varna": varna, "Vashya": vashya, "Tara": tara, "Yoni": yoni, "Graha Maitri": graha, "Gana": gana, "Bhakoot": bhakoot, "Nadi": nadi}
    return {"categories": categories, "total": sum(categories.values()), "max": 36, "doshas": {"gana": gana == 0, "bhakoot": bhakoot == 0, "nadi": nadi == 0}}
