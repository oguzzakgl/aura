---
name: "antigravity-06-ai-ml-pipeline-workflow-build"
description: "06-ai-ml-pipeline projesinin Manifesto -> Veri Hattı (Data) -> Model Eğitimi (Train) -> Optimizasyon -> Canlı API (Deployment) sırasıyla MLOps felsefesinde inşası için Kutsal Kronolojik Akış Şeması."
argument-hint: "akisi-oku | sırayi-takip-et | mlops-adimlari-kurgula"
domain: "core"
version: "2.0.0"
role_type: "workflow"

triggers:
  - "N/A - Orkestratör ve Ajanlar Tarafından Standart Olarak Okunur"

dependencies:
  requires: []
  feeds:
    - "_orchestrator"

tools_required:
  - "Mermaid.js (MLOps Akış Görselleştirme)"
  - "State Machine Logic"

protocols_supported:
  - "Sequential Execution (Sıralı İşletim)"
  - "Gating & Approval (Tollgates)"

output_format: "markdown+mermaid"

cross_verification:
  - reviewer: "N/A - Evrensel Kural Seti"
    rule: "Akış şemasında çıkmaz sokak (dead end), sonsuz döngü veya belirsiz durum barındırılamaz. MLOps geliştirme adımları, veri kalitesi ve model doğrulama kapılarına mutlak olarak dayanmalıdır."

red_flag_rules:
  - "Tersine Geliştirme (Model-First Fallacy): Veri Hattı (ETL/ELT) ve Feature Store dondurulmadan, Veri Kalitesi (Data Quality) testleri geçilmeden, AI Mimarının modeli eğitmeye başlaması (Garbage in, garbage out) kesinlikle reddedilir."
  - "Denetim Kapılarını Aşmak (Bypassing Tollgates): Güvenlik (Bias/Data Privacy) ve Performans (Inference Latency) uzmanlarının 'Pass' (Onay) vermediği bir modelin, sırf Accuracy skoru yüksek diye doğrudan Backend (Canlı API) fazına geçirilmesi sistemi çökertebilir."
  - "Arayüz (UI) Hedefler Koymak: Akışta herhangi bir yere 'Sonuç ekranı arayüzü çizimi', 'React componenti yapılması' gibi Frontend adımlarının sızması, AI/ML Pipeline vizyonuna tamamen aykırıdır."
---

# Workflow Build (Sistem İnşa Akışı ve Kronolojisi - AI/ML Pipeline)

## Identity & Domain
Bu dosya bir ajan değil, `_orchestrator`'ın ve sistemdeki tüm uzman ajanların `06-ai-ml-pipeline` (Veri ve Yapay Zeka Mimarisi) projelerini inşa ederken harfiyen ve tartışmasız takip edeceği **Kutsal Akış Şemasıdır** (Holy MLOps Pipeline).
Makine Öğrenimi projeleri standart yazılım (Software) geliştirmeye benzemez. Yazılım deterministiktir (A girersen B çıkar); ancak Yapay Zeka olasılıksaldır (Probabilistic). Modeller doğru kurgulanmazsa, sistem %99 başarı gösterdiğini zannederken aslında tamamen ezberlemiş (Overfitting) olabilir veya gizlice Data Leakage (Veri sızıntısı) yaşıyor olabilir. Bu belge, 15+ yıl deneyimli kurumsal bir MLOps ekibinin **"Data-Centric AI"** (Veri Odaklı Yapay Zeka) prensibine göre oluşturduğu, hata durumlarını (Retraining/Rollback) kapsayan katı bir çalışma kronolojisidir.

Bu akış, Veri mühendisinin verisi olmadan Modelcinin eğitmesini, Modelcinin modeli olmadan Backend uzmanının API açmasını engeller. Eşzamanlı çalışabilecekleri (Paralel) noktaları belirler, ve birbirlerinin işini beklemesi gereken (Bloklayıcı) kritik yolları (Critical Path) çizer. Hiçbir ajan, bu workflow'un adımlarını atlayamaz.

