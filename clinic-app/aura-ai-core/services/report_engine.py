import hashlib
import json
import time
import qrcode
from typing import Dict, Any, List

class ReportEngine:
    """
    CLINICAL EVIDENCE ENGINE: Generates audit-ready, sealed diagnostic manifests.
    Now includes QR Code for authenticity verification.
    """
    def __init__(self, base_verify_url: str = "https://aura.clinic/verify/"):
        self.base_url = base_verify_url

    def generate_sealed_report(self, session_id: str, findings: List[Dict[str, Any]], narrative: str) -> Dict[str, Any]:
        """
        Creates a final clinical manifest and seals it with SHA-256.
        """
        timestamp = time.time()
        
        report_payload = {
            "session_id": session_id,
            "findings": findings,
            "narrative": narrative,
            "generated_at": timestamp,
            "integrity_version": "Aura-v5.1"
        }
        
        # Calculate Verification Hash (The Seal)
        report_string = json.dumps(report_payload, sort_keys=True).encode()
        verification_hash = hashlib.sha256(report_string).hexdigest()
        
        # Generate Verification QR Code
        qr_url = f"{self.base_url}{verification_hash}"
        # In production, we'd save the QR image. Here we return the URL for the frontend to render.
        
        return {
            "report_id": f"REP-{session_id}-{int(timestamp)}",
            "payload": report_payload,
            "verification_hash": verification_hash,
            "audit_trail_hash": verification_hash,
            "qr_verification_url": qr_url,
            "status": "SEALED_AND_LOCKED"
        }
