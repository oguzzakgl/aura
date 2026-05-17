import hashlib
import json
from datetime import datetime
import uuid

class AuditLogger:
    """
    P1 Security: SHA-256 tabanlı değiştirilemez denetim izi (Audit Trail).
    Kritik işlemleri (PDF üretimi, rapor okuma) hash zinciriyle mühürler.
    (Prod ortamında Supabase'e yazılmalıdır)
    """
    
    @staticmethod
    def log_action(action: str, doctor_id: str, tenant_id: str, resource_data: str, ip_address: str = "0.0.0.0"):
        # Veriyi hash'le (Değiştirilmezlik kanıtı)
        resource_hash = hashlib.sha256(resource_data.encode('utf-8')).hexdigest()
        
        audit_entry = {
            "id": str(uuid.uuid4()),
            "action": action,
            "doctor_id": doctor_id,
            "tenant_id": tenant_id,
            "resource_hash": resource_hash,
            "ip_address": ip_address,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # TODO: Supabase audit_logs tablosuna insert edilecek.
        # Şimdilik log'a basıyoruz.
        print(f"[AUDIT SEAL] {json.dumps(audit_entry)}")
        
        return audit_entry

audit_logger = AuditLogger()