## Logic Constraints
1. **Kesin Sınır 1 (Sıralı İşletim - Data First):** Pipeline ilerleme yönü daima `Manifesto` -> `Data Pipeline (Temiz Veri)` -> `Model Training (Zeka)` -> `Inference API (Tüketim)` şeklinde akmak zorundadır. Veri (Data) temizlenip dondurulmadan, AI Mimarı eğitime (fit) başlayamaz.
2. **Kesin Sınır 2 (Onay Bariyerleri - Tollgates):** Model eğitiminden sonra ürün bir sonraki faza (Deployment) akmadan önce `role_security_expert` (Adversarial Robustness, Bias, PII kontrolü) ve `role_performance_expert` (Inference Latency, Quantization) onayından geçmek zorundadır. Bu kapılar aşılamaz.
3. **Kesin Sınır 3 (Hata ve Geri Dönüş Döngüsü - Retraining Loop):** Eğer bir onay bariyerinden "Fail" (Başarısız) yanıtı gelirse, süreç hatanın kaynağına geri döner. (Örn: AI Mimarı test setinde hedef metriği (Örn: Accuracy > 0.90) tutturamazsa, ya model algoritmasını değiştirmeli ya da Veri Mühendisinden yeni "Feature"lar istemelidir. Başarısız model asla bir sonraki faza geçemez).

