from .base_agent import BaseAuraAgent
from typing import Dict, Any, List

class EndoAgent(BaseAuraAgent):
    """
    Endodontik Teşhis Ajanı.
    SADECE kök kanal tedavisi, periapikal lezyon ve kist gibi endodontik
    patolojilere sahip dişlere uzman görüşü ekler.
    """
    # Endodontik uzmanlık alanına giren patolojiler
    ENDO_PATHOLOGIES = {"endo", "cyst", "lesion", "resorption", "fracture"}

    def __init__(self):
        super().__init__(agent_id="aura-endo-01", specialty="Endodontics")

    async def analyze(self, data: Any) -> Dict[str, Any]:
        """Sadece endodontik patolojilere sahip dişleri değerlendirir."""
        self.log_reasoning("Scanning periapical areas", "Filtering for endodontic-relevant pathologies only")
        
        yolo_findings = data.get("yolo_findings", []) if isinstance(data, dict) else []
        gemini_findings = data.get("gemini_findings", []) if isinstance(data, dict) else []
        
        all_findings = yolo_findings + gemini_findings
        agent_findings: List[Dict] = []
        
        for f in all_findings:
            t_id = f.get("tooth_id")
            pathology = (f.get("pathology") or "").lower().strip()
            
            # Sadece endodontik patolojilere müdahale et
            if t_id and pathology in self.ENDO_PATHOLOGIES:
                desc = f"Diş #{t_id}: Periapikal bölge değerlendirmesi — {pathology} tespiti endodontik konsültasyon gerektirir."
                agent_findings.append({
                    "tooth_id": t_id,
                    "pathology": pathology,
                    "type": "Endodontik Değerlendirme",
                    "confidence": round(min(f.get("confidence", 0.80), 0.90), 2),
                    "description": desc,
                    "seal": self.seal_finding(desc)
                })

        return {
            "agent": self.specialty,
            "findings": agent_findings,
            "recommendation": "Endodontik değerlendirme yalnızca ilgili patolojiler için önerildi." if agent_findings else "Endodontik müdahale gerektiren bulgu yok."
        }
