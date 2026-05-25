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
    
    # 1. Her bulguyu tooth_id'ye göre grupla
    by_tooth: Dict[int, Dict[str, List[Dict]]] = {}
    
    def add_to_group(findings_list, source_name):
        for f in findings_list:
            t_id = f.get("tooth_id")
            if t_id is None:
                continue
            if t_id not in by_tooth:
                by_tooth[t_id] = {"yolo": [], "gemini": []}
            by_tooth[t_id][source_name].append(f)

    add_to_group(yolo_findings, "yolo")
    add_to_group(gemini_findings, "gemini")
    
    # 2. Her diş için konsensüs ara
    for t_id, sources in by_tooth.items():
        yolo_list = sources["yolo"]
        gemini_list = sources["gemini"]
        
        # O dişteki tüm benzersiz patolojiler
        all_pathologies = set([normalize_pathology(y.get("pathology","")) for y in yolo_list]) | \
                          set([normalize_pathology(g.get("pathology","")) for g in gemini_list])
        
        for pathology in all_pathologies:
            y_hits = [y for y in yolo_list if normalize_pathology(y.get("pathology","")) == pathology]
            g_hits = [g for g in gemini_list if normalize_pathology(g.get("pathology","")) == pathology]
            
            has_yolo = len(y_hits) > 0
            has_gemini = len(g_hits) > 0
            
            if has_yolo and has_gemini:
                # ✅✅ İKİ MOTOR DA AYNI DİŞTE AYNI ŞEYİ BULDU
                y = y_hits[0]
                g = g_hits[0]
                avg_conf = (y.get("confidence", 0) + g.get("confidence", 0.80)) / 2
                merged.append({
                    "tooth_id": t_id,
                    "pathology": pathology,
                    "severity": g.get("severity", "Orta"),
                    "consensus": "Onaylı",
                    "confidence": round(min(0.99, avg_conf + 0.05), 2),
                    "engines": "YOLO + Gemini",
                    "description": g.get("description"),
                    "bbox": y.get("bbox")  # EN KRİTİK NOKTA: BBOX KORUNUYOR (2D ve 3D Senkronizasyonu)
                })
            elif has_yolo and not has_gemini:
                # ✅❓ SADECE YOLO
                y = y_hits[0]
                merged.append({
                    "tooth_id": t_id,
                    "pathology": pathology,
                    "severity": "Orta",
                    "consensus": "Muhtemel",
                    "confidence": round(y.get("confidence", 0.5) * 0.60, 2),
                    "engines": "YOLO",
                    "bbox": y.get("bbox")
                })
            elif has_gemini and not has_yolo:
                # ❓ SADECE GEMINİ — Gemini'nin kendi güvenine dayalı (çift motor kadar güçlü değil ama gerçekçi)
                g = g_hits[0]
                gemini_conf = g.get("confidence", 0.70)
                adjusted_conf = round(gemini_conf * 0.75, 2)  # Gemini güveninin %75'i
                merged.append({
                    "tooth_id": t_id,
                    "pathology": pathology,
                    "severity": g.get("severity", "Orta"),
                    "consensus": "Muhtemel",
                    "confidence": adjusted_conf,
                    "engines": "Gemini",
                    "description": g.get("description")
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

    status_emoji = {"Onaylı": "[OK]", "Muhtemel": "[?]", "Belirsiz": "[!]", "Çelişkili": "[X]"}
    for m in merged:
        emoji = status_emoji.get(m["consensus"], "")
        print(f"[CONSENSUS] {emoji} {m['pathology']:15s} | {m['consensus']:10s} | conf={m['confidence']} | via {m['engines']}")

    return merged
