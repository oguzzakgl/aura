---
name: "antigravity-17-qa-workflow-build"
description: "17-qa-testing-automation projesinin Manifesto -> BDD Tasarımı -> Unit (Taban) -> API (Orta) -> E2E (Zirve) -> Güvenlik (DAST) -> QA Onayı (Release) sırasıyla 'Test Piramidi / Shift-Left' felsefesinde inşası için Kutsal Kronolojik Akış Şeması."
argument-hint: "qa-akisi-oku | sırayi-takip-et | test-piramidi-felsefesini-islet"
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
  - "State Machine Logic (QA/Test Execution)"

protocols_supported:
  - "Sequential Execution (Bottom-Up / Test Piramidi İlkeleri)"
  - "Quality Gate Gating (Code Coverage / Zero Flakiness)"
  - "Fail-Fast Deployment Lifecycle"

output_format: "markdown+mermaid"

cross_verification:
  - reviewer: "N/A - Evrensel Kural Seti"
    rule: "QA/Test inşası akış şemasında 'İzole (Mocklanmış) Birim Testlerini (Unit) ve Entegrasyon API testlerini (Orta) kurmadan Doğrudan UI/Tarayıcı (E2E) üzerinden Test Otomasyonu Yazmaya Başlamak' (Ice-Cream Cone Fallacy) barındırılamaz. Sistem Tabandan (Unit) Zirveye (E2E) doğru modüler adımlarla test edilmek zorundadır."

red_flag_rules:
  - "Tersine Mühendislik (E2E Before Unit Fallacy): QA Ekibinin (E2E Uzmanı) henüz Backend'in Unit Testleri yazılmadan (Code Coverage <%50 iken), 'Hemen bir Playwright/Selenium test yazıp ekrandan deneyelim' diyerek en yavaş ve maliyetli (UI) ortama İş Mantığı (Business Logic) testi yığmaya çalışması KESİNLİKLE yasaktır. Önce Taban (Unit) test edilir."
  - "Kalite Kapılarını Aşmak (Bypassing Coverage Tollgates): Birim Test Uzmanının (Code Coverage), API Uzmanının (Contract/Load) ve Güvenlik Uzmanının (DAST/OWASP) 'Passed' (Başarılı) onayı (Yeşil Build) almadan, kodların Canlı (Production) ortama GitOps üzerinden basılması."
  - "Manuel Regresyon Yaması (Manual Test Mutation): Akışın ortasında, Test Piramidinde eksik kalan bir parçayı düzeltmek bahanesiyle 'Bunu otomatize etmeyelim, release (canlıya çıkış) öncesi 1 gün QA ekibi elle (Manuel) tıklayarak test etsin' demek. Mimari akış sadece Tam Otomatik (Continuous Testing) üzerinden ilerler, manuel regresyon (Bottleneck) yaratır ve anında red sebebidir."
---

# Workflow Build (Sistem İnşa Akışı ve Kronolojisi - QA ve Test Otomasyonu)

## Identity & Domain
Bu dosya bir ajan değil, `_orchestrator`'ın ve sistemdeki tüm QA uzmanı ajanların (Architect, Unit, API, E2E, Sec) `17-qa-testing-automation` (Jest, Playwright, REST Assured, ZAP, SonarQube) projelerini inşa ederken harfiyen ve tartışmasız takip edeceği **Kutsal Akış Şemasıdır** (Holy Build Pipeline).
Bir Kalite Güvence (QA) Fabrikası inşa etmek, geliştiriciler kodu yazıp bitirdikten sonra (Test-Last) arayüzde (UI) tıklayarak hata arayan "Gecikmeli/Manuel" mantıkla KESİNLİKLE YAPILAMAZ. Modern QA'de yapılan bir "Mimari (Piramit)" hatası, sistemdeki tüm testlerin yavaşlamasına (Saatler sürmesine) ve kararsızlaşmasına (Flaky) sebep olur. Kusursuz bir Sürekli Test (Continuous Testing) sistemi; Stratejiden (BDD/Piramit) başlar, İş mantığını Tabanda (Unit/TDD) eritir, Entegrasyonu Ortada (API) halleder, sadece Kritik Müşteri Yolculuklarını Zirvede (E2E/UI) sınar ve Güvenlik (DAST) kalkanından geçirerek "Zero-Defect (Sıfır Hata)" ile yayına alır. Bu belge, 15+ yıl deneyimli kurumsal bir QA ekibinin "Shift-Left & Test Pyramid" denetimli, katı bir Otomasyon kronolojisidir.

Bu akış, Kod Kapsamı (Code Coverage) barajını aşmadan kodların (Merge) birleştirilmesini, uygulamanın güvenlik (DAST) açıklarına (Vulnerable) karşı kör kalmasını engeller. Ajanların hangi aşamada senkronize çalışacağını ve hangi noktada (Kalite Kapısı - Tollgate) birbirlerinin işini beklemesi gerektiğini (Bloklayıcı yollar - Fail Fast Path) çizer. Hiçbir ajan, bu workflow'un adımlarını atlayamaz.

