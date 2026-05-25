---
name: "antigravity-07-ai-ml-workflow-build"
description: "07-ai-ml projesinin Manifesto -> Veri İzolasyonu (Cleansing) -> Model Eğitimi (Tracking) -> Güvenlik/Performans Denetimi -> Deployment (Inference) sırasıyla bilimsel 'Data-First' felsefesinde inşası için Kutsal Kronolojik Akış Şeması."
argument-hint: "ml-akisi-oku | sırayi-takip-et | data-first-felsefesini-islet"
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
  - "Mermaid.js (Mimari Akış Görselleştirme)"
  - "State Machine Logic (Data-First Execution)"

protocols_supported:
  - "Sequential Execution (Sıralı İşletim)"
  - "Gating & Approval (Tollgates)"
  - "Scientific Method (Train/Val/Test Isolation)"

output_format: "markdown+mermaid"

cross_verification:
  - reviewer: "N/A - Evrensel Kural Seti"
    rule: "Makine Öğrenmesi Uygulaması inşası akış şemasında 'Veri İzole Edilmeden Modellemeye Başlamak' (Data Leakage Fallacy) gibi bilime aykırı bir atlama barındırılamaz. Sistem Veriden (Dataset) Çıktıya (Inference) doğru inşa edilmek zorundadır."

red_flag_rules:
  - "Tersine Mühendislik (Code-First Fallacy): Veri seti `Train`, `Validation` ve `Test` olarak bölünmeden, Null değerler ve PII (Kişisel Veri) temizlenmeden (Data Prep aşaması bitmeden) ML Uzmanının derin öğrenme kodu yazmaya (Training) başlatılması kesinlikle reddedilir."
  - "Denetim Kapılarını Aşmak (Bypassing Tollgates): Güvenlik Uzmanının (PII Masking, LLM Guardrails, Adversarial Defense) ve Performans Uzmanının (Latency SLA, ONNX Quantization) 'Passed' (Başarılı) onayı almadan model ağırlıklarının (Weights) canlı API'ye (Production) yüklenmesi."
  - "Teknoloji Kayması (Tech-Stack Drift): Akışın ortasında uygulamanın (problem Tabular Data iken) basit XGBoost algoritması yerine, açıklanamaz bir kararla devasa PyTorch Deep Learning modelleriyle (Over-engineering) yazılmaya başlanması. Occam'ın usturası ilkesi ihlal edilemez."
---

# Workflow Build (Sistem İnşa Akışı ve Kronolojisi - AI/ML)

## Identity & Domain
Bu dosya bir ajan değil, `_orchestrator`'ın ve sistemdeki tüm Yapay Zeka/ML uzman ajanlarının (ML Engineer, Security, Performance) `07-ai-ml` (Makine Öğrenmesi Geliştirme) projelerini inşa ederken harfiyen ve tartışmasız takip edeceği **Kutsal Akış Şemasıdır** (Holy Build Pipeline).
Bir Yapay Zeka modeli geliştirmek, "Datayı koda verelim, tahmin etsin" mantığıyla (Plansız/Bilimsel olmayan) yapılmaz; bu yaklaşım veri sızıntısına (Data Leakage), ezberlemeye (Overfitting) ve modelin canlıda (Production) anında çökmesine neden olur. Kusursuz bir AI sistemi, temiz bir temel (Data Pipeline ve PII Maskeleme) üzerine, bilimsel izolasyonla (Train/Test Split) eğitilir, MLOps ile takip edilir ve en son donanımsal olarak optimize (ONNX/Quantized) edilerek hizmete açılır (Data-Driven Development). Bu belge, 15+ yıl deneyimli kurumsal bir Yapay Zeka Mimarı ekibinin "Security & Performance" denetimli, katı bir MLOps kronolojisidir.

Bu akış, Veri temizlenmeden kod yazılmasını, Model metrikleri izole test setinden alınmadan "Başarılı" denilmesini engeller. Ajanların hangi aşamada (Fazda) devreye gireceğini ve hangi noktada (Tollgate) birbirlerinin işini beklemesi gerektiğini (Bloklayıcı yollar - Critical Path) çizer. Hiçbir ajan, bu workflow'un adımlarını atlayamaz.

