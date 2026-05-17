import os
import jwt
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any

security = HTTPBearer(auto_error=False)

# P1 Security: Fallback for development, but in prod this must come from env.
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-fallback-key-change-in-prod")
JWT_ALGORITHM = "HS256"

async def get_current_doctor(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    """
    JWT tabanlı hekim yetki kontrolü.
    Token'ı doğrular ve hekim bilgilerini döndürür.
    Eğer token yoksa, lokal geliştirme için Mock doktor döner.
    """
    if not credentials:
        # P1 Security: Production'da burası kesinlikle hata fırlatmalı!
        print("[SEC WARN] No JWT provided. Using Mock Doctor fallback for local dev.")
        return {"doctor_id": "mock-doctor-id", "tenant_id": "tenant-1", "role": "admin"}
        
    token = credentials.credentials
    try:
        # P1 Security: JWT Validation
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        doctor_id: str = payload.get("sub")
        tenant_id: str = payload.get("tenant_id")
        
        if doctor_id is None or tenant_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials: Missing claims")
            
        return {"doctor_id": doctor_id, "tenant_id": tenant_id, "role": payload.get("role", "doctor")}
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


def verify_tenant_access(doctor: Dict[str, Any], request_tenant_id: str) -> None:
    """
    IDOR Koruması: Hekimin talep ettiği kaynağın (patient/analysis),
    kendi tenant'ı ile eşleşip eşleşmediğini kontrol eder.
    """
    if str(doctor.get("tenant_id")) != str(request_tenant_id):
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: Multi-Tenant Isolation Violation. You cannot access resources from another clinic."
        )
