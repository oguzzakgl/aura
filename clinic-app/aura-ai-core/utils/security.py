import hashlib
import pydicom
import os
import json
import shutil
from datetime import datetime

class AuraSecuritySentinel:
    """
    @sec (Security Sentinel) - Armored Version v6.5
    Handles PII Scrubbing, SHA-256 Hash Chaining, and Data Integrity.
    """
    
    @staticmethod
    def scrub_pii(dicom_path: str, output_path: str):
        """
        Removes sensitive patient information from DICOM metadata.
        Uses force=True to handle non-standard medical files.
        """
        try:
            # 🛡️ ZIRH: force=True ile header'ı bozuk dosyaları kurtar
            ds = pydicom.dcmread(dicom_path, force=True)
            
            # P1 Security: Critical fields to wipe
            tags_to_scrub = [
                'PatientName', 'PatientID', 'PatientBirthDate', 
                'PatientSex', 'PatientAddress', 'InstitutionName',
                'ReferringPhysicianName'
            ]
            
            for tag in tags_to_scrub:
                if tag in ds:
                    try:
                        ds.data_element(tag).value = "AURA_MASKED"
                    except:
                        continue # Bazı taglar değiştirilemezse atla
            
            # File Meta Information zırhı (Eksikse ekle)
            if not hasattr(ds, 'file_meta'):
                ds.file_meta = pydicom.dataset.FileMetaDataset()
                
            ds.save_as(output_path)
            return True
        except Exception as e:
            # 🛡️ ZIRH: Eğer dosya bir DICOM değilse (örn. .txt, .DS_Store), 
            # hata fırlatmak yerine pas geç veya güvenli bir şekilde kopyala
            print(f"@sec Sentinel Alert: Non-DICOM file detected in scrub process: {dicom_path}. Error: {str(e)}")
            shutil.copy(dicom_path, output_path)
            return False

    @staticmethod
    def generate_hash_chain(data: dict, previous_hash: str = "AURA_GENESIS") -> str:
        """
        Generates a SHA-256 hash for the current data block, linked to previous state.
        """
        block = {
            "timestamp": datetime.utcnow().isoformat(),
            "data": data,
            "previous_hash": previous_hash
        }
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

security_sentinel = AuraSecuritySentinel()
