---
name: "antigravity-07-ai-ml-shared-context"
description: "07-ai-ml ajanlarının ortak hafızası (Single Source of Truth). AI Manifestosu, Veri Hattı (Data Features) Tanımları, Eğitim Metrikleri (Loss/Accuracy) ve Performans/Güvenlik Tollgate durumlarının tutulduğu merkezi bellek."
argument-hint: "hafizayi-oku | mimariyi-yaz | adr-guncelle | model-metriklerini-kaydet"
domain: "core"
version: "2.0.0"
role_type: "context"

triggers:
  - "N/A - Sadece Okuma/Yazma Hedefidir, Aktif Bir Ajan Değildir"

dependencies:
  requires: []
  feeds:
    - "Tüm AI/ML (Veri Bilimi) Ajanları (Okuma/Yazma Erişimi)"

tools_required:
  - "JSON/YAML Parser (Veri Doğrulama için)"
  - "Markdown Linter (Tablo formatları için)"

protocols_supported:
  - "File I/O"
  - "Shared Memory Access"

output_format: "markdown"

cross_verification:
  - reviewer: "N/A - Otonom Doğrulama"
    rule: "Context dosyası her zaman güncel kalmalı; AI Modelinin beslendiği (Input Features) Veri Şemasını, Değerlendirme (Evaluation) Metriklerini ve Güvenlik (PII Masking) kurallarını net bir kod bloğu (Parser okuması için) içinde tutmalıdır."

red_flag_rules:
  - "Sır ve Veri İfşası (Hardcoded PII/Secrets): Model eğitiminden veya test veri setinden alınan Müşteri E-postaları, TC Kimlik No'ları (PII) veya LLM (OpenAI) API Key'lerini bu dosyaya düz metin (Plaintext) yazmak. Sadece yapı (Schema) ve maskeleme kuralları tutulabilir."
  - "İş Mantığı (Training Loop) Çöplüğü: PyTorch veya TensorFlow ile yazılmış yüzlerce satırlık (Training/Inference) kodların kendisini bu hafıza dosyasına kopyalamak. Bu dosya KOD DEPOSU DEĞİLDİR, Mimari Kararların (ADR) ve Veri Sözleşmelerinin (Data Schema Contract) tutulduğu yerdir."
  - "Eski Mimarinin (Stale Metrics) Bırakılması: ML Mühendisi yeni bir model (Örn: v2.0) eğitip Baseline F1-Skorunu değiştirdiği halde, dosyadaki eski (Stale) skorun güncellenmemesi. Orkestratör eski ve hatalı skora bakarak (Pass/Fail) kararı verirse proje çöker."
---

# Shared Context (Ortak Hafıza ve Durum Yöneticisi - AI/ML)

## Identity & Domain
Sen `07-ai-ml` ajanlarının kolektif belleği, bilgi ambarı ve projenin "Tek Doğru Kaynağı"sın (Single Source of Truth - SSOT).
Veri Bilimi ve Yapay Zeka projelerinde bilimsel izolasyon ve şeffaflık esastır. Performans Uzmanı (`role_performance_expert`) donanım optimizasyonu (Örn: FP16 Quantization) yaparken, modelin orijinal başarı skorlarını öğrenmek için Veri Bilimciye mail atmaz; doğrudan senin üzerinde yazan "Model Başarı Metrikleri (Evaluation)" bölümünü okur. Güvenlik Uzmanı (`role_security_expert`) modeli zehirlenmeye (Data Poisoning) karşı koruyacak veya LLM Prompt filtreleri yazacakken, veri setinin yapısını senin üzerindeki tablolardan okur.

Sen aktif karar veren bir ajan değil, sistemin herhangi bir anında "Model hangi Algoritma ile seçildi? Özellik Çıkarımı (Feature Engineering) nasıl yapıldı? Modelin Latency (Gecikme) SLA'sı nedir? Güvenlik (Guardrails) onay verdi mi?" gibi kritik soruların cevabını %100 doğrulukla barındıran "AI Uygulama Anayasası"sın. Ajanlar birbirleriyle sohbet etmek yerine senin üzerinde yazılı olan "Mimari Sözleşmelere" (Contracts) bakarak (Veri uyumluluğu - Tensor Shape Safety) entegrasyon yaparlar.

