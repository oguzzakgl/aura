from typing import List, Dict, Any
import datetime

class PatientHistoryService:
    """
    Özellik 8: Hasta Geçmişi & Progresyon Takibi Servisi.
    Hastanın geçmiş taramalarını, konsensüs bulgularını saklar ve
    kronolojik bir zaman serisi progresyon analizi sunar.
    """
    
    def __init__(self):
        # Local bellek içi (In-Memory) mock veri havuzu (Hata toleransı ve offline stabilite için)
        self.mock_history: Dict[str, List[Dict[str, Any]]] = {
            "76A22DC2": [
                {
                    "scan_id": "scan_001",
                    "scan_date": (datetime.date.today() - datetime.timedelta(days=365)).isoformat(), # 1 yıl önce
                    "modality": "OPG (Panoramik)",
                    "image_url": "/static/scans/hacer_old_1.jpg",
                    "consensus_findings": [
                        {"tooth_id": 16, "pathology": "caries", "severity": "Orta", "consensus": "Onaylı", "confidence": 0.88},
                        {"tooth_id": 11, "pathology": "calculus", "severity": "Hafif", "consensus": "Onaylı", "confidence": 0.95}
                    ],
                    "gemini_report": "Diş #16 distalinde başlangıç çürüğü izlenmektedir. Genel tartar birikimi mevcuttur."
                },
                {
                    "scan_id": "scan_002",
                    "scan_date": (datetime.date.today() - datetime.timedelta(days=180)).isoformat(), # 6 ay önce
                    "modality": "OPG (Panoramik)",
                    "image_url": "/static/scans/hacer_old_2.jpg",
                    "consensus_findings": [
                        {"tooth_id": 16, "pathology": "caries", "severity": "Ciddi", "consensus": "Onaylı", "confidence": 0.92},
                        {"tooth_id": 26, "pathology": "endo", "severity": "Orta", "consensus": "Onaylı", "confidence": 0.85},
                        {"tooth_id": 11, "pathology": "clean", "severity": "Hafif", "consensus": "Onaylı", "confidence": 0.98}
                    ],
                    "gemini_report": "Diş #16'daki çürük lezyonu ilerleyerek dentine ulaşmıştır. Diş #26'da kök kanallarında yetersiz dolgu izlenmektedir."
                }
            ]
        }

    def get_patient_scans(self, patient_id: str) -> List[Dict[str, Any]]:
        """
        Hastanın geçmiş taramalarını kronolojik sırada getirir.
        """
        return self.mock_history.get(patient_id.upper(), [])

    def save_scan(self, patient_id: str, findings: List[Dict[str, Any]], gemini_report: str) -> Dict[str, Any]:
        """
        Hastaya yeni bir tarama kaydı ekler.
        """
        pid = patient_id.upper()
        if pid not in self.mock_history:
            self.mock_history[pid] = []
            
        new_scan = {
            "scan_id": f"scan_{len(self.mock_history[pid]) + 1:03d}",
            "scan_date": datetime.date.today().isoformat(),
            "modality": "OPG (Panoramik)",
            "image_url": "/static/scans/hacer_current.jpg",
            "consensus_findings": findings,
            "gemini_report": gemini_report
        }
        
        self.mock_history[pid].append(new_scan)
        return new_scan

    def get_tooth_progression(self, patient_id: str, tooth_id: int) -> List[Dict[str, Any]]:
        """
        Belirli bir dişin (FDI) zaman içindeki gelişimini (progresyon) getirir.
        Örnek: Diş #16: 1 Yıl Önce -> Çürük (Orta), 6 Ay Önce -> Çürük (Ciddi), Bugün -> Tedavi Edildi/Dolgu.
        """
        scans = self.get_patient_scans(patient_id)
        progression = []
        
        for scan in scans:
            tooth_finding = {"pathology": "clean", "severity": "Yok", "consensus": "Onaylı"}
            for f in scan["consensus_findings"]:
                if f.get("tooth_id") == tooth_id:
                    tooth_finding = {
                        "pathology": f.get("pathology", "clean"),
                        "severity": f.get("severity", "Orta"),
                        "consensus": f.get("consensus", "Onaylı")
                    }
                    break
            
            progression.append({
                "scan_id": scan["scan_id"],
                "scan_date": scan["scan_date"],
                "finding": tooth_finding
            })
            
        return progression

patient_history_service = PatientHistoryService()
