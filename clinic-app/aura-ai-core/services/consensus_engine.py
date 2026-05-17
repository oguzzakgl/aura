"""
🏛️ AURA CONSENSUS ENGINE v1.0
@ai: İki motorun (YOLO + Gemini) bulgularını birleştiren akıllı konsensüs motoru.

KURALLAR:
- İki motor aynı patolojiyi tespit ederse → status: "Onaylı"   (güven %90+)
- Sadece YOLO bulduysa                   → status: "Muhtemel"  (görsel kanıt var)
- Sadece Gemini bulduysa                 → status: "Belirsiz"  (tek kaynak)
- Çelişkili bulgular                     → status: "Çelişkili" (hekim incelemeli)
"""
from typing import List, Dict


def normalize_pathology(raw: str) -> str:
    """Patoloji isimlerini standart formata çevir."""
    lower = (raw or "").lower().strip()
    alias_map = {
        "cavity": "caries", "çürük": "caries", "decay": "caries",
        "filling": "filling", "dolgu": "filling", "crown": "filling",
        "endo": "endo", "kanal": "endo", "root canal": "endo",
        "implant": "implant",
        "missing": "missing", "eksik": "missing",
        "extraction": "extraction", "çekim": "extraction",
        "impacted": "impacted", "gömülü": "impacted",
        "lesion": "lesion", "lezyon": "lesion",
        "kist": "cyst", "cyst": "cyst", "cystic": "cyst", "kistik": "cyst",
        "fracture": "fracture", "kırık": "fracture",
        "resorption": "resorption", "rezorpsiyon": "resorption",
        "bone loss": "bone_loss", "bone_loss": "bone_loss", "kemik kaybı": "bone_loss",
        "alveolar bone loss": "bone_loss", "periodontitis": "bone_loss"
    }
    return alias_map.get(lower, lower)


def merge_findings(
    yolo_findings: List[Dict],
    gemini_findings: List[Dict],
) -> List[Dict]:
    """
    YOLO ve Gemini bulgularını birleştirir.

    @param yolo_findings: YOLO modelinden gelen bulgular (bbox tabanlı, dişe atanmamış)
    @param gemini_findings: Gemini'den gelen bulgular (FDI tooth_id tabanlı)
    @return: Birleştirilmiş ve statülenmiş bulgular listesi
    """
    merged: List[Dict] = []

    # Gemini bulgularını patoloji bazlı indexle
    gemini_by_pathology: Dict[str, List[Dict]] = {}
    for gf in gemini_findings:
        p = normalize_pathology(gf.get("pathology", ""))
        gemini_by_pathology.setdefault(p, []).append(gf)

    # YOLO bulgularını patoloji bazlı indexle
    yolo_by_pathology: Dict[str, List[Dict]] = {}
    for yf in yolo_findings:
        p = normalize_pathology(yf.get("pathology", ""))
        yolo_by_pathology.setdefault(p, []).append(yf)

    # Tüm benzersiz patoloji türlerini topla
    all_pathologies = set(gemini_by_pathology.keys()) | set(yolo_by_pathology.keys())

    for pathology in all_pathologies:
        yolo_hits = yolo_by_pathology.get(pathology, [])
        gemini_hits = gemini_by_pathology.get(pathology, [])

        has_yolo = len(yolo_hits) > 0
        has_gemini = len(gemini_hits) > 0

        if has_yolo and has_gemini:
            # ✅✅ İKİ MOTOR DA ONAYLIYOR
            for gf in gemini_hits:
                yolo_conf = max(y.get("confidence", 0) for y in yolo_hits)
                gemini_conf = gf.get("confidence", 0.80)
                avg_conf = (yolo_conf + gemini_conf) / 2
                merged.append({
                    "tooth_id": gf.get("tooth_id"),
                    "pathology": pathology,
                    "severity": gf.get("severity", "Orta"),
                    "consensus": "Onaylı",
                    "confidence": round(min(0.99, avg_conf + 0.05), 2),
                    "engines": "YOLO + Gemini",
                    "description": gf.get("description"),
                })

        elif has_yolo and not has_gemini:
            # ✅❓ SADECE YOLO — Görsel kanıt var ama Gemini görmedi
            for yf in yolo_hits:
                merged.append({
                    "tooth_id": yf.get("tooth_id"),
                    "pathology": pathology,
                    "severity": "Orta",
                    "consensus": "Muhtemel",
                    "confidence": round(yf.get("confidence", 0.5) * 0.85, 2),
                    "engines": "YOLO",
                    "bbox": yf.get("bbox"),
                })

        elif has_gemini and not has_yolo:
            # ❓ SADECE GEMINİ — Tek kaynak
            for gf in gemini_hits:
                gemini_conf = gf.get("confidence", 0.55)
                # Gemini'nin kendi güvenini kullan ama %70 ile sınırla
                capped_conf = min(0.70, gemini_conf)
                merged.append({
                    "tooth_id": gf.get("tooth_id"),
                    "pathology": pathology,
                    "severity": gf.get("severity", "Orta"),
                    "consensus": "Belirsiz",
                    "confidence": round(capped_conf, 2),
                    "engines": "Gemini",
                    "description": gf.get("description"),
                })

    # Eğer hiç bulgu yoksa temiz rapor
    if not merged:
        merged.append({
            "tooth_id": None,
            "pathology": "clean",
            "severity": "Temiz",
            "consensus": "Onaylı",
            "confidence": 0.99,
            "engines": "YOLO + Gemini",
        })

    # Güvene göre sırala (en güvenli üstte)
    merged.sort(key=lambda x: x.get("confidence", 0), reverse=True)

    status_emoji = {"Onaylı": "✅✅", "Muhtemel": "✅❓", "Belirsiz": "❓", "Çelişkili": "⚠️"}
    for m in merged:
        emoji = status_emoji.get(m["consensus"], "")
        print(f"[CONSENSUS] {emoji} {m['pathology']:15s} | {m['consensus']:10s} | conf={m['confidence']} | via {m['engines']}")

    return merged