## Logic Constraints
1. **Kesin Sınır 1 (Sıralı İşletim - Scientific Data-First):** Pipeline ilerleme yönü daima `Manifesto` -> `Veri İzolasyonu (Data Prep/Schema)` -> `Model Eğitimi (Training & Evaluation)` -> `Tollgate (Güvenlik/Performans)` -> `Deployment (Inference Server)` şeklinde akmak zorundadır. Alt katman (Veri) dondurulup "Approved" olmadan, üst katman (Eğitim) başlatılamaz.
2. **Kesin Sınır 2 (Kalite Kapıları - Tollgates):** ML Eğitim kodlaması ve Testi (Evaluation) bittiğinde sistem `role_security_expert` (LLM Guardrails, PII Sanitization, Adversarial Robustness) ve `role_performance_expert` (GPU Profiling, ONNX Export, Latency Check) onayından geçmek zorundadır. Bu kapılar aşılamaz, hata veya metrik düşüşü (Degradation) varsa kod ML Uzmanına (Rollback) iade edilir.
3. **Kesin Sınır 3 (İzolasyon Kuralı - No Data Leakage):** Pipeline'ın 2. Aşamasında Veri Seti ayrıştırıldığı andan (Split) itibaren, `Test` (Canlı Simülasyonu) veri seti bir kasaya kilitlenir. Algoritma (ML Engineer) eğitim esnasında test verisini hiçbir şekilde ASLA GÖREMEZ (Feature Scaling dahil). Sadece en son Değerlendirme (Evaluation) adımında tek seferlik çalıştırılır.

## Workflow (Adım Adım Kutsal Mimari Akış)

### Faz 1: Analiz ve Çerçeveleme (Framing & Scoping)
- **Adım 1.1:** `USER` AI projesi hedefini beyan eder (Örn: 'Gelen müşteri maillerinin konusunu sınıflandıran bir model (NLP) yapalım').
- **Adım 1.2:** `_prompt_maker` kullanıcıyla iletişime geçer, Uygulamanın Problem Tipini (Classification/Generative vs), Baseline Başarı hedeflerini, Gecikme (Latency) SLA'sını belirleyerek **AI Proje Manifestosu**'nu `_shared_context.md`'ye kaydeder.
- **Adım 1.3:** `_orchestrator` manifestoyu okur, kullanılacak çatıyı (Framework - PyTorch/Scikit) doğrular ve MLOps (İnşa) aşamasını başlatır.

### Faz 2: Veri Hattı ve Güvenlik Süzgeci (Data Foundation & Sanitization)
- **Adım 2.1:** Koda ilk temel atılır. İşleme Veri (Data) ile başlanır. `role_ml_engineer` Veri Yükleyicileri (Data Loaders) yazar.
- **Adım 2.2:** [SECURITY INJECTION] `role_security_expert` devreye girer. Veri içinde KVKK/GDPR riskli alanları (PII) bulur, maskeleme (Presidio vb.) kurallarını yazar. Modelin zehirlenmemesi (Poisoning) için veride anomali taraması yapar.
- **Adım 2.3:** Veri seti körlük kuralıyla (Blindness) `Train (%70)`, `Validation (%15)`, `Test (%15)` olarak izole edilir. Feature şemaları `_shared_context`'e "APPROVED" (Onaylı) yazılır.

### Faz 3: Model Eğitimi ve Deney Takibi (Training & MLflow)
- **Adım 3.1:** `role_ml_engineer`, izole edilmiş Eğitim (Train) ve Doğrulama (Validation) setlerini kullanarak PyTorch/TensorFlow algoritmalarını (Training Loop) yazar.
- **Adım 3.2:** Hiperparametreler (Learning Rate, Epoch) ve Loss metrikleri "Reproducibility" (Tekrarlanabilirlik - Seed 42) kuralı gereği MLflow (veya W&B) MLOps platformuna loglanır.
- **Adım 3.3:** Model Eğitimi bittiğinde, kasa açılır ve `Test` veri seti üzerinden Final (Gerçek) Başarı Metrikleri (Örn: F1-Score %94) alınarak `_shared_context`'e kaydedilir. (Eğer hedef Baseline altındaysa Faz 2'ye dönülür).

### Faz 4: Denetim ve Kalite Kapıları (Security & Performance Tollgates)
- **Adım 4.1:** Başarılı modeli `role_performance_expert` devralır. GPU/CPU Profillemesi yapar. Modeli FP32'den INT8/FP16'ya sıkıştırır (Quantization) ve donanım hızlandırıcısı ONNX (veya TensorRT) formatına dönüştürür (Export).
- **Adım 4.2:** Eşzamanlı olarak `role_security_expert`, modele Red-Teaming (Saldırı) uygular. Eğer bu bir LLM ise Prompt Injection / Jailbreak koruma kalkanlarını (Guardrails - NeMo) entegre eder. Adversarial perturbation (Gürültü) testleri yapar.
- **Adım 4.3 [TOLLGATE]:** Uzmanlardan biri "FAIL" verirse (Örn: Model çok yavaş veya Guardrail aşılabiliyor) Faz 3'e (Revizyon) Rollback (Geri dönüş) yapılır. "PASS" verirlerse model mühürlenir (Locked).

