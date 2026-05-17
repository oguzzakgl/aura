import os
import uuid
import asyncio
from celery import Celery
from services.storage_service import storage_service
from services.yolo_dental_service import yolo_dental_service
from services.consensus_engine import merge_findings
from services.gemini_service import gemini_service

# P1-2: Celery configuration with Redis broker
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "analysis_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    # CBCT Timeout - 5 minutes
    task_soft_time_limit=300,
    task_time_limit=330
)

def run_analysis_core(self, scan_url: str, session_id: str):
    """
    P1-2: Asenkron Analiz İşçisi (Worker).
    OOM Koruması: Büyük dosyaları arka planda, HTTP isteğini bloklamadan işler.
    """
    temp_dir = os.path.join(os.getcwd(), ".tmp_scans")
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"{uuid.uuid4().hex}.bin")
    
    try:
        # 1. Download from secure storage
        self.update_state(state='PROGRESS', meta={'step': 'Downloading file...'})
        local_file = storage_service.download_file(scan_url, temp_path)
        
        # 1b. P1-1 & Özellik 5: Adım 0 Diyagnostik Kalite Kontrolü (Kaçış Kapısı)
        self.update_state(state='PROGRESS', meta={'step': 'Verifying radiograph diagnostic quality...'})
        from services.preprocessing import DicomPreprocessor
        from PIL import Image
        import numpy as np
        
        try:
            # Görüntüyü PIL ile güvenli bir şekilde oku
            with Image.open(local_file) as img:
                img_np = np.array(img.convert('L')) / 255.0 # [0,1] aralığına normalize et
                preprocessor = DicomPreprocessor()
                quality_check = preprocessor.validate_quality(img_np)
                
                if not quality_check.get("is_valid"):
                    print(f"[QUALITY RED]: Rejecting scan. Reason: {quality_check.get('reason')}")
                    # Celery durumunu FAILURE olarak işaretlemek için exception fırlatıyoruz
                    raise Exception(f"Diyagnostik Kalite Kontrolü Reddi: {quality_check.get('reason')}")
        except Exception as q_err:
            if "Diyagnostik Kalite Kontrolü Reddi" in str(q_err):
                # Orijinal dosyayı sil
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                raise q_err
            # Eğer DICOM (.dcm) ise PIL doğrudan okuyamaz, bu durumda şimdilik testi pas geç
            print(f"[QUALITY WARN]: Scan format not supported by PIL blur check. Skipping control: {q_err}")
            pass
        
        # 2. Run YOLO
        self.update_state(state='PROGRESS', meta={'step': 'Running YOLO detection...'})
        yolo_findings = yolo_dental_service.detect(local_file)
        
        # 3. Run Gemini (We need to run the async function in sync context since Celery is sync here)
        self.update_state(state='PROGRESS', meta={'step': 'Running Expert Gemini analysis...'})
        
        # Helper to run async in celery (and nest-asyncio for FastAPI fallback)
        def run_async(coro):
            import nest_asyncio
            nest_asyncio.apply()
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            return loop.run_until_complete(coro)
            
        gemini_text = run_async(gemini_service.analyze_radiograph(local_file))
        
        # Extract JSON from Gemini
        import json
        import re
        gemini_findings = []
        gemini_report = gemini_text
        
        json_match = re.search(r'```json\s*(\[.*?\])\s*```', gemini_text, re.DOTALL)
        if json_match:
            try:
                gemini_findings = json.loads(json_match.group(1))
                gemini_report = gemini_text[:json_match.start()].strip()
            except json.JSONDecodeError:
                pass

        # 4. Run Specialist Agents Orchestrator
        self.update_state(state='PROGRESS', meta={'step': 'Running Specialist Clinical Agents...'})
        from agents.orchestrator import AuraOrchestrator
        orchestrator = AuraOrchestrator()
        
        scan_data = {
            "yolo_findings": yolo_findings,
            "gemini_findings": gemini_findings,
            "gemini_report": gemini_report
        }
        agent_findings = run_async(orchestrator.consult(scan_data))

        # 5. Consensus & Merge Agent Findings
        consensus_findings = merge_findings(yolo_findings, gemini_findings)
        
        # Ajanların kararlarını konsensüse ekle (Eğer zaten yoksa veya ek bilgi sunuyorsa)
        for af in agent_findings:
            # Aynı dişte aynı patolojinin konsensüste olup olmadığını kontrol et
            exists = any(
                str(cf.get("tooth_id")) == str(af.get("tooth_id")) and 
                cf.get("pathology") == af.get("pathology")
                for cf in consensus_findings
            )
            if not exists:
                consensus_findings.append({
                    "tooth_id": af.get("tooth_id"),
                    "pathology": af.get("pathology", "periodontitis"),
                    "severity": af.get("severity", "Orta"),
                    "consensus": "Onaylı" if af.get("confidence", 0) > 0.90 else "Muhtemel",
                    "confidence": round(af.get("confidence", 0.88), 2),
                    "engines": af.get("agent", "Specialist Agent"),
                    "description": af.get("description", "Ajan Klinik Değerlendirmesi")
                })
        
        # Güvene göre yeniden sırala
        consensus_findings.sort(key=lambda x: x.get("confidence", 0), reverse=True)

        # 6. Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        return {
            "status": "COMPLETED",
            "yolo_findings": yolo_findings,
            "gemini_report": gemini_report,
            "consensus_findings": consensus_findings
        }
        
    except Exception as exc:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        # P1-2: Retry mechanism for transient errors (Celery bind control)
        if self is not None and hasattr(self, 'retry'):
            raise self.retry(exc=exc)
        raise exc

@celery_app.task(bind=True, max_retries=2, default_retry_delay=30)
def run_analysis(self, scan_url: str, session_id: str):
    """
    🛡️ Celery Task Sarmalayıcı.
    Asenkron kuyrukta asıl core fonksiyonu tetikler.
    """
    return run_analysis_core(self, scan_url, session_id)
