from .base_agent import BaseAuraAgent
from typing import Dict, Any, List

class NarrativeAgent(BaseAuraAgent):
    def __init__(self):
        super().__init__(agent_id="aura-narrative-01", specialty="Patient Communication")

    async def analyze(self, clinical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Translates technical clinical findings into a patient-friendly narrative.
        In production, this calls a local Llama-3 instance.
        """
        self.log_reasoning("Generating patient narrative", f"Translating {len(clinical_data)} findings.")
        
        # MOCK Llama-3 Output
        narrative = "Hello! Based on our AI-assisted scan, we've noticed some areas that need attention. "
        for finding in clinical_data:
            if finding.get("type") == "Bone Loss":
                narrative += f"Specifically, on tooth #{finding['tooth_id']}, there's a slight weakening of the bone structure ({finding['volume_mm3']}mm3). "
            elif finding.get("type") == "Abscess":
                narrative += f"We've also found an inflammatory sign at the root of tooth #{finding['tooth_id']}. "
        
        narrative += "Early intervention will help us preserve your natural smile!"
        
        return {
            "agent": self.specialty,
            "patient_friendly_story": narrative,
            "seal": self.seal_finding(narrative)
        }
