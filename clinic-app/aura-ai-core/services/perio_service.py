from typing import Dict, List, Any

class PerioService:
    """
    Özellik 9: Periodontal Değerlendirme ve Grafikleme Servisi (Perio Service).
    Klinik olarak her diş için 6 noktadan ölçülen cep derinliği (Pocket Depth) ve
    dişeti çekilmesi (Recession) verilerini analiz eder, Periodontal Durum Özeti hazırlar.
    """
    
    def __init__(self):
        # Varsayılan periodontal veri şablonu (11-48 FDI dişleri için)
        self.default_perio_data: Dict[int, Dict[str, Any]] = {}
        self._initialize_default_data()

    def _initialize_default_data(self):
        # 32 diş için varsayılan sağlıklı perio verisi
        fdi_teeth = [
            18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
            38, 37, 36, 35, 34, 33, 32, 31, 41, 42, 43, 44, 45, 46, 47, 48
        ]
        for tooth in fdi_teeth:
            self.default_perio_data[tooth] = {
                "pocket_depth": {
                    "buccal": {"mesial": 2, "mid": 1, "distal": 2},
                    "lingual": {"mesial": 2, "mid": 2, "distal": 2}
                },
                "recession": {
                    "buccal": {"mesial": 0, "mid": 0, "distal": 0},
                    "lingual": {"mesial": 0, "mid": 0, "distal": 0}
                },
                "mobility": 0,  # 0, 1, 2, 3
                "bleeding_on_probing": False,
                "furcation": 0 # 0, I, II, III
            }

    def get_perio_chart(self, patient_id: str) -> Dict[str, Any]:
        """
        Hastanın periodontal haritasını döner.
        """
        # Hacer Erkan için bazı periodontal lezyonlu mock veriler ekleyelim
        patient_data = dict(self.default_perio_data)
        
        # Diş #16 periodontal cep derinliği lezyonlu
        patient_data[16] = {
            "pocket_depth": {
                "buccal": {"mesial": 5, "mid": 3, "distal": 4},
                "lingual": {"mesial": 4, "mid": 3, "distal": 5}
            },
            "recession": {
                "buccal": {"mesial": 1, "mid": 2, "distal": 1},
                "lingual": {"mesial": 0, "mid": 1, "distal": 1}
            },
            "mobility": 1,
            "bleeding_on_probing": True,
            "furcation": 1
        }
        
        # Diş #36 periodontal cep derinliği lezyonlu
        patient_data[36] = {
            "pocket_depth": {
                "buccal": {"mesial": 6, "mid": 4, "distal": 6},
                "lingual": {"mesial": 5, "mid": 3, "distal": 5}
            },
            "recession": {
                "buccal": {"mesial": 2, "mid": 2, "distal": 3},
                "lingual": {"mesial": 1, "mid": 1, "distal": 2}
            },
            "mobility": 2,
            "bleeding_on_probing": True,
            "furcation": 2
        }

        # İstatistikleri hesapla
        total_sites = 32 * 6
        bleeding_sites = 0
        deep_pockets = 0 # >= 4mm cep
        
        for tooth, data in patient_data.items():
            if data["bleeding_on_probing"]:
                bleeding_sites += 6 # varsayılan kanama bölgesi
            
            for side in ["buccal", "lingual"]:
                for pos in ["mesial", "mid", "distal"]:
                    if data["pocket_depth"][side][pos] >= 4:
                        deep_pockets += 1
                        
        bleeding_index = round((bleeding_sites / total_sites) * 100, 1)

        return {
            "patient_id": patient_id,
            "bleeding_index_pct": bleeding_index,
            "deep_pockets_count": deep_pockets,
            "teeth_data": patient_data
        }

    def update_tooth_perio(self, patient_id: str, tooth_id: int, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Hastanın periodontal haritasındaki tek bir dişe ait ölçümleri günceller.
        """
        # Bellek içinde güncelle
        if tooth_id in self.default_perio_data:
            self.default_perio_data[tooth_id].update(update_data)
        return self.get_perio_chart(patient_id)

perio_service = PerioService()
