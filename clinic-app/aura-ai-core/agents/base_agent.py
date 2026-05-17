from abc import ABC, abstractmethod
import hashlib
import time
from typing import Dict, Any

class BaseAuraAgent(ABC):
    def __init__(self, agent_id: str, specialty: str):
        self.agent_id = agent_id
        self.specialty = specialty
        self.confidence_threshold = 0.80 # 80% threshold for "Elite" accuracy

    @abstractmethod
    async def analyze(self, data: Any) -> Dict[str, Any]:
        """
        Main analysis method to be implemented by each specialist agent.
        """
        pass

    def seal_finding(self, finding: str) -> str:
        """
        ARMORED CORE: Seals a finding with a timestamped SHA-256 hash.
        """
        raw_data = f"{finding}-{time.time()}-{self.agent_id}"
        return hashlib.sha256(raw_data.encode()).hexdigest()

    def log_reasoning(self, step: str, result: str):
        """
        Logs the agent's reasoning process for clinical audit.
        """
        print(f"[{self.specialty.upper()} AGENT] Reasoning: {step} -> {result}")