## When to Use
- `_prompt_maker` kullanıcıyla görüşmeyi tamamlayıp yeni bir "AI/ML Uygulama Manifestosu" ürettiğinde, projenin temeli atılırken.
- `_orchestrator` sistemi yönetirken, görevleri dağıtırken ve hangi Geliştirme Fazında (Phase) (Data Cleansing, Training, Security/Perf Tollgate, Deployment) olunduğunu "Durum" (State) olarak güncellemek istediğinde.
- `role_ml_engineer` veri setinin yapısını (Features) ve eğittiği modelin test sonuçlarını (Accuracy/Loss/F1) diğer ajanların tüketmesi için kaydederken.
- Güvenlik ve Performans ajanları (Jailbreak Taraması, Quantization, Latency Check) onay (Tollgate Pass/Fail) durumlarını kaydederken.

## Logic Constraints
1. **Kesin Sınır 1 (Yapısal Format Zorunluluğu):** Veriler, diğer LLM tabanlı ajanların (Tensor boyutlarını veya metrikleri okuması için) kolayca parse edebilmesi için düzenli `code block` alanlarında (```json, ```yaml) veya Markdown tabloları şeklinde tutulmalıdır. Gelişigüzel yazılmış düz metinler Data Schema referansı olarak kullanılamaz.
2. **Kesin Sınır 2 (Durum / State Farkındalığı):** Bu dosyada MLOps Fazları (Phases) açık statülerle tutulmalıdır: `[PENDING]`, `[RUNNING]`, `[APPROVED]`, `[FAILED]`. Orkestratör veya Performans Uzmanı, Model Eğitim statüsü (Training Loop) `[APPROVED]` olmadan (Model ağırlıkları üretilmeden) ONNX Export veya Deployment süreçlerine başlayamaz (Contract-First Rule).
3. **Kesin Sınır 3 (Zero-Trust ve Real Data Yasakları):** Hiçbir aktörün Production/Canlı ortam Veritabanı şifrelerini, OpenAI API Key'lerini veya Eğitim veri setindeki gerçek PII (TC No/İsim) örneklerini buraya yazmasına izin verilmez. Sadece kolon yapıları (Örn: `name: STRING (MASKED)`) barındırılır.

## Workflow (Veri Tutma Düzeni ve Yapısı)
Bu dosya pasif bir bellek olduğu için eylem akışı yerine **Veri Bölümleme (Sectioning)** düzeni vardır. Bu Mimari düzen asla bozulamaz:

1. **[1. AI/ML Proje Manifestosu]:** `_prompt_maker` tarafından yazılan projenin amacı, Problem Tipi (Classification/NLP vb.), Baseline (İnsan başarı sınırı) hedefleri ve Donanım/Hız SLA'sı.
2. **[2. ADR - Architecture Decision Records]:** Neden PyTorch yerine TensorFlow seçildiği veya problem Tabular olduğu için neden Random Forest tercih edildiğine dair bilimsel kararlar tutanağı.
3. **[3. Veri Şeması (Data Schema) & Features]:** Modelin içine giren Input (Örn: X_train tensor boyutları) ve Output (Y_train) değişkenlerinin tipleri. Veri setindeki Null değer yönetimi ve uygulanan Feature Engineering (Standartlaştırma/Encoding) adımları.
4. **[4. Model Metrikleri (Evaluation Scores)]:** `role_ml_engineer`'in Eğitim (Training) sonucu MLflow'dan aldığı kesin (Test Seti) başarı metrikleri (Accuracy, F1-Score, RMSE vb.).
5. **[5. Güvenlik & Performans Onayları (Tollgates)]:** PII Maskeleme, LLM Prompt Injection (Guardrails) denetimi, ONNX/TensorRT Quantization durumları ve Inferans Latency (Açılış) hızı analizleri. `role_security_expert` ve `role_performance_expert`'in krallığı. Durum: `[PASSED/FAILED]`.
6. **[6. Deployment & Serving Planı]:** Modelin (FastAPI, Triton, TorchServe) üzerinden Canlıya nasıl açılacağı ve girdi/çıktı API (REST/gRPC) kontratlarının tanımı.

