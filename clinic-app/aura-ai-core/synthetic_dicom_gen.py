import pydicom
from pydicom.dataset import Dataset, FileDataset
from pydicom.uid import ExplicitVRLittleEndian
import numpy as np
import os
import datetime
from scipy.ndimage import gaussian_filter

def generate_surgical_grade_dicom():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_folder = os.path.join(base_dir, "synthetic_scans")
    
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # 🏛️ ELITE SPECS
    num_slices = 60
    res = 256 # Balanced for speed and quality
    print(f"--- Aura A.R.E. Generating SURGICAL GRADE data ({res}x{res}x{num_slices})")

    for i in range(num_slices):
        file_meta = Dataset()
        file_meta.MediaStorageSOPClassUID = '1.2.840.10008.5.1.4.1.1.2'
        file_meta.MediaStorageSOPInstanceUID = f"1.2.3.4.5.6.7.{i}"
        file_meta.ImplementationClassUID = "1.2.3.4"
        file_meta.TransferSyntaxUID = ExplicitVRLittleEndian

        filename = os.path.join(output_folder, f"slice_{i}.dcm")
        ds = FileDataset(filename, {}, file_meta=file_meta, preamble=b"\0" * 128)

        # Metadata
        ds.PatientName = "Aura^Elite^Patient"
        ds.PatientID = "AURA-ELITE-001"
        ds.Modality = "CT"
        ds.SeriesInstanceUID = "1.2.3.4.5.99"
        ds.StudyInstanceUID = "1.2.3.4.5.6.99"
        ds.SOPInstanceUID = f"1.2.3.4.5.6.7.{i}.99"
        ds.SOPClassUID = '1.2.840.10008.5.1.4.1.1.2'
        ds.SamplesPerPixel = 1
        ds.PhotometricInterpretation = "MONOCHROME2"
        ds.PixelRepresentation = 0
        ds.HighBit = 15
        ds.BitsStored = 16
        ds.BitsAllocated = 16
        ds.Columns = res
        ds.Rows = res
        ds.PixelSpacing = [0.5, 0.5] # Higher density
        ds.SliceThickness = 0.5
        ds.ImagePositionPatient = [0, 0, float(i * 0.5)]
        ds.ImageOrientationPatient = [1, 0, 0, 0, 1, 0]

        # 🧬 Create Smooth Anatomical Arch
        pixel_data = np.zeros((res, res), dtype=np.float32)
        y, x = np.ogrid[:res, :res]
        
        # Elliptical Jaw Arch
        center_x, center_y = res // 2, res // 2
        a, b = res // 4, res // 3 # Arch Radii
        
        # Outer ring
        val = (x - center_x)**2 / a**2 + (y - center_y)**2 / b**2
        mask = (val <= 1.0) & (val >= 0.8)
        
        # Only keep the "U" shape (half ellipse)
        mask = mask & (y >= center_y - res // 6)
        
        pixel_data[mask] = 1000
        
        # 🛡️ ZIRH: Gaussian Smoothing for "Elite" surfaces
        pixel_data = gaussian_filter(pixel_data, sigma=1.5)

        ds.PixelData = pixel_data.astype(np.uint16).tobytes()
        ds.save_as(filename)
        if i % 10 == 0: print(f"  -> Progress: {i}/{num_slices} slices...")

    print(f"DONE! Surgical Grade data ready at: {output_folder}")

if __name__ == "__main__":
    generate_surgical_grade_dicom()
