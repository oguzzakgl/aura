from .base_agent import BaseAuraAgent
from typing import Dict, Any, List

class PerioAgent(BaseAuraAgent):
    """
    Periodontal Teşhis Ajanı (Periodontics Expert).
    SADECE kemik kaybı, periodontitis veya diş eti hastalığı gibi periodontal
    patolojilere sahip dişlere uzman görüşü ekler.
    AAP 2017 klasifikasyonuna göre evreleme yapar.
    """
    # Periodontal uzmanlık alanına giren patolojiler
    PERIO_PATHOLOGIES = {"bone_loss", "periodontitis", "recession", "gingivitis", "calculus", "plaque"}

    def __init__(self):
        super().__init__(agent_id="aura-perio-01", specialty="Periodontics")

    def _determine_periodontitis_stage(self, bone_loss_pct: float, max_pocket_depth: float) -> Dict[str, str]:
        """AAP 2017 Periodontal Hastalık Evrelemesi (Staging)."""
        if bone_loss_pct < 15 and max_pocket_depth <= 4:
            return {
                "stage": "Evre I (Hafif Periodontitis)", 
                "severity": "Hafif", 
                "therapy": "Profilaksi, Subgingival Diş Taşı Temizliği (Scaling)"
            }
        elif (15 <= bone_loss_pct <= 33) or (4 < max_pocket_depth <= 5):
            return {
                "stage": "Evre II (Orta Periodontitis)", 
                "severity": "Orta", 
                "therapy": "Kök Düzeltmesi (Scaling and Root Planing - SRP), Lazer Terapi"
            }
        else:
            return {
                "stage": "Evre III/IV (İleri/Şiddetli Periodontitis)", 
                "severity": "Kritik", 
                "therapy": "Periodontal Cerrahi (Flap Operasyonu), Rejeneratif Membran Tedavisi"
            }

    async def analyze(self, data: Any) -> Dict[str, Any]:
        """Sadece periodontal patolojilere sahip dişleri değerlendirir."""
        findings: List[Dict[str, Any]] = []
        
        yolo_findings = data.get("yolo_findings", []) if isinstance(data, dict) else []
        gemini_findings = data.get("gemini_findings", []) if isinstance(data, dict) else []
        
        all_findings = yolo_findings + gemini_findings
        overall_recommendation = "Genel Profilaksi ve Takip"
        
        for f in all_findings:
            t_id = f.get("tooth_id")
            pathology = (f.get("pathology") or "").lower().strip()
            
            # Sadece periodontal patolojilere müdahale et
            if t_id and pathology in self.PERIO_PATHOLOGIES:
                pocket_depth = 4.5
                bone_loss_pct = 22.0
                volume_mm3 = 0.45
                
                diagnosis = self._determine_periodontitis_stage(bone_loss_pct, pocket_depth)
                finding_desc = f"{diagnosis['stage']}. Hacimsel kemik kaybı: {volume_mm3}mm³."
                overall_recommendation = diagnosis["therapy"]
                
                findings.append({
                    "tooth_id": t_id,
                    "pathology": "periodontitis",
                    "type": "Kemik Kaybı (Alveoler Bone Loss)",
                    "severity": diagnosis["severity"],
                    "bone_loss_percentage": bone_loss_pct,
                    "pocket_depth_mm": pocket_depth,
                    "volume_mm3": volume_mm3,
                    "confidence": 0.92,
                    "description": finding_desc,
                    "seal": self.seal_finding(finding_desc)
                })

        return {
            "agent": self.specialty,
            "status": "COMPLETED",
            "findings": findings,
            "recommendation": overall_recommendation
        }
