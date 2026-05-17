import hashlib
import json
import time
from typing import Dict, Any, List, Optional

class AuditLogger:
    """
    ELITE AUDIT TRAIL: Implements an internal blockchain-like structure for diagnostic logs.
    Every log entry contains the hash of the previous entry to prevent silent deletion or tampering.
    Uses precise cryptographic hashing of (previous_hash + patient_id + diagnosis_json + timestamp).
    """
    def __init__(self):
        self.log_chain: List[Dict[str, Any]] = []
        self._last_hash: str = "GENESIS_AURA_BLOCK"

    def log_event(self, session_id: str, event_type: str, metadata: Dict[str, Any], is_gap: bool = False) -> str:
        """
        Logs a new event and links it to the previous one via SHA-256.
        Calculates row_hash using previous_hash + patient_id + diagnosis_json + timestamp.
        """
        timestamp = time.time()
        patient_id = metadata.get("patient_id", "ANONYMOUS_PATIENT")
        diagnosis_json = json.dumps(metadata.get("diagnosis", {}), sort_keys=True)
        
        payload = {
            "session_id": session_id,
            "event_type": event_type,
            "is_gap": is_gap,
            "patient_id": patient_id,
            "diagnosis_json": diagnosis_json,
            "timestamp": timestamp,
            "previous_hash": self._last_hash
        }
        
        # Calculate Row Hash precisely as specified in strict audit requirements
        raw_string = f"{self._last_hash}{patient_id}{diagnosis_json}{timestamp}"
        current_hash = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()
        
        payload["row_hash"] = current_hash
        self.log_chain.append(payload)
        
        # Update pointer for next block
        self._last_hash = current_hash
        
        print(f"[AuditLogger] Sealed Event: {event_type} | Row Hash: {current_hash[:8]}...")
        return current_hash

    def log_rollback(self, session_id: str, reason: str):
        """
        Creates a 'Gap Log' when a transaction fails, ensuring the chain remains unbroken.
        """
        self.log_event(
            session_id=session_id,
            event_type="TRANSACTION_ROLLBACK_GAP",
            metadata={"reason": reason, "status": "INTEGRITY_PRESERVED"},
            is_gap=True
        )

    def verify_log_chain(self, last_n: Optional[int] = 20, checkpoint_hash: Optional[str] = None) -> bool:
        """
        @perf & @sec: Checkpoint-based log chain integrity check.
        Instead of full table scans, it verifies the last N logs against the checkpoint block
        protecting p95 response time targets and avoiding CPU overhead.
        """
        if not self.log_chain:
            return True
            
        total_logs = len(self.log_chain)
        start_idx = max(0, total_logs - last_n) if last_n else 0
        
        print(f"[AuditLogger] Integrity check started. Verifying index range [{start_idx} to {total_logs-1}]")
        
        for idx in range(start_idx, total_logs):
            block = self.log_chain[idx]
            patient_id = block["patient_id"]
            diagnosis_json = block["diagnosis_json"]
            timestamp = block["timestamp"]
            prev_hash = block["previous_hash"]
            row_hash = block["row_hash"]
            
            # Re-calculate and check
            raw_string = f"{prev_hash}{patient_id}{diagnosis_json}{timestamp}"
            calculated_hash = hashlib.sha256(raw_string.encode('utf-8')).hexdigest()
            
            if calculated_hash != row_hash:
                print(f"[AuditLogger INTEGRITY BREACH DETECTED] Mismatch at index {idx}!")
                return False
                
            # Verify linkage unless it's the start of the verification chunk
            if idx > start_idx:
                expected_prev = self.log_chain[idx - 1]["row_hash"]
                if prev_hash != expected_prev:
                    print(f"[AuditLogger INTEGRITY BREACH DETECTED] Linkage broken at index {idx}!")
                    return False
            elif checkpoint_hash and prev_hash != checkpoint_hash:
                # If checkpoint is provided, verify first block is properly linked to the checkpoint
                print(f"[AuditLogger INTEGRITY BREACH DETECTED] Checkpoint linkage failed at start index {start_idx}!")
                return False
                
        print(f"[AuditLogger] Integrity check verified successfully for last {total_logs - start_idx} entries.")
        return True

    def get_audit_trail(self) -> List[Dict[str, Any]]:
        return self.log_chain

audit_logger = AuditLogger()