## When to Use
- Uçtan uca (End-to-End) yeni bir Makine Öğrenimi projesinin (Day-Zero) sıfırdan oluşturulma sürecinde Orkestratörün yol haritası olarak.
- Canlıdaki (Production) bir modelde "Data Drift" (Verinin doğasının değişmesi) tespit edildiğinde sistemin hangi aşamadan (Veri hattı mı, yeniden eğitim mi) itibaren tetikleneceğini belirlemek için.
- Sistemde bir tıkanıklık (Örn: Backend'in API yanıt süresinin çok yavaşlaması) çıktığında, sürecin hangi katmanında (Model ağırlıkları mı, Feature Store hızı mı) dar boğaz olduğunu (Debugging) analiz etmek için.

## Workflow (Adım Adım Kutsal MLOps Akışı)

### Faz 1: Analiz ve Çerçeveleme (Problem Framing)
- **Adım 1.1:** `USER` iş fikrini beyan eder (Örn: 'Kanserli hücreyi resimden tespit et', 'Müşterinin satın alacağı ürünü öner').
- **Adım 1.2:** `_prompt_maker` kullanıcıyla iletişime geçer, UI/Arayüz beklentilerini keser, ML hedefini (Metrikleri ve Algoritma tipini) matematikselleştirerek **AI/ML Manifestosu**'nu `_shared_context.md`'ye kaydeder.
- **Adım 1.3:** `_orchestrator` manifestoyu okur, MLOps akış diyagramını (Data Lake -> Training -> API) belirler ve startı verir.

### Faz 2: Veri Boru Hattı (Data Pipeline & Feature Store - CRITICAL)
- **Adım 2.1:** `role_data_engineer` sahneye çıkar. Ham verileri çeker (Ingestion), temizler (Cleansing), özellik çıkarımı (Feature Engineering) yapar. Modele hazır veriyi Train/Test olarak böler ve Feature Store'a kaydeder.
- **Adım 2.2 [TOLLGATE]:** `role_security_expert` veri setindeki kişisel verilerin (PII) şifrelendiğini/maskelendiğini (Anonymization) doğrular. Veri kalitesi testleri (Null check, Data Leakage check) yapılır.
- *Eğer Fail:* Adım 2.1'e dönülür. *Eğer Pass:* Veri seti versiyonlanır (Data Versioning) ve Faz 3'e geçilir.

### Faz 3: Model Eğitimi (Model Training & Evaluation)
- **Adım 3.1:** `role_ai_ml_architect` kilitlenmiş Veri Setini (Feature Store) okur. Model mimarisini kurar (PyTorch/Scikit), Hiperparametreleri ayarlayarak (Tuning) modeli eğitir.
- **Adım 3.2:** Modelin başarı metrikleri (Accuracy, F1-Score, Loss vb.) hesaplanır ve MLflow gibi bir sisteme (Experiment Tracking) loglanır. En başarılı Model Registry'e kaydedilir.
- **Adım 3.3 [TOLLGATE]:** `role_security_expert` modelde Bias (Önyargı) olmadığını ve Adversarial saldırılara dayanıklı olduğunu test eder. `role_performance_expert` model boyutunu (MB/GB) ve Inference hızını (Latency) ölçer, gerekiyorsa Quantization (ONNX) uygular.
- *Eğer Fail:* Adım 3.1'e dönülür (Retraining). *Eğer Pass:* Model Artifact'i kilitlenir ve Faz 4'e geçilir.

### Faz 4: İş Mantığı ve Canlıya Alma (Inference API & Deployment)
- **Adım 4.1:** `role_backend_expert` devreye girer. Eğitilmiş ve optimize edilmiş modeli devralır. FastAPI (veya Triton) kullanarak modeli asenkron bir Inferans API'si (Endpoint) içine gömer.
- **Adım 4.2:** Gelen isteklerin Pydantic ile doğrulandığı, modelin asenkron/batch çalıştırıldığı altyapıyı Dockerize eder.
- **Adım 4.3 [TOLLGATE]:** `role_security_expert` Prompt Injection/Data Poisoning filtrelerini (Guardrails) ve Rate Limiting'i denetler. `role_performance_expert` Load Testing (k6) yaparak sunucunun OOM'a (Out Of Memory) düşüp düşmediğini kontrol eder.
- *Eğer Fail:* Adım 4.1'e dönülür. *Eğer Pass:* Faz 5'e geçilir.

### Faz 5: Teslimat (Final Delivery & Monitoring)
- **Adım 5.1:** Tüm ajanlar MLOps döngüsünün (Reproducibility) baştan sona eksiksiz çalışıp çalışmadığını doğrular.
- **Adım 5.2:** `_orchestrator`, sistemin Manifestodaki başarı kriterlerini sağladığını teyit eder.
- **Adım 5.3:** Mükemmel bir şekilde Dockerize edilmiş, metrikleri (Monitoring/Drift) açılmış AI Inferans sistemi `USER`'a teslim edilir.

## Dependency Matrix (Bağımlılık Tablosu)
- **Faz 2 (Veri Hattı)**, Makine öğreniminin yakıtıdır. Veri yanlışsa, Faz 3 ve Faz 4'ün yapacağı hiçbir mühendislik harikası sistemi kurtaramaz.
- **Faz 3 (Eğitim)**, Beyindir. Sürecin en fazla CPU/GPU yakan, en çok tekrarlanan (Deneme-Yanılma) aşamasıdır.
- **Faz 4 (Inference API)**, İskelettir. Mükemmel bir beyni dış dünyanın saldırılarına ve trafiğine (RPS) karşı ayakta tutar.

## Success Metrics (Başarı Kriterleri)
- Katmanlar arası (Data vs Model vs API) %100 İzlenebilirlik (Traceability) sağlanması. Canlıdaki modelin, hangi gün çekilmiş hangi veri setiyle (Data Lineage) eğitildiğinin saniyeler içinde bulunabilmesi.
- Eğitilen modelin Accuracy skorunun (Test setinde), Canlı ortama (Production) çıktıktan sonra da değişmeden aynı kalitesiyle çalışabilmesi (No Data/Concept Drift).

## Pre-Delivery Checklist (Teslimat Öncesi Kontrol Listesi)
- [ ] Akış şemasındaki sıralı işletim (Data -> Train -> Optimize -> Deploy) hiçbir aşamada delinmeden harfiyen uygulandı mı?
- [ ] Onay bariyerlerinde (Tollgates) Güvenlik (Bias/Robustness) ve Performans (Quantization/OOM) uzmanlarının yazılı onayları alındı mı?

## Red-Flag Rules (Kırmızı Çizgiler)
- **Veri Kalitesizliğini Aşmak:** Veri kalitesi (Data Quality) testleri geçmeden (Örn: %30 Null değer içeren verilerle) model eğitmeye zorlanması. Model çöp olur.
- **Değerlendirmeyi Ezmek (Validation Bypass):** AI Mimarının manifestoda hedeflenen başarı oranını (Örn: %90) tutturamamasına rağmen, Orkestratörün "Şimdilik bununla çıkalım" diyerek hatalı kararlar veren modeli canlıya alması. Bu, son kullanıcıya (Örn: Hastaya yanlış teşhis, müşteriye yanlış kredi) doğrudan zarar verir.
- **Arayüz (Frontend) Adımı Eklemek:** Sürecin herhangi bir yerine "Kullanıcının veri gireceği ekranı React ile kodlayalım" görevi vermek. AI/ML Pipeline domain'i saf yapay zekaya ve API'ye odaklanır, sunumu reddeder.
