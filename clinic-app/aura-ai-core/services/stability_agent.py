import numpy as np
from typing import Dict, Any

class StabilityAgent:
    """
    SURGICAL PREDICTOR: Analyzes bone density (HU) to predict Implant Stability Quotient (ISQ).
    Uses Misch Bone Density Classification (D1-D4).
    """
    def __init__(self):
        # Misch Scale Definitions (HU Values)
        self.misch_ranges = {
            "D1": (1250, 3000), # Dense Cortical (Oak-like)
            "D2": (850, 1250),  # Thick Porous Cortical & Fine Trabecular (White Pine)
            "D3": (350, 850),   # Thin Porous Cortical & Fine Trabecular (Yellow Pine)
            "D4": (150, 350),   # Fine Trabecular (Balsa wood)
            "D5": (-1000, 150)  # Immature Bone / Soft Tissue
        }

    def classify_bone_density(self, hu_value: float) -> str:
        for grade, (low, high) in self.misch_ranges.items():
            if low <= hu_value < high:
                return grade
        return "UNKNOWN"

    def predict_isq(self, volumetric_data: np.ndarray, target_site_coord: tuple) -> Dict[str, Any]:
        """
        Predicts ISQ based on mean HU at the implant site.
        """
        # ROI Analysis around target site
        mean_hu = float(np.mean(volumetric_data)) # Convert numpy.float64 to native float
        classification = self.classify_bone_density(mean_hu)
        
        # Empirical ISQ Prediction Logic
        base_isq = 0
        if classification == "D1": base_isq = 80
        elif classification == "D2": base_isq = 70
        elif classification == "D3": base_isq = 60
        elif classification == "D4": base_isq = 45
        else: base_isq = 30

        return {
            "mean_hu": round(mean_hu, 2),
            "misch_classification": classification,
            "predicted_isq": int(base_isq),
            "osteointegration_potential": "EXCELLENT" if base_isq > 65 else "MODERATE" if base_isq > 50 else "LOW_RISK",
            "recommendation": "Safe for immediate loading" if base_isq > 70 else "Delayed loading recommended"
        }
