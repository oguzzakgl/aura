"""
🏛️ AURA YOLO DENTAL SERVICE v1.0
@ai: HuggingFace'ten hazır eğitilmiş YOLOv8 dental patoloji modeli.
"""
import os
from typing import List, Dict

YOLO_CLASS_MAP: Dict[str, str] = {
    "cavity": "caries",
    "caries": "caries",
    "crown": "filling",
    "filling": "filling",
    "implant": "implant",
    "periapical lesion": "lesion",
    "periapical_lesion": "lesion",
    "root canal treatment": "endo",
    "root_canal_treatment": "endo",
    "root canal": "endo",
    "missing tooth": "missing",
    "missing": "missing",
    "impacted": "extraction",
    "impacted tooth": "extraction",
}

CONFIDENCE_THRESHOLD = 0.25


class YoloDentalService:
    """YOLOv8 tabanlı diş patolojisi tespit motoru."""

    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            model_id = "ajeetsraina/clinical-dental-pathology-detector"
            print(f"[AURA YOLO]: Loading model from {model_id}...")
            self.model = YOLO(model_id)
            print(f"[AURA YOLO]: Model loaded. Classes: {self.model.names}")
        except Exception as e:
            print(f"[AURA YOLO ERROR]: Model load failed: {e}")

    def map_bbox_to_fdi(self, x_center: float, y_center: float, width: float, height: float) -> int:
        """
        P1-1 / P4-4: Geometrik Dental Haritalama (FDI Projeksiyonu).
        Bir panoramik röntgende bounding box merkezini (x, y) resim boyutlarına (W, H)
        oranlayarak yaklaşık FDI Diş Numarasını tahmin eder.
        """
        # Görüntüyü üst (Maxilla) ve alt (Mandible) olarak ikiye böl
        is_upper = y_center < (height / 2.0)
        
        # X oranını bul (0.0 - 1.0)
        x_ratio = x_center / width
        
        # Üst çene (Maxilla): Soldan sağa (Görselin solundan sağına)
        # Hastanın Sağı (Görselin Solu) -> Hastanın Solu (Görselin Sağı)
        # Dişler: 18 -> 11 (sol yarı), 21 -> 28 (sağ yarı)
        if is_upper:
            if x_ratio < 0.5:
                # 0.0 ile 0.5 arası -> 18'den 11'e (8 diş)
                segment = int(x_ratio * 2.0 * 8)
                fdi = 18 - segment
                return max(11, min(18, fdi))
            else:
                # 0.5 ile 1.0 arası -> 21'den 28'e (8 diş)
                segment = int((x_ratio - 0.5) * 2.0 * 8)
                fdi = 21 + segment
                return max(21, min(28, fdi))
        # Alt çene (Mandible): Soldan sağa
        # Dişler: 48 -> 41 (sol yarı), 31 -> 38 (sağ yarı)
        else:
            if x_ratio < 0.5:
                # 0.0 ile 0.5 arası -> 48'den 41'e (8 diş)
                segment = int(x_ratio * 2.0 * 8)
                fdi = 48 - segment
                return max(41, min(48, fdi))
            else:
                # 0.5 ile 1.0 arası -> 31'den 38'e (8 diş)
                segment = int((x_ratio - 0.5) * 2.0 * 8)
                fdi = 31 + segment
                return max(31, min(38, fdi))

    def detect(self, image_path: str) -> List[Dict]:
        """Görüntüde diş patolojilerini tespit eder."""
        if self.model is None:
            return []

        try:
            results = self.model.predict(
                source=image_path,
                conf=CONFIDENCE_THRESHOLD,
                verbose=False,
            )
        except Exception as e:
            print(f"[AURA YOLO ERROR]: Prediction failed: {e}")
            return []

        findings: List[Dict] = []

        for result in results:
            if result.boxes is None:
                continue
            
            # Görüntü orijinal boyutları
            img_h, img_w = result.orig_shape if hasattr(result, 'orig_shape') else (1000, 2000)
            
            for box in result.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                raw_label = self.model.names.get(cls_id, "unknown").lower()
                pathology = YOLO_CLASS_MAP.get(raw_label, raw_label)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Bbox merkez koordinatları
                x_center = (x1 + x2) / 2.0
                y_center = (y1 + y2) / 2.0
                
                # Geometrik FDI tahmini
                predicted_tooth_id = self.map_bbox_to_fdi(x_center, y_center, img_w, img_h)

                findings.append({
                    "pathology": pathology,
                    "confidence": round(conf, 3),
                    "bbox": {"x1": round(x1), "y1": round(y1), "x2": round(x2), "y2": round(y2)},
                    "tooth_id": predicted_tooth_id,
                    "raw_label": raw_label,
                    "source": "yolo",
                })

        print(f"[AURA YOLO]: Detected {len(findings)} findings with geometric FDI mapping.")
        return findings


yolo_dental_service = YoloDentalService()
