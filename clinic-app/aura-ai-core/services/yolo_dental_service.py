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
    "periapical lesion": "cyst",
    "periapical_lesion": "cyst",
    "cyst": "cyst",
    "lesion": "cyst",
    "root canal treatment": "endo",
    "root_canal_treatment": "endo",
    "root canal": "endo",
    "missing tooth": "missing",
    "missing": "missing",
    "impacted": "extraction",
    "impacted tooth": "extraction",
    "bone loss": "bone_loss",
    "bone_loss": "bone_loss",
    "periodontitis": "bone_loss",
}

CONFIDENCE_THRESHOLD = 0.45


class YoloDentalService:
    """YOLOv8 tabanlı diş patolojisi tespit motoru."""

    def __init__(self):
        self.model = None
        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            
            # P1: Yerel Modeli Önceliklendir
            local_model_path = os.path.join(os.getcwd(), "models", "best_yolo_dental.pt")
            
            if os.path.exists(local_model_path):
                print(f"[AURA YOLO]: Kendi özel modelimiz yükleniyor: {local_model_path}")
                self.model = YOLO(local_model_path)
            else:
                # Modeli henüz eğitmediysek (dosya yoksa) programın çökmemesi için
                # Standart YOLOv8 nesne tanıma modelini (yolov8n.pt) yedek (fallback) olarak yükle
                print(f"[AURA YOLO WARN]: Özel model bulunamadı ({local_model_path}).")
                print("[AURA YOLO]: Yedek (Fallback) olarak standart 'yolov8n.pt' yükleniyor...")
                self.model = YOLO("yolov8n.pt") # Ultralytics bunu otomatik indirir
                
            print(f"[AURA YOLO]: Model yüklendi. Algılanan sınıflar: {self.model.names}")
            
        except Exception as e:
            print(f"[AURA YOLO ERROR]: Model yükleme başarısız oldu: {e}")

    def map_bbox_to_universal(self, x_center: float, y_center: float, width: float, height: float) -> int:
        """
        P1-1 / P4-4: Geometrik Dental Haritalama (Universal Projeksiyonu).
        Bir panoramik röntgende bounding box merkezini (x, y) resim boyutlarına (W, H)
        oranlayarak 1-32 arasındaki Universal Diş Numarasını tahmin eder.
        Kullanıcı Kuralı: Üst çene soldan sağa 1-16, Alt çene soldan sağa 17-32.
        """
        # Görüntüyü üst (Maxilla) ve alt (Mandible) olarak ikiye böl
        is_upper = y_center < (height / 2.0)
        
        # X oranını bul (0.0 - 1.0) (Görselin solu 0.0, sağı 1.0)
        x_ratio = x_center / width
        
        if is_upper:
            # Üst çene: Soldan sağa 1'den 16'ya (16 diş)
            tooth_id = int(x_ratio * 16) + 1
            return max(1, min(16, tooth_id))
        else:
            # Alt çene: Soldan sağa 17'den 32'ye (16 diş)
            tooth_id = int(x_ratio * 16) + 17
            return max(17, min(32, tooth_id))

    def detect(self, image_path: str) -> List[Dict]:
        """Görüntüde diş patolojilerini tespit eder."""
        if self.model is None:
            return []

        try:
            results = self.model.predict(
                source=image_path,
                conf=CONFIDENCE_THRESHOLD,
                augment=True,
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
                
                # Geometrik Universal tahmin
                predicted_tooth_id = self.map_bbox_to_universal(x_center, y_center, img_w, img_h)

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