## Logic Constraints
1. **Kesin Sınır 1 (Sıralı Piramit İşletimi - Bottom-Up):** Pipeline ilerleme yönü daima `Manifesto` -> `Strateji/BDD (QA Architect)` -> `Taban (Unit/Component Testing)` -> `Orta (API/Contract Testing)` -> `Zirve (E2E/UI Testing)` -> `Denetim (Security DAST)` -> `Yayın (QA Release)` şeklinde akmak zorundadır. Alt katman (Örn: Unit Test) çalışıp "Pass/Yeşil" olmadan, üst katman (Örn: E2E Tarayıcı) KESİNLİKLE başlatılamaz (Zaman İsrafıdır).
2. **Kesin Sınır 2 (Kalite Kapıları - Hard Tollgates):** Kodlama bittiğinde sistem KESİNLİKLE `role_unit_test_expert` (Code Coverage >= %80 mi?), `role_api_test_expert` (Sözleşmeler/Pact kırıldı mı?) ve `role_e2e_test_expert` (Flaky/Zaman Aşımı var mı?) onayından geçmek zorundadır. Herhangi birinden "FAIL" (Kırmızı) gelirse CI hattı anında durdurulur (Fail-Fast) ve Geliştiriciye iade edilir.
3. **Kesin Sınır 3 (Bağımsız Veri Üretimi - Data Independence):** Testler çalışırken (Özellikle API/E2E), sistemdeki "Hardcoded (Statik)" Müşteri verilerine bağlanamazlar. Her test, başlamadan önce (Setup Hook) kendi izole Test Verisini (Mock/Fixture) çok hızlı API'ler üzerinden üretir ve test bitince (Teardown) siler. Temiz Ortam (Clean State) şarttır.

## Workflow (Adım Adım Kutsal Mimari Akış)

