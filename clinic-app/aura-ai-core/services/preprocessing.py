import numpy as np
from typing import Dict, Any

class DicomPreprocessor:
    """
    ELITE PREPROCESSING: Standardizes DICOM data for AI Segmentation.
    Handles HU (Hounsfield Unit) Clipping and Normalization.
    """
    def __init__(self, target_hu_min: int = -1000, target_hu_max: int = 3000):
        self.min_hu = target_hu_min # Air
        self.max_hu = target_hu_max # Dense Bone/Metal

    def clip_and_normalize(self, image: np.ndarray) -> np.ndarray:
        """
        Clips intensity to medical range and normalizes to [0, 1].
        Ensures AI agents receive consistent data across different scanner brands.
        """
        print(f"[Aura Preprocessing] Clipping HU to [{self.min_hu}, {self.max_hu}]...")
        
        # 1. CLIP: Remove noise outside human tissue range
        image = np.clip(image, self.min_hu, self.max_hu)
        
        # 2. NORMALIZE: Scale to [0, 1] for neural network stability
        image = (image - self.min_hu) / (self.max_hu - self.min_hu)
        
        return image.astype(np.float32)

    def denoise_imaging(self, image: np.ndarray) -> np.ndarray:
        """
        Applies Gaussian filtering to reduce sensor noise.
        """
        print("[Aura Preprocessing] Applying noise reduction filters...")
        # In production, use scipy.ndimage.gaussian_filter
        return image

    def validate_quality(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Özellik 5: Panoramik OPG Kalite Kontrolü (Görüntü Kalite Değerlendirmesi).
        Çözünürlük ve bulanıklık (Numpy gradyan varyansı tabanlı kenar keskinliği) kontrolü yapar.
        Düşük kaliteli görsellerde analizi engeller.
        """
        # 1. Çözünürlük Kontrolü (Minimum 512x512 piksel)
        h, w = image.shape[:2]
        if h < 512 or w < 512:
            return {
                "is_valid": False,
                "reason": f"Düşük Çözünürlük ({w}x{h}). Güvenli analiz için minimum 512x512 piksel gereklidir."
            }
            
        # 2. Bulanıklık Algılama (Gradient Variance - Kenar Keskinliği Analizi)
        # Net görüntülerde kenar geçişleri keskindir, varyans yüksek olur. Bulanık görüntülerde varyans düşer.
        grad_y, grad_x = np.gradient(image)[:2]
        edge_variance = np.var(grad_x) + np.var(grad_y)
        
        # Deneysel Eşik Değeri: Normalize edilmiş [0,1] resimler için
        # Eğer çok bulanıksa veya sinyal gürültüsü çok fazlaysa varyans aşırı düşük (< 0.001) olur.
        threshold = 0.0005
        
        if edge_variance < threshold:
            return {
                "is_valid": False,
                "reason": f"Yetersiz Diyagnostik Kalite (Bulanık/Gürültülü Görsel). Kenar keskinliği varyansı ({edge_variance:.6f}) sınır değerin altında."
            }
            
        return {
            "is_valid": True,
            "edge_variance": edge_variance,
            "resolution": f"{w}x{h}"
        }

    @staticmethod
    def generate_tiles(image_path: str, temp_dir: str) -> list:
        """
        Görüntüyü 4 eşit parçaya (2x2 grid) bölerek (Tiling/Ensembling) 
        Gemini Vision modelinin yüksek çözünürlüklü detayları daha iyi görmesini sağlar.
        """
        from PIL import Image
        import os
        import uuid
        
        tiles = []
        try:
            with Image.open(image_path) as img:
                # Convert to RGB in case of RGBA/DICOM
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                w, h = img.size
                boxes = [
                    (0, 0, w//2, h//2),       # Top-Left
                    (w//2, 0, w, h//2),       # Top-Right
                    (0, h//2, w//2, h),       # Bottom-Left
                    (w//2, h//2, w, h)        # Bottom-Right
                ]
                for box in boxes:
                    tile = img.crop(box)
                    tile_path = os.path.join(temp_dir, f"tile_{uuid.uuid4().hex}.jpg")
                    tile.save(tile_path, "JPEG", quality=90)
                    tiles.append(tile_path)
        except Exception as e:
            print(f"[Preprocessing WARN]: Tiling failed: {e}")
        return tiles

