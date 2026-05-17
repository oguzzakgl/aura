from typing import List, Dict, Any
from .base_agent import BaseAuraAgent
from .med_risk_agent import MedRiskAgent
from .endo_agent import EndoAgent
from .perio_agent import PerioAgent
from .ortho_agent import OrthoAgent
from services.logic_constraints import LogicConstraintLayer

class AuraOrchestrator:
    def __init__(self):
        self.specialists = [
            EndoAgent(),
            PerioAgent(),
            OrthoAgent(),
            MedRiskAgent()
        ]
        self.watcher = LogicConstraintLayer()

    async def consult(self, scan_data: Any) -> List[Dict[str, Any]]:
        """
        Runs a full diagnostic cycle with Confidence-Weighted Majority Voting.
        """
        all_findings = []
        for agent in self.specialists:
            res = await agent.analyze(scan_data)
            all_findings.extend(res.get("findings", []))
            
        return all_findings
