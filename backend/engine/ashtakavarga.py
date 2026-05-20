"""Ashtakavarga summary matrix."""

def ashtakavarga(positions: dict) -> dict:
    bav = {planet: {sign: 0 for sign in range(1, 13)} for planet in positions}
    for planet, pos in positions.items():
        for offset in [1, 2, 4, 7, 8, 10, 11]:
            bav[planet][((pos.sign + offset - 2) % 12) + 1] = 1
    sav = {sign: sum(bav[p][sign] for p in bav) for sign in range(1, 13)}
    return {"BAV": bav, "SAV": sav}

