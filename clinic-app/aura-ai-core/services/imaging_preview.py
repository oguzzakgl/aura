import pydicom
from PIL import Image
import numpy as np
import io
import os

class ImagingPreviewEngine:
    """
    ELITE PREVIEW ENGINE: Generates anonymized thumbnails for DICOM/MRI series.
    Strips PHI (Patient Health Information) tags during generation.
    """
    def __init__(self, output_size=(256, 256)):
        self.output_size = output_size

    def generate_scrubbed_thumbnail(self, dicom_path: str) -> bytes:
        """
        Reads a DICOM file, strips metadata, and returns a PNG thumbnail.
        """
        ds = pydicom.dcmread(dicom_path)
        
        # 1. DE-IDENTIFICATION (METADATA SCRUBBING)
        # We only use the pixel data, effectively leaving all tags behind
        pixel_array = ds.pixel_array
        
        # 2. NORMALIZATION & RESCALING
        # HU to uint8 conversion for preview
        intercept = ds.RescaleIntercept if 'RescaleIntercept' in ds else 0
        slope = ds.RescaleSlope if 'RescaleSlope' in ds else 1
        
        image = pixel_array.astype(np.float32) * slope + intercept
        image = ((image - np.min(image)) / (np.max(image) - np.min(image)) * 255).astype(np.uint8)
        
        # 3. COMPRESSION & RESIZING
        img = Image.fromarray(image)
        img.thumbnail(self.output_size)
        
        # Save to buffer as PNG
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        
        return buf.getvalue()

    def get_clinical_tags(self, dicom_path: str) -> dict:
        """
        Extracts only non-identifiable clinical parameters.
        """
        ds = pydicom.dcmread(dicom_path)
        return {
            "Modality": ds.Modality if 'Modality' in ds else "Unknown",
            "Manufacturer": ds.Manufacturer if 'Manufacturer' in ds else "Unknown",
            "SliceThickness": str(ds.SliceThickness) if 'SliceThickness' in ds else "N/A"
        }
