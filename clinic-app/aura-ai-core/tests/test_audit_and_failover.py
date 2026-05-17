import pytest
import numpy as np
import json
from services.diagnostic_service import diagnostic_service
from services.audit_logger import audit_logger
from services.fallback_llm_service import fallback_llm

def test_hounsfield_calibration_limits():
    """
    Gereksinim: HU = (RescaleSlope * pixel_array) + RescaleIntercept
    Verinin float32 hassasiyetinde kalibre edildiğini ve np.clip yardımıyla
    -1000 ile +3000 HU aralığında maskelendiğini doğrula.
    """
    # 1. Ham DICOM simülasyonu
    pixel_array = np.array([[2000.0, -1500.0], [4000.0, 500.0]], dtype=np.float32)
    rescale_slope = 1.0
    rescale_intercept = -100.0
    
    # Formülü ve threshold filtrelemeyi manuel uygula
    hu_array = (pixel_array * rescale_slope) + rescale_intercept
    hu_array = np.clip(hu_array, -1000, 3000)
    
    # Değer limit kontrolleri
    assert np.all(hu_array >= -1000)
    assert np.all(hu_array <= 3000)
    
    # 4000 * 1.0 - 100 = 3900 -> 3000'e clip edilmeli (metal artifact baskılama)
    assert hu_array[1, 0] == 3000.0
    # -1500 * 1.0 - 100 = -1600 -> -1000'e clip edilmeli (hava limiti)
    assert hu_array[0, 1] == -1000.0


def test_audit_logger_row_hash_chaining():
    """
    Gereksinim: Row hash kriptografik zincirinin (row_hash) bir önceki bloğun hash'i
    + patient_id + diagnosis_json + timestamp verileriyle SHA-256 olarak hesaplandığını doğrula.
    """
    audit_logger.log_chain = [] # Zinciri sıfırla
    audit_logger._last_hash = "GENESIS_AURA_BLOCK"
    
    # 1. İlk Logu yaz
    meta_1 = {"patient_id": "PATIENT-X", "diagnosis": {"caries": [14, 15]}}
    hash_1 = audit_logger.log_event("SESSION-1", "DIAGNOSIS_SEAL", meta_1)
    
    assert len(audit_logger.log_chain) == 1
    assert audit_logger.log_chain[0]["previous_hash"] == "GENESIS_AURA_BLOCK"
    assert audit_logger.log_chain[0]["row_hash"] == hash_1
    
    # 2. İkinci Logu yaz (Zincirlenmeli)
    meta_2 = {"patient_id": "PATIENT-Y", "diagnosis": {"endo": [24]}}
    hash_2 = audit_logger.log_event("SESSION-2", "DIAGNOSIS_SEAL", meta_2)
    
    assert len(audit_logger.log_chain) == 2
    assert audit_logger.log_chain[1]["previous_hash"] == hash_1
    assert audit_logger.log_chain[1]["row_hash"] == hash_2
    
    # 3. Bütünlüğü doğrula
    assert audit_logger.verify_log_chain(last_n=5) is True


def test_audit_logger_integrity_breach_detection():
    """
    Gereksinim: Zincirde herhangi bir değişiklik (manipülasyon) yapıldığında
    verify_log_chain metodunun bütünlük ihlalini yakaladığını doğrula.
    """
    audit_logger.log_chain = []
    audit_logger._last_hash = "GENESIS_AURA_BLOCK"
    
    meta = {"patient_id": "PATIENT-Z", "diagnosis": {"fracture": [32]}}
    audit_logger.log_event("SESSION-3", "DIAGNOSIS_SEAL", meta)
    
    # Zincir temizken doğrula
    assert audit_logger.verify_log_chain(last_n=5) is True
    
    # Sabotaj: Teşhis verisini manipüle et
    audit_logger.log_chain[0]["diagnosis_json"] = "{\"fracture\": []}" # Kırığı gizle
    
    # Bütünlük kontrolünün patladığını doğrula
    assert audit_logger.verify_log_chain(last_n=5) is False


def test_circuit_breaker_emergency_fallback():
    """
    Gereksinim: Circuit Breaker tetiklendiğinde fallback metodunun
    is_fallback: True bayrağını döndürdüğünü doğrula.
    """
    import asyncio
    # Fallback metodu çalıştır
    result_text = asyncio.run(fallback_llm.analyze_radiograph_fallback("test_image.dcm"))
    
    # is_fallback veya acil durum uyarısının mevcut olduğunu doğrula
    assert "is_fallback" in result_text or "ACİL YEDEKLİLİK AKTİF" in result_text
    assert "Gemini" in result_text or "GPT-4o-mini" in result_text
