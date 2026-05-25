---
name: "antigravity-03-full-stack-workflow-build"
description: "03-full-stack projesinin Veri -> Mantık -> Arayüz (DB -> Backend -> Frontend) sırasıyla, Zero-Trust prensipleriyle inşası için Kutsal Kronolojik Akış Şeması."
argument-hint: "akisi-oku | sırayi-takip-et | mimari-adimlari-kurgula"
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
  - "Mermaid.js (Akış Görselleştirme)"
  - "State Machine Logic"

protocols_supported:
  - "Sequential Execution (Sıralı İşletim)"
  - "Gating & Approval (Onay Kapıları)"

output_format: "markdown+mermaid"

cross_verification:
  - reviewer: "N/A - Evrensel Kural Seti"
    rule: "Akış şemasında çıkmaz sokak (dead end), sonsuz döngü (infinite loop) veya belirsiz durum (undefined state) barındırılamaz. Her adımın net bir giriş ve çıkış noktası olmalıdır."

red_flag_rules:
  - "Tersine Geliştirme (Reverse Engineering): Backend API'leri test edilmeden ve Veritabanı şeması onaylanmadan (Data-First kuralı ezilerek) Frontend arayüz kodlamasına başlanması kesinlikle reddedilir."
  - "Denetim Kapılarını Aşmak (Bypassing Tollgates): Güvenlik ve Performans uzmanlarının 'Pass' (Onay) vermediği bir aşamadan diğer majör aşamaya (Örn: Veritabanından API'ye) geçilmesi mimariyi bozar."
  - "Kapsam Dışı Adımlar: Manifestoda bulunmayan ve bu akışta yer almayan adımların (Örn: Geliştirme ortasında aniden Blockchain cüzdanı entegre etmeye çalışmak) sisteme zorla eklenmesi yasaktır."
---

# Workflow Build (Sistem İnşa Akışı ve Kronolojisi)

## Identity & Domain
Bu dosya bir ajan değil, `_orchestrator`'ın ve sistemdeki tüm uzman ajanların `03-full-stack` projelerini inşa ederken harfiyen ve tartışmasız takip edeceği **Kutsal Akış Şemasıdır** (Holy Pipeline).
Bir gökdelen inşa edilirken önce temel (Database), sonra taşıyıcı kolonlar ve tesisat (Backend/API), en son ise camlar ve boya (Frontend) yapılır. Bu belge, 15+ yıl deneyimli kurumsal bir full-stack ekibinin "Database-First" ve "API Design-First" prensiplerine göre oluşturduğu, her türlü hata durumunu (Rollback) kapsayan katı bir çalışma kronolojisidir.

Bu akış, "Böl ve Yönet" (Divide and Conquer) mimarisi üzerine kuruludur. Uzmanların birbirlerinin ayağına basmasını engeller, eşzamanlı çalışabilecekleri (Paralel) noktaları belirler, ve birbirlerinin işini beklemesi gereken (Bloklayıcı) kritik yolları (Critical Path) çizer. Hiçbir ajan, bu workflow'un adımlarını atlayamaz, sırasını değiştiremez veya kendi kafasına göre yeni bir faz icat edemez.

## Logic Constraints
1. **Kesin Sınır 1 (Sıralı İşletim Zorunluluğu):** İnşaatın genel ilerleme yönü daima `Veritabanı Şeması` -> `Backend API ve İş Mantığı` -> `Frontend UI ve State` şeklinde akmak zorundadır. Frontend, Mock API (Sahte Veri) ile çalışsa bile, o sahte verinin formatı (OpenAPI) kesinleşmeden kod yazamaz.
2. **Kesin Sınır 2 (Onay Bariyerleri - Tollgates):** Her katman kendi içinde tamamlandığında, kodlar veya tasarımlar bir sonraki faza akmadan önce `role_security_expert` (Güvenlik) ve `role_performance_expert` (Performans) onayından geçmek zorundadır. Bu bariyerler aşılamaz.
3. **Kesin Sınır 3 (Hata ve Geri Dönüş Döngüsü - Rollback):** Eğer bir onay bariyerinden "Fail" (Başarısız) yanıtı gelirse, süreç doğrudan bir önceki aşamaya (İlgili Ajana) geri döner. Reddedilen iş düzeltilmeden akış ilerleyemez.

## When to Use
- Uçtan uca (End-to-End) yeni bir uygulamanın sıfırdan oluşturulma (Day-Zero) sürecinde Orkestratörün yol haritası olarak.
- Veritabanından başlayıp arayüze kadar uzanan (Full-Stack) büyük bir özelliğin (Epic/Feature) mevcut sisteme entegre edilmesinde.
- Sistemde bir tıkanıklık veya ajanlar arası çatışma çıktığında, sürecin hangi noktada tıkandığını tespit etmek (Debugging the Workflow) için.

## Workflow (Adım Adım Kutsal İş Akışı)

### Faz 1: Analiz ve Çerçeveleme (Analysis & Framing)
- **Adım 1.1:** `USER` fikrini beyan eder.
- **Adım 1.2:** `_prompt_maker` kullanıcıyla iletişime geçer, teknik olmayan talepleri işler ve **Full-Stack Proje Manifestosu**'nu `_shared_context.md`'ye kaydeder.
- **Adım 1.3:** `_orchestrator` manifestoyu okur, sistemin C4 Mimari tasarımını (Context/Container sınırlarını) yapar ve projenin startını verir.

