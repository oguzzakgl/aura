# Antigravity Proje Manifestosu: Aura (AI Diş Kliniği) Rescue Operasyonu

## 1. Ajan ve Dosya Atamaları (Antigravity'e Operasyonel Direktifler)
Antigravity, mevcut `dentist/clinic-app` projesindeki yapay zeka performans düşüklüğü ve asenkron kilitlenmeleri çözmek için aşağıdaki klasör kurallarını kullan:

- **AI ve Vision Katmanı (Faz 1 - Acil):** `06-ai-ml-pipeline` klasöründeki kuralları okuyarak, FastAPI ve Celery altyapısındaki "Event loop" ve "Timeout" hatalarını temizle. Gemini Vision API isabet oranını artırmak için görüntü işleme pipeline'ını (Örn: Tiling/Ensembling) yeniden kurgula.
- **Web & Yetkilendirme (Faz 2):** `03-full-stack/role_database_expert.md` kurallarını okuyarak, randevu sistemine (Double Booking iptali) ve çoklu doktor yetkilendirmesine (Supabase RLS) müdahale et.
- **Test & Stabilite (Faz 3):** `17-qa-testing-automation` ajanının kurallarıyla E2E testlerini (Yükleme barı failover testi) yaz.

## 2. Red-Flag Rules (Kırmızı Çizgiler)
- Celery worker'ları asla FastAPI event loop'unu bloklayamaz (Asenkron mimaride kilitlenme olursa kodu reject et).
- Gemini API çökerse veya yavaş cevap verirse, Local YOLO modeline geçiş maksimum 500ms içinde gerçekleşmelidir (Graceful Degradation).

**Antigravity'e Talimat:** Yukarıdaki direktifleri "Single Source of Truth" olarak kabul et ve `dentist/clinic-app` içindeki Python ve Next.js kodlarını bu mimari kaliteye göre onarmaya başla.