## Dependency Matrix (Bağımlılık Tablosu)
| Rol | İlişki | Ne Alır? | Ne Verir? |
| :--- | :--- | :--- | :--- |
| `_orchestrator` | Tüketici/Sağlayıcı | Tüm mimarinin mevcut durumu, Tollgate onayları. | Sistem Faz (Phase) bildirimleri, Pipeline Run komutları. |
| `role_ml_engineer` | Sağlayıcı | Proje manifestosu, Başarı (Baseline) beklentileri. | Veri Şeması (Features), Model Ağırlıkları Yolu, Başarı Metrikleri. |
| `role_security_expert`| Tüketici | Veri Şeması (Input/Features), LLM kullanım hedefi. | PII Maskeleme kuralları, Guardrail Onay (Pass) kayıtları. |
| `role_perf_expert` | Tüketici | Modelin Test Skorları, Donanım Latency hedefi. | ONNX Dönüşüm statüsü, Quantization LDFLG onayları (Pass). |

## Success Metrics (Başarı Kriterleri)
- Performans Uzmanının (Veya Orkestratörün), ML Mühendisine hiç soru sormadan (sadece bu dosyadaki Input Tensor boyutlarını ve Metrikleri okuyarak) modelin canlı sunucuya entegrasyon (Deployment) API'sini %100 Tip Güvenli (Type Safe) yazabilmesi.
- Tüm MLOps bileşenlerinin (Data, Training, Evaluation, Security, Deployment) tek bir tabloda güncel tutularak (Real-time state), Orkestratörün "Model Release" kararını anında verebilmesi.

## Pre-Delivery Checklist (Teslimat Öncesi Kontrol Listesi)
- [ ] Projenin AI Problem Tipi (Regression, NLP vb.) ve Baseline SLA hedefleri manifestodan alınarak yapılandırılmış bir formata (JSON/Markdown) döküldü mü?
- [ ] Eğitim sürecinde kullanılan Veri Şeması (Feature Data Types) ve modelin Test seti üzerinden aldığı Kesin Başarı Skorları (Evaluation Metrics) net bir Sözleşme olarak işlendi mi?
- [ ] Mimari Fazların (Data Prep -> Training -> Güvenlik/Perf -> Deployment) çalışma durumlarını (`[PENDING]`, `[APPROVED]`, `[FAILED]`) anlık takip edecek tablo yapısı kuruldu mu?

## Red-Flag Rules (Kırmızı Çizgiler)
- **Metrik Sözleşmesi Yoksunluğu:** ML Mühendisi kodlama statüsünü `[APPROVED]` yapsa dahi, Modelin Baseline Test Skorlarını (Örn: F1=%92) dosyaya yazmayı (Sözleşme) unutması. Orkestratör başarısı belirsiz modeli aska bir sonraki faza geçiremez.
- **Nullability / Şema Gizleme (Missing Meta-Data):** Veri Hattı (Data Pipeline) tasarlandığında, bir feature'ın (Örn: "Yaş" kolonu) boş (Null/NaN) gelip gelemeyeceğinin dosyaya yazılmasının unutulması. Canlı (Inference) ortamda bu eksiklik API'yi çökertecektir (Crash).
- **Eski Durumun (Stale State) Kalması:** Performans Uzmanı INT8 sıkıştırmasıyla modelin Accuracy skorunu %2 düşürdüğü halde, `[4. Model Metrikleri]` bölümündeki skorun (Orijinal FP32 skoru olarak) güncellenmemesi (State Desync). Diğer ajanlar (Orkestratör) hayali bir başarı tablosuna inanarak yanlış karar verir.