### Faz 2: Veri Katmanı (Data Layer Foundation)
- **Adım 2.1:** `role_database_expert` sahneye çıkar. Manifestodaki Entiteleri analiz eder, PostgreSQL tablolarını, ilişkilerini ve Redis cache politikalarını kurgular. ER diyagramını `_shared_context.md`'ye ekler.
- **Adım 2.2 [TOLLGATE]:** `role_security_expert` veri maskeleme (PII) ve at-rest şifreleme kurallarını doğrular. `role_performance_expert` indeks stratejilerini ve tahmini büyüme sorunlarını onaylar.
- *Eğer Fail:* Adım 2.1'e dönülür. *Eğer Pass:* Faz 3'e geçilir.

### Faz 3: İş Mantığı ve Kontrat Katmanı (Business Logic & API Layer)
- **Adım 3.1:** `role_backend_expert` devreye girer. ER diyagramını baz alarak Python (FastAPI/Django) iş sınıflarını (Business Logic) ve ORM bağlantılarını yazar.
- **Adım 3.2:** `role_backend_expert`, Frontend'in tüketeceği kesin API Kontratını (OpenAPI/Swagger) çıkarır ve `_shared_context.md`'ye kaydeder.
- **Adım 3.3 [TOLLGATE]:** `role_security_expert` AuthN/AuthZ, WAF, Cors kurallarını denetler. `role_performance_expert` N+1 sorgularını ve asenkron I/O darboğazlarını (k6 scriptleriyle teorik olarak) test eder.
- *Eğer Fail:* Adım 3.1'e dönülür. *Eğer Pass:* Faz 4'e geçilir.

### Faz 4: Sunum Katmanı (Presentation Layer)
- **Adım 4.1:** `role_frontend_expert` tetiklenir. OpenAPI kontratını baz alarak Typescript tiplerini oluşturur. React/Next.js/Vue bileşen hiyerarşisini çizer.
- **Adım 4.2:** `role_frontend_expert`, API bağlantılarını (React Query / SWR) ve State yönetimini (Zustand/Redux) kurgular. Kullanıcı deneyimini (UI/UX) son haline getirir.
- **Adım 4.3 [TOLLGATE]:** `role_security_expert` XSS açıklarını ve CSP yönergelerini test eder. `role_performance_expert` Core Web Vitals (LCP, CLS) metriklerini denetler.
- *Eğer Fail:* Adım 4.1'e dönülür. *Eğer Pass:* Faz 5'e geçilir.

### Faz 5: Uçtan Uca Teslimat (E2E QA & Final Delivery)
- **Adım 5.1:** Bütünleşik sistem testleri (End-to-End) ve izolasyon kontrolleri yapılır. (Tüm ajanlar genel bir gözden geçirme yapar).
- **Adım 5.2:** `_orchestrator`, sistemin eksiksiz ve manifestoya uygun çalıştığını teyit eder.
- **Adım 5.3:** Sistem, çalışır ve dökümante edilmiş bir bütün olarak `USER`'a teslim edilir. Süreç sonlanır.

## Dependency Matrix (Bağımlılık Tablosu)
- **Faz 2 (Veri Katmanı)**, projenin en alt taşıyıcı temelidir. Değişimi zordur ve her şeyi etkiler.
- **Faz 3 (API Katmanı)**, doğrudan Faz 2'nin ürettiği şemaya bağımlıdır.
- **Faz 4 (Frontend Katmanı)**, doğrudan Faz 3'ün ürettiği sözleşmeye (Kontrata) bağımlıdır. Veritabanının nasıl çalıştığıyla ilgilenmez.

## Success Metrics (Başarı Kriterleri)
- Katmanlar arası bilgi kopukluğu (Silo Effect) yaşanmaması ve ajanların birbirlerinin çıktısını %100 oranında anlayabilmesi.
- Geliştirme döngüsünde "Frontend bitti ama Backend API'yi yanlış yazmış, baştan yapıyoruz" gibi zaman kaybettirici kronolojik hataların sıfıra inmesi.

## Pre-Delivery Checklist (Teslimat Öncesi Kontrol Listesi)
- [ ] Akış şemasındaki sıralı işletim (DB -> BE -> FE) hiçbir aşamada delinmeden harfiyen uygulandı mı?
- [ ] Onay bariyerlerinde (Tollgates) Güvenlik ve Performans uzmanlarının yazılı (Shared Context üzerinde) onayları alındı mı?
- [ ] Her aşamadan bir sonrakine geçilirken, gerekli dokümantasyonlar (ER Diyagramı, OpenAPI) eksiksiz teslim edildi mi?

## Red-Flag Rules (Kırmızı Çizgiler)
- **Tersine Başlangıç:** DB şeması ortada yokken, Frontend'in tasarım kurgulamaya veya Backend'in mantık yazmaya başlaması. Gökdelen çatıdan inşa edilmez.
- **Kontrat (Sözleşme) Eksikliği:** Backend uzmanının OpenAPI (Swagger) kontratını yayınlamadan Frontend ajanının kendi kafasına (varsayımlarına) göre istek (fetch) kodlaması.
- **Geri Dönüş (Rollback) İhlali:** Testi geçemeyen (Fail olan) bir katmanın hatasının, bir sonraki katmanda "yamalanmaya" (Patch) çalışılması. (Örn: Veritabanındaki yavaşlığın düzeltilmeyip, tüm yükün frontend'de çözülmeye çalışılması). Hata neredeyse orada çözülmek zorundadır.