import numpy as np
import pydicom
import os
from skimage import measure
import trimesh
from typing import List, Tuple

class AuraReconstructionEngine:
    """
    @be (The Engine) - Armored Version v6.5
    Handles Volumetric Reconstruction with Enhanced Security & Resilience.
    """
    
    def __init__(self, subsampling_rate: int = 2):
        self.subsampling_rate = subsampling_rate

    def load_dicom_stack(self, folder_path: str) -> Tuple[np.ndarray, Tuple[float, float, float]]:
        """
        Stacks DICOM slices and applies HU (Hounsfield Unit) calibration with dynamic spacing detection.
        """
        slices = []
        
        # Dosya listesini al ve Sentinel denetiminden geçir
        files = [f for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
        
        for f in files:
            if f.startswith('.') or f.endswith('.txt'):
                continue # .DS_Store veya meta dosyaları atla
                
            file_path = os.path.join(folder_path, f)
            try:
                # 🛡️ ZIRH 1: force=True ile standart dışı DICOM'ları kurtar
                ds = pydicom.dcmread(file_path, force=True)
                
                # 🛡️ ZIRH 2: Sadece pixel verisi olan ve anlamlı DICOM'ları al
                if hasattr(ds, 'pixel_array') and "PixelData" in ds and hasattr(ds, 'ImagePositionPatient'):
                    slices.append(ds)
            except Exception as e:
                print(f"@sec Sentinel Alert: Skipping corrupted or non-DICOM file {f}. Error: {str(e)}")
                continue 
        
        if len(slices) < 2:
            raise ValueError("A.R.E. Error: Yetersiz veya geçersiz DICOM verisi. En az 2 kesit gereklidir.")
            
        # Kesitleri Z-eksenine (derinlik) göre sırala
        slices.sort(key=lambda x: float(x.ImagePositionPatient[2]))
        
        # 🛡️ ZIRH 3: Dinamik Spacing Hesaplama
        # Bazı cihazlarda SliceThickness eksik olabilir, farktan hesapla
        try:
            slice_thickness = np.abs(slices[0].ImagePositionPatient[2] - slices[1].ImagePositionPatient[2])
        except (IndexError, AttributeError, ZeroDivisionError):
            slice_thickness = getattr(slices[0], 'SliceThickness', 1.0)

        pixel_spacing = (
            float(slices[0].PixelSpacing[0]) * self.subsampling_rate,
            float(slices[0].PixelSpacing[1]) * self.subsampling_rate,
            float(slice_thickness)
        )
        
        # 3D Matrix İnşası
        volume = np.stack([s.pixel_array for s in slices])
        
        # P3 Performance: Voxel Subsampling
        volume = volume[:, ::self.subsampling_rate, ::self.subsampling_rate]
        
        # HU Calibration
        slope = getattr(slices[0], 'RescaleSlope', 1)
        intercept = getattr(slices[0], 'RescaleIntercept', 0)
        volume = (volume.astype(np.float32) * slope) + intercept
        
        return volume, pixel_spacing

    def generate_mesh(self, volume: np.ndarray, spacing: Tuple[float, float, float], threshold: int = 500) -> str:
        """
        Generates a 3D Mesh from volume with repair and optimization protocols.
        """
        # Marching Cubes
        verts, faces, normals, values = measure.marching_cubes(volume, level=threshold, spacing=spacing)
        
        mesh = trimesh.Trimesh(vertices=verts, faces=faces, vertex_normals=normals)
        
        # 🛡️ ZIRH 4: Mesh Repair (Delikleri kapat ve normalleri düzelt)
        mesh.fill_holes()
        mesh.fix_normals()
        
        # P3 Performance: Decimation (Dental detay için 80k idealdir)
        if len(mesh.faces) > 80000:
            mesh = mesh.simplify_quadratic_decimation(80000)
            
        output_path = os.path.join("temp", "reconstruction_output.glb")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        mesh.export(output_path, file_type='glb')
        
        return output_path

    def get_slices_from_image(self, image_path: str) -> dict:
        """
        Özellik 7: 3 Yönlü CBCT Dilimleyici (Slicing Engine).
        Yüklenen 2D görüntüyü (veya DICOM'u) simüle 2.5D derinlik hacmine dönüştürür.
        Aksiyel, Sagittal ve Koronal kesit dizileri (Base64) üretir.
        """
        from PIL import Image
        import io
        import base64
        
        try:
            # Görüntüyü oku ve normalize et
            with Image.open(image_path) as img:
                img_gray = img.convert('L')
                img_np = np.array(img_gray.resize((256, 256))) / 255.0
                
            # 2.5D Hacim Oluştur (Derinlik gradyanı ile 64 katmanlı 3D hacim simülasyonu)
            # Bu sayede hekim 3D tomografi gibi 3 eksende dilimleme yapabilir!
            depth = 64
            volume = np.zeros((depth, 256, 256), dtype=np.float32)
            
            for d in range(depth):
                # Derinliğe göre kemik ve doku yoğunluğunu simüle et (Gaussian falloff)
                factor = np.exp(-((d - depth/2) ** 2) / (2 * (depth/6) ** 2))
                volume[d, :, :] = img_np * factor
                
            # Kesitleri Base64 olarak paketle (Aksiyel, Sagittal, Koronal)
            def to_base64_png(slice_data: np.ndarray) -> str:
                # [0,1] -> [0,255]
                slice_uint8 = (slice_data * 255).astype(np.uint8)
                img_slice = Image.fromarray(slice_uint8)
                buffered = io.BytesIO()
                img_slice.save(buffered, format="PNG")
                return base64.b64encode(buffered.getvalue()).decode('utf-8')

            axial_slices = []
            sagittal_slices = []
            coronal_slices = []
            
            # 16 dilim oluştur (Arayüz performansı için optimize edilmiş sayı)
            step_z = max(1, depth // 16)
            step_xy = max(1, 256 // 16)
            
            for i in range(16):
                z_idx = min(depth - 1, i * step_z)
                xy_idx = min(255, i * step_xy)
                
                axial_slices.append(to_base64_png(volume[z_idx, :, :]))
                sagittal_slices.append(to_base64_png(volume[:, :, xy_idx]))
                coronal_slices.append(to_base64_png(volume[:, xy_idx, :]))
                
            return {
                "status": "SUCCESS",
                "dimensions": {"depth": depth, "height": 256, "width": 256},
                "axial": axial_slices,
                "sagittal": sagittal_slices,
                "coronal": coronal_slices
            }
            
        except Exception as e:
            print(f"[RECON Slicer Error]: {str(e)}")
            raise e

reconstruction_engine = AuraReconstructionEngine()