### Faz 1: Analiz ve Stratejik Çerçeveleme (BDD & Pyramid Scoping)
- **Adım 1.1:** `USER` QA/Otomasyon hedefini beyan eder (Örn: 'Sürekli patlayan Manuel testler yerine hızlı çalışan %100 otomatik bir CI/CD Test Pipeline'ı kuralım').
- **Adım 1.2:** `_prompt_maker` kullanıcıyla iletişime geçer, Test Piramidi (Unit/API/E2E) Dağılım Stratejisini, BDD (Gherkin) Kriterlerini, Code Coverage sınırlarını belirleyerek **QA & Test Manifestosu**'nu `_shared_context.md`'ye kaydeder.
- **Adım 1.3:** `_orchestrator` manifestoyu okur, `role_qa_automation_architect`'i tetikleyerek Test Edilecek (Gherkin) Senaryoların haritasını çıkarttırır ve inşa (Execution) aşamasını başlatır.

### Faz 2: Piramidin Tabanı ve TDD (Unit & Component Foundation)
- **Adım 2.1:** `role_unit_test_expert` sahneye çıkar. Geliştirilen İş Kodlarının (Business Logic) Mimarisine girer. Dış dünyaya (DB/Network) ASLA bağlanmadan (Tamamen İzole/Mocked) saniyeler içinde çalışan Jest/JUnit Birim testlerini (Red-Green-Refactor) TDD kurgusuyla yazdırır/denetler.
- **Adım 2.2:** SonarQube / JaCoCo (Coverage Motoru) çalıştırılır. Yazılan kodların satır/dal kapsamı (Code Coverage) `_shared_context`'te belirlenen (Örn: %80) barajını geçemezse Pipeline anında Kırılır (FAIL). Geçerse Orta Katmana aktarılır.

### Faz 3: Piramidin Ortası ve Entegrasyon (API, Contract & Load)
- **Adım 3.1:** Unit testleri geçen sistem (Veritabanına bağlanacak şekilde) ayağa kalkar (Docker/Testcontainers). `role_api_test_expert` Endpoint'leri (REST/GraphQL) SuperTest/REST Assured ile "Taklit (Mock) etmeden" entegrasyon testine sokar.
- **Adım 3.2:** Frontend-Backend bağımlılıklarının bozulmadığından emin olmak için Pact (Consumer Driven Contract) Sözleşme Testleri çalıştırılır.
- **Adım 3.3 [Opsiyonel]:** Sistemin kritik modüllerine (Örn: Ödeme) k6/JMeter ile Yük Testi (Performance) atılır; Gecikme (Latency) limitini aşarsa "FAIL" verdirilir.

### Faz 4: Piramidin Zirvesi ve UI (E2E & UI Testing)
- **Adım 4.1:** Taban ve Orta katmanları başarıyla (Yeşil) geçen kodun Arayüzü (Web SPA / Mobil App) Canlıya (Staging) alınır. `role_e2e_test_expert` Playwright/Cypress veya Appium kullanarak "Sadece En Kritik Kullanıcı Yolculuklarını (Critical Paths)" tarayıcı (Headless Browser) üzerinden test eder.
- **Adım 4.2:** Testlerde "Sabit Bekleme (Hard Sleep)" yasaktır (Auto-wait kullanılır). Flaky (Kararsız/Zaman Aşımı) veren test anında tespit edilip Karantinaya (Skipped) alınır, Geliştiriciye Raporlanır (Video/Trace ile).

### Faz 5: Çalışma Zamanı Güvenliği ve QA Onayı (Security DAST & QA Release)
- **Adım 5.1:** Tüm piramidi (Unit->API->E2E) %100 geçen (Pass) uygulamaya `role_security_qa_expert` sahneye çıkarak (DAST/OWASP ZAP ile) dışarıdan hacker gibi (SQLi, XSS, Fuzzing) saldırı (Pentest) düzenler.
- **Adım 5.2:** `_orchestrator`, uygulamanın (DAST'ta P1/P2 kritik açık vermediğini ve Piramitteki tüm Tollgate'lerden (Coverage/Contracts) geçtiğini) doğrular.
- **Adım 5.3:** QA Fabrikası (Test Pipeline), "Kodunuz %100 Güvenilir (Zero-Defect) ve Canlıya Çıkabilir (Release Ready)" Mührünü (Pass) vererek `USER`'a veya DevOps ekibine teslimatı gerçekleştirir.

## Dependency Matrix (Bağımlılık Tablosu)
- **Faz 2 (Unit/Taban)**, Test Piramidinin %70 yükünü çeken "Motorudur". Eğer Unit (Birim) testler eksikse (Coverage Düşükse), o test edilmeyen İş Kuralları (Bugs), E2E UI testlerinde yakalanmaya çalışılır; bu da saatler süren ve sürekli kırılan (Ice-Cream Cone) hantal bir sisteme (Kabus) dönüşür.
- **Faz 3 (API/Orta)**, Fabrikanın Bağ Dokusudur. Modüllerin, Veritabanının ve Mesaj Kuyruklarının birbirini gerçekten anlayıp (Contract) anlamadığını test eder.
- **Faz 4/5 (E2E/Sec)**, Şirketin Vitrini ve Can Güvenliğidir. Sadece En Kritik "Para/İtibar Kaybettirecek" akışlar E2E UI katmanına yazılır (Piramidin zirvesi %10). Hacker gözüyle (DAST) test edilmeden vitrin (Prod) açılamaz.

## Success Metrics (Başarı Kriterleri)
- Yazılım ekibinin "Testlerimiz 3 saat sürüyor" şikayetinin, Piramit optimizasyonu (Shift-Left Unit'e kaydırma) ve API Mocking stratejileriyle "5-10 dakikalık" (Hızlı Geri Bildirim - CI Speed) şimşek hızında süreçlere indirilmesi.
- Müşterinin (Kullanıcının) Canlı Ortamda (Production) "Sayfa Yüklenmiyor, Ürün Eklenmiyor" gibi temel Uçtan Uca (E2E) hataları görme oranının %0'a (Zero-downtime defect) inmesi.

## Pre-Delivery Checklist (Teslimat Öncesi Kontrol Listesi)
- [ ] Akış şemasındaki sıralı işletim (Strateji -> Unit -> API -> E2E -> Sec DAST -> QA Release) Bottom-Up felsefesi hiçbir aşamada (Örn: Unit test çalışmadan E2E çalıştırma) delinmeden uygulandı mı?
- [ ] Onay bariyerlerinde (Quality Gates) Code Coverage (Kapsam), Contract (Sözleşme) ihlalleri ve DAST (Zafiyet) açıkları "Hard Blocker (Kırıcı)" olarak Pipeline'ı durduracak (FAIL edecek) şekilde bağlandı mı?
- [ ] E2E Tarayıcı (UI) Testlerinde kararsız (Flaky) çalışan senaryolar, sistemin güvenini kırmadan önce Otomatik Karantina (Quarantine/Skip) listesine alındı mı?

## Red-Flag Rules (Kırmızı Çizgiler)
- **Dondurma Külahı Mimarisi (Ice-Cream Cone Anti-pattern):** "Bizim QA ekibimiz kod yazmayı bilmiyor, sadece Selenium ile Arayüzden tıklatabiliyor" bahanesiyle, Birim (Unit) ve API testlerini yazmayıp tüm yükü yavaş ve kırılgan UI testlerine yığmak. (Sürdürülemezdir, kesin red sebebidir).
- **Hard Sleep Kanseri (Static Wait Fallacy):** Playwright/Cypress UI Test Kodlarının içine `sleep(5000)` veya `waitForTimeout(10)` yazmak. Bu, CI hattının süresini sabote eder ve sunucu yavaşladığında testi Kırmızıya (Flaky) düşürür. Dinamik Bekleme (Auto-wait) ZORUNLUDUR.
- **Erken UI Testi (Premature E2E Testing):** Birim Testleri (Unit) geçmemiş, SonarQube'de Coverage hedefini (%80) vurmamış Spagetti (Bug'lı) kodların "Arayüzde çalışıyor mu bir bakalım" diye UI (E2E) test ortamına (Staging) gönderilmesine (Orkestratörün) izin vermesi. (Bozuk temele çatı kurulmaz).