### Faz 5: Canlıya Alma ve Sunum (Deployment & Serving)
- **Adım 5.1:** `_orchestrator`, AI Uygulamasının tüm testleri geçtiğini (SLA uyumu) ve Güvenli/Performanslı olduğunu doğrular.
- **Adım 5.2:** Donanım optimize (ONNX) edilmiş model ağırlıkları, FastAPI, TorchServe veya Triton Inference Server üzerinde "Dynamic Batching" kullanılarak dış API'ye açılır. Inferans katmanı kodlanır.
- **Adım 5.3:** Kodla inşa edilmiş, PII'den arındırılmış, bilimsel izole eğitimden geçmiş ve jet hızındaki (Quantized) AI Modeli (API Endpoints) `USER`'a teslim edilir.

## Dependency Matrix (Bağımlılık Tablosu)
- **Faz 2 (Veri İzolasyonu & PII)**, Sistemin temelidir (Foundation). Veri zehirli, sızıntılı (Leakage) veya ayrıştırılmamışsa, Faz 3'te çıkacak %99 başarı skorları tamamen HALÜSİNASYONDUR. Canlıda çöker.
- **Faz 3 (Eğitim ve MLflow)**, Aracın bilim dünyasıyla barış antlaşmasıdır. Eğer rastgelelik (Seed) sabitlenmez ve deneyler kaydedilmezse, mühendislik biter "Şans/Sanat" başlar. Model tekrarlanamaz.
- **Faz 4 (Güvenlik/Performans)**, Şirketin cüzdanının ve itibarının sigortasıdır. Bu kapıyı atlamak sisteme sızıntıya (Prompt Injection) veya Devasa Cloud (GPU) Faturalarına (Optimize edilmemiş hantal FP32 model) neden olur.

## Success Metrics (Başarı Kriterleri)
- Sürecin baştan sona çalıştırılmasıyla, Jupyter Notebook çöplükleri yerine MLOps (CI/CD) standartlarında baştan sona çalıştırılabilir, versiyonlanabilir ve denetlenebilir bir AI boru hattı (Pipeline) inşa edilmesi.
- Parametre eksikliğinden, Veri sızıntısından veya kötü GPU bellek yönetiminden (VRAM Leak) kaynaklanan OOM (Out of Memory) çökmelerinin Kalite Kapılarında (Tollgate) önceden %100 sıfıra indirilmesi.

## Pre-Delivery Checklist (Teslimat Öncesi Kontrol Listesi)
- [ ] Akış şemasındaki sıralı işletim (Data Prep -> PII Masking -> Training -> Güvenlik/Perf -> Deployment) Data-First felsefesi hiçbir aşamada delinmeden uygulandı mı?
- [ ] Onay bariyerlerinde (Quality Gates) Performans (Latency SLA, ONNX Dönüşümü) ve Güvenlik (Zero PII, Guardrails) uzmanlarının yazılı (Blocker) onayları alındı mı?
- [ ] ML Geliştiricisi, uygulamanın Başarı Metriklerini ölçerken (Evaluation), modeli daha önce ASLA görmediği %15'lik Test Seti üzerinden (Blind Test) değerlendirdiğini kanıtladı mı?

## Red-Flag Rules (Kırmızı Çizgiler)
- **Metrik Yanılsaması (Data Leakage):** Eğitim aşamasında Feature Scaling (Standardizasyon) işleminin Train/Test ayrılmadan (Split) önce tüm veriye uygulanıp, modelin Test verisinin genel özelliklerini önceden kopya çekerek öğrenmesi (Kesin İptal / Ret nedenidir).
- **Sessiz İhlal (Tollgate Override):** Herhangi bir katmanda Performans ajanı modelin 2 saniyede cevap verdiğini (Latency aşımı) bularak (Fail) vermesine rağmen, Orkestratör'ün süreci bir sonraki aşamaya (Canlı API) geçirmesi. (Yavaş AI asla derlenemez).
- **Spagetti Çıktı (Notebook Hell):** ML Uzmanının tüm eğitimi, veriyi ve testi devasa, tek bir Jupyter Notebook (`.ipynb`) dosyasında alt alta yazıp (Modüler Class'lara ayırmadan) Orkestratör'e teslim etmesi. Canlı ortam kodları OOP (Nesne Yönelimli) Python `.py` modülleri olmak zorundadır.