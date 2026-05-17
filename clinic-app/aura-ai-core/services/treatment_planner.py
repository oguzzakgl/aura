from typing import List, Dict, Any

class TreatmentPlanner:
    """
    Özellik 6: Klinik Tedavi Planı Önericisi (Treatment Planner).
    Bulgu konsensüs analizini okur ve diş hekimleri için
    kronolojik, aciliyet odaklı, tahmini seans ve süre hesaplayan
    bir klinik tedavi protokolü hazırlar.
    """
    
    # Klinik bulgudan tedaviye eşleştirme ve maliyet katsayıları
    TREATMENT_MAP = {
        "caries": {
            "title": "Kompozit Dolgu",
            "sessions": 1,
            "duration_mins": 30,
            "cost_score": 1,
            "urgency": "Orta",
            "clinical_notes": "Sınıf I/II kavite restorasyonu, derin lezyon ise kuafaj gerekebilir."
        },
        "endo": {
            "title": "Kanal Tedavisi (Kök Kanal Tedavisi)",
            "sessions": 2,
            "duration_mins": 45,
            "cost_score": 3,
            "urgency": "Yüksek",
            "clinical_notes": "Apikal periodontitis şüphesi. Kanal genişletme, şekillendirme ve sızdırmaz dolgu."
        },
        "lesion": {
            "title": "Apikal Rezeksiyon / Kist Eksizyonu",
            "sessions": 1,
            "duration_mins": 60,
            "cost_score": 4,
            "urgency": "Kritik",
            "clinical_notes": "Kök ucu lezyonunun cerrahi temizliği ve retrograde dolgu."
        },
        "impacted": {
            "title": "Gömülü Diş Cerrahi Çekimi",
            "sessions": 1,
            "duration_mins": 45,
            "cost_score": 3,
            "urgency": "Yüksek",
            "clinical_notes": "Mezioanguler/horizontal konumda osteotomi gerekebilir, mandibular sinir takibi."
        },
        "missing": {
            "title": "Dental İmplant Uygulaması (Kemik İçi)",
            "sessions": 2,
            "duration_mins": 45,
            "cost_score": 8,
            "urgency": "Düşük",
            "clinical_notes": "Alveoler kemik hacmi ölçümü sonrası osseointegrasyon için 3 ay bekleme süreli cerrahi."
        },
        "periodontitis": {
            "title": "Subgingival Küretaj / Kök Düzeltmesi (SRP)",
            "sessions": 4,
            "duration_mins": 40,
            "cost_score": 2,
            "urgency": "Yüksek",
            "clinical_notes": "Çeyrek çene (kuadran) bazlı derin diş taşı temizliği ve kök düzeltmesi."
        },
        "calculus": {
            "title": "Detertraj (Diş Taşı Temizliği) + Polisaj",
            "sessions": 1,
            "duration_mins": 25,
            "cost_score": 1,
            "urgency": "Orta",
            "clinical_notes": "Supra ve subgingival plak/tartar eliminasyonu."
        },
        "recession": {
            "title": "Bağ Dokusu Grefti / Serbest Dişeti Grefti",
            "sessions": 1,
            "duration_mins": 60,
            "cost_score": 5,
            "urgency": "Orta",
            "clinical_notes": "Diş eti çekilmesinin cerrahi greftle kapatılması."
        },
        "fracture": {
            "title": "Kron-Kök Kırığı Tedavisi (Post-Core + Zirkonyum)",
            "sessions": 2,
            "duration_mins": 40,
            "cost_score": 4,
            "urgency": "Kritik",
            "clinical_notes": "Kırık hattı supra-alveoler ise post-core restorasyonu, sub-alveoler ise çekim düşünülebilir."
        }
    }

    # Aciliyet sıralaması (Kritik öncelikli başa gelecek şekilde)
    URGENCY_PRIORITY = {
        "Kritik": 0,
        "Yüksek": 1,
        "Orta": 2,
        "Düşük": 3
    }

    def generate_plan(self, consensus_findings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Bulgu listesinden aciliyet sıralı ve seans hesaplı tedavi planı oluşturur.
        """
        procedures: List[Dict[str, Any]] = []
        total_sessions = 0
        total_duration = 0
        total_cost_score = 0
        
        for finding in consensus_findings:
            pathology = finding.get("pathology", "").lower()
            tooth_id = finding.get("tooth_id")
            
            # Eğer bilinen bir patolojiyse plan ata
            if pathology in self.TREATMENT_MAP:
                treatment = self.TREATMENT_MAP[pathology]
                
                # Diş numarasını ve bulgu detayını ekleyerek yeni bir tedavi kalemi oluştur
                proc = {
                    "tooth_id": tooth_id,
                    "finding_type": finding.get("type", pathology.capitalize()),
                    "severity": finding.get("severity", "Orta"),
                    "treatment_title": treatment["title"],
                    "sessions": treatment["sessions"],
                    "duration_mins": treatment["duration_mins"],
                    "cost_score": treatment["cost_score"],
                    "urgency": treatment["urgency"],
                    "clinical_notes": treatment["clinical_notes"],
                    "confidence": finding.get("confidence", 0.90)
                }
                
                procedures.append(proc)
                total_sessions += treatment["sessions"]
                total_duration += treatment["duration_mins"]
                total_cost_score += treatment["cost_score"]
                
        # Bulguları aciliyete göre sırala (Kritik -> Yüksek -> Orta -> Düşük)
        procedures.sort(key=lambda x: self.URGENCY_PRIORITY.get(x["urgency"], 99))
        
        # Fazlama (Phasing): Tedavileri klinik fazlara ayır
        # Faz 1: Acil & Kritik (Ağrı dindirme, enfeksiyon kontrolü)
        # Faz 2: Konservatif & Cerrahi (Dolgu, Kanal tedavisi, Çekim)
        # Faz 3: Protetik & Estetik (İmplant, Kron)
        phased_plan = {
            "phase_1_urgent": [],
            "phase_2_restorative": [],
            "phase_3_reconstructive": []
        }
        
        for proc in procedures:
            if proc["urgency"] in ["Kritik", "Yüksek"] and proc["finding_type"] != "Dental İmplant Uygulaması (Kemik İçi)":
                phased_plan["phase_1_urgent"].append(proc)
            elif proc["urgency"] == "Orta" or proc["finding_type"] == "Subgingival Küretaj / Kök Düzeltmesi (SRP)":
                phased_plan["phase_2_restorative"].append(proc)
            else:
                phased_plan["phase_3_reconstructive"].append(proc)

        return {
            "total_procedures": len(procedures),
            "total_sessions": total_sessions,
            "estimated_time_mins": total_duration,
            "cost_index_score": total_cost_score,
            "all_procedures": procedures,
            "phased_plan": phased_plan
        }

treatment_planner = TreatmentPlanner()
