import os
from supabase import create_client, Client
from fastapi import HTTPException
import uuid

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project-id.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "your-anon-key")

class StorageService:
    def __init__(self):
        # Allow fallback for local development without keys
        if SUPABASE_URL != "https://your-project-id.supabase.co":
            self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        else:
            self.supabase = None
            print("[STORAGE WARN] Supabase credentials missing. Running in local mock mode.")

    def upload_file(self, file_path: str, bucket_name: str = "scans") -> str:
        """
        P1-2: OOM (Out of Memory) Koruması.
        Büyük dosyaları FastAPI hafızası yerine Supabase Storage'a atar.
        """
        if not self.supabase:
            import shutil
            mock_storage_dir = os.path.join(os.getcwd(), "mock_storage", bucket_name)
            os.makedirs(mock_storage_dir, exist_ok=True)
            mock_path = os.path.join(mock_storage_dir, f"{uuid.uuid4()}_{os.path.basename(file_path)}")
            shutil.copy2(file_path, mock_path)
            return mock_path
            
        file_name = f"{uuid.uuid4()}_{os.path.basename(file_path)}"
        
        with open(file_path, "rb") as f:
            res = self.supabase.storage.from_(bucket_name).upload(file_name, f)
            
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail="Storage upload failed")
            
        # Get secure URL
        url_res = self.supabase.storage.from_(bucket_name).create_signed_url(file_name, 86400) # 24 hours
        return url_res.get('signedURL')

    def download_file(self, file_url: str, dest_path: str) -> str:
        """
        Celery worker'ın dosyayı güvenle indirmesini sağlar.
        """
        if not self.supabase:
            import shutil
            if os.path.exists(file_url):
                shutil.copy2(file_url, dest_path)
            return dest_path
            
        import requests
        response = requests.get(file_url, stream=True)
        if response.status_code == 200:
            with open(dest_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            return dest_path
        else:
            raise Exception("Failed to download file from secure URL")

storage_service = StorageService()
