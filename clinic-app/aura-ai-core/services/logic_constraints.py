from typing import List, Dict, Any

class LogicConstraintLayer:
    """
    WATCHER LAYER: Prevents medical hallucinations and logical contradictions.
    """
    @staticmethod
    def validate_diagnoses(patient_status: Dict[int, str], new_findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        validated_findings = []
        
        for finding in new_findings:
            tooth_id = finding.get("tooth_id")
            current_status = patient_status.get(tooth_id, "healthy")
            
            # RULE 1: Cannot diagnose treatment on a MISSING tooth
            if current_status == "missing":
                print(f"[WATCHER] REJECTED: Logic contradiction on Tooth {tooth_id} (Missing tooth cannot have decay/abscess).")
                continue
            
            # RULE 2: Overlapping diagnoses check (In production, more complex rules)
            # ...
            
            validated_findings.append(finding)
            
        return validated_findings
