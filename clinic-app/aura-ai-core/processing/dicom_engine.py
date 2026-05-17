import pydicom
import numpy as np
import os
from typing import List, Dict, Any, Tuple
from skimage import measure

class DicomRealityEngine:
    """
    GENESIS RECONSTRUCTION: Converts raw DICOM slices into clinical 3D volumes.
    Handles HU normalization and surface extraction.
    """
    def __init__(self):
        self.BONE_THRESHOLD_HU = 500  # Minimum HU for bone detection
        self.ENAMEL_THRESHOLD_HU = 1500 # Minimum HU for tooth enamel

    def load_series(self, directory_path: str) -> np.ndarray:
        """
        Loads a series of DICOM slices and stacks them into a 3D volume.
        """
        slices = [pydicom.dcmread(os.path.join(directory_path, s)) for s in os.listdir(directory_path)]
        slices.sort(key=lambda x: float(x.ImagePositionPatient[2])) # Sort by Z-axis

        # Extract pixel data and convert to Hounsfield Units (HU)
        volume = []
        for s in slices:
            image = s.pixel_array.astype(np.int16)
            
            # Convert to HU: HU = pixel_value * slope + intercept
            intercept = s.RescaleIntercept if 'RescaleIntercept' in s else 0
            slope = s.RescaleSlope if 'RescaleSlope' in s else 1
            
            if slope != 1:
                image = slope * image.astype(np.float64)
                image = image.astype(np.int16)
            
            image += np.int16(intercept)
            volume.append(image)

        return np.stack(volume)

    def extract_surface(self, volume: np.ndarray, threshold: int = 500) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Performs Marching Cubes to generate a 3D mesh surface.
        """
        # Marching Cubes algorithm
        verts, faces, normals, values = measure.marching_cubes(volume, threshold)
        return verts, faces, normals

    def analyze_tissue_pathology(self, volume: np.ndarray) -> Dict[str, Any]:
        """
        DIGITAL BIOPSY: Analyzes HU distribution with Metal Suppression.
        Identifies pathology signatures based on tissue fingerprints.
        """
        # METAL SUPPRESSION: Ignore values > 3000 HU (Implants/Fillings) to avoid noise
        biopsy_volume = volume[volume < 3000]
        
        mean_hu = float(np.mean(biopsy_volume))
        std_hu = float(np.std(biopsy_volume))
        
        # Pathological Fingerprinting
        cystic_ratio = float(np.sum(biopsy_volume < 150) / biopsy_volume.size)
        sclerotic_ratio = float(np.sum((biopsy_volume > 1500) & (biopsy_volume < 3000)) / biopsy_volume.size)
        
        diagnosis_tag = "HEALTHY_BONE"
        if cystic_ratio > 0.15: diagnosis_tag = "CYSTIC_LESION_RISK"
        elif sclerotic_ratio > 0.20: diagnosis_tag = "CORTICAL_SCLEROSIS_DETECTED"
        
        return {
            "mean_hu_scrubbed": round(mean_hu, 2),
            "tissue_signature": diagnosis_tag,
            "pathology_metrics": {
                "cystic_index": round(cystic_ratio, 4),
                "sclerotic_index": round(sclerotic_ratio, 4),
                "metal_artifacts_suppressed": bool(np.any(volume > 3000))
            },
            "surgical_recommendation": self._get_recommendation(diagnosis_tag)
        }

    def _get_recommendation(self, tag: str) -> str:
        recommendations = {
            "CYSTIC_LESION_RISK": "Action: Curettage required. Debride soft tissue before implant placement.",
            "CORTICAL_SCLEROSIS_DETECTED": "Action: Low vascularity. Use undersized drilling to prevent thermal necrosis.",
            "HEALTHY_BONE": "Action: Standard protocol. Optimal primary stability expected."
        }
        return recommendations.get(tag, "Action: Clinical inspection required.")
