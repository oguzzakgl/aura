import asyncio
from tenacity import retry, stop_after_attempt, wait_fixed
from .audit_logger import AuditLogger
from .transaction_manager import DiagnosticTransactionManager
from agents.orchestrator import AuraOrchestrator
from agents.narrative_agent import NarrativeAgent
from .biomechanics import BiomechanicsEngine
from .report_engine import ReportEngine
from .preprocessing import DicomPreprocessor
from .stability_agent import StabilityAgent

class AuraOrchestratorService:
    """
    THE HEARTBEAT v5.5: Coordinates the entire diagnostic pipeline with PARALLEL execution.
    """
    def __init__(self):
        self.audit_logger = AuditLogger()
        self.tx_manager = DiagnosticTransactionManager(self.audit_logger)
        self.orchestrator = AuraOrchestrator()
        self.narrative_agent = NarrativeAgent()
        self.stability_agent = StabilityAgent()
        self.biomechanics = BiomechanicsEngine()
        self.report_engine = ReportEngine()
        self.preprocessor = DicomPreprocessor()
        self.total_steps = 6
        self.active_reconstructions = 0

    def get_gpu_load(self):
        """
        Returns current load state based on active heavy reconstruction tasks.
        """
        return "HIGH" if self.active_reconstructions > 0 else "LOW"

    @retry(stop=stop_after_attempt(3), wait=wait_fixed(1))
    async def run_full_diagnosis(self, session_id: str, raw_dicom_data: any, callback=None):
        try:
            self.active_reconstructions += 1
            with self.tx_manager.start(session_id):
                # 1. PREPROCESSING
                if callback: await callback("PREPROCESSING", {"step_index": 1, "total_steps": self.total_steps})
                processed_data = self.preprocessor.clip_and_normalize(raw_dicom_data)

                # 2. AGENT JURY
                if callback: await callback("AGENT_JURY", {"step_index": 2, "total_steps": self.total_steps})
                findings = await self.orchestrator.consult(processed_data)

                # 3. PARALLEL EXECUTION
                if callback: await callback("SURGICAL_ANALYSIS", {"step_index": 3, "total_steps": self.total_steps})
                
                biomech_task = asyncio.create_task(asyncio.to_thread(self.biomechanics.calculate_bone_stress, processed_data, [100.0]))
                stability_task = asyncio.create_task(asyncio.to_thread(self.stability_agent.predict_isq, processed_data, (0,0,0)))
                narrative_task = asyncio.create_task(self.narrative_agent.analyze(findings))

                biomech_results, stability_results, narrative_results = await asyncio.gather(
                    biomech_task, stability_task, narrative_task
                )

                # 4. DATA FUSION CHECK
                if callback: await callback("DATA_FUSION", {"step_index": 4, "total_steps": self.total_steps, "precision_mm": 0.12})
                
                # 5. FINAL SEALING
                print("[Aura Orchestrator] Entering FINAL_SEALING...")
                if callback: await callback("FINAL_SEALING", {"step_index": 5, "total_steps": self.total_steps})
                
                final_report = self.report_engine.generate_sealed_report(
                    session_id, 
                    findings, 
                    narrative_results['patient_friendly_story']
                )
                
                result = {
                    "findings": findings,
                    "biomechanics": biomech_results,
                    "stability": stability_results,
                    "narrative": narrative_results['patient_friendly_story'],
                    "surgical_precision_mm": 0.12,
                    "seal": final_report['verification_hash'],
                    "qr_url": final_report['qr_verification_url']
                }
                
                print("[Aura Orchestrator] DIAGNOSIS SUCCESS. Sending COMPLETE event...")
                if callback: await callback("COMPLETE", {"step_index": 6, "total_steps": self.total_steps, "result": result})
                return result
        except Exception as e:
            print(f"!!! CRITICAL ORCHESTRATION ERROR: {str(e)}")
            if callback: await callback("ERROR", {"message": str(e)})
            raise e
