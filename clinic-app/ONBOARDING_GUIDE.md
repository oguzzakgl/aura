# 🏛️ AURA AI CLINIC - HIZLI BAŞLANGIÇ & KURULUM KILAVUZU

Bu kılavuz, **AURA AI Clinic SaaS** projesini GitHub üzerinden bilgisayarınıza indirip (Antigravity veya ek yapay zeka asistanları olmadan) standart terminal komutlarıyla en fazla **2 dakika** içinde ayağa kaldırmanızı sağlar.

---

## ⚡ Air-Gap & Otonom Fallback Özelliği (Sıfır Yapılandırma)
> [!IMPORTANT]
> Projemiz derin **P2 Graceful Degradation (Hata Toleransı)** mimarisine sahiptir. Bilgisayarınızda **Redis**, **Supabase** veya **Gemini/OpenAI API anahtarları kurulu olmasa bile**, sistem otonom simülasyon moduna geçer ve tüm özellikleri (3D Odontogram, Röntgen Analizi, Reçete Sihirbazı) hatasız bir şekilde denemenizi sağlar!

---

## 📋 Ön Gereksinimler (Prerequisites)
Bilgisayarınızda şu iki temel aracın kurulu olması yeterlidir:
1.  **Node.js** (v18 veya daha yeni bir sürüm) -> [İndir](https://nodejs.org/)
2.  **Python** (v3.10 veya v3.11 sürümü tavsiye edilir) -> [İndir](https://www.python.org/)

---

## 🚀 Adım Adım Çalıştırma Talimatları

### Adım 1: Depoyu (Repository) Klonlayın
Öncelikle terminalinizi açın ve projeyi bilgisayarınıza çekin:
```bash
git clone <repo-url-buraya>
cd dentist
```

---

### Adım 2: Ön Yüzü (Frontend) Başlatın
Next.js ön yüz uygulamasını ayağa kaldırmak için terminalde şu komutları sırasıyla çalıştırın:

```bash
# 1. Frontend klasörüne girin
cd clinic-app

# 2. Gerekli paketleri kurun (npm v9+)
npm install

# 3. Next.js Turbopack geliştirme sunucusunu başlatın
npm run dev
```
*   **Adres:** Ön yüzünüz saniyeler içinde **`http://localhost:3005`** adresinde hazır olacaktır! Tarayıcınızı açıp bu adrese gidebilirsiniz.

---

### Adım 3: Yapay Zeka Motorunu (Backend) Başlatın
FastAPI backend sunucusunu çalıştırmak için **yeni bir terminal** açın ve aşağıdaki adımları izleyin:

#### 📌 Windows Kullananlar İçin:
```bash
# 1. Backend klasörüne gidin
cd clinic-app/aura-ai-core

# 2. Sanal Python ortamı (venv) oluşturun
python -m venv venv

# 3. Sanal ortamı aktifleştirin
venv\Scripts\activate

# 4. Gerekli kütüphaneleri yükleyin
pip install -r requirements.txt

# 5. FastAPI sunucusunu ateşleyin!
python main.py
```

#### 📌 macOS / Linux Kullananlar İçin:
```bash
# 1. Backend klasörüne gidin
cd clinic-app/aura-ai-core

# 2. Sanal Python ortamı (venv) oluşturun
python3 -m venv venv

# 3. Sanal ortamı aktifleştirin
source venv/bin/activate

# 4. Gerekli kütüphaneleri yükleyin
pip install -r requirements.txt

# 5. FastAPI sunucusunu ateşleyin!
python main.py
```
*   **Adres:** Backend yapay zeka servisleriniz **`http://localhost:8000`** üzerinde otomatik olarak dinlemeye başlayacaktır.

---

## 🧪 Canlı Test ve Demo Adımları

1.  Tarayıcınızdan **`http://localhost:3005`** adresine gidin.
2.  Giriş ekranında bilgileri doldurup giriş yapın (Mock dev modu aktiftir).
3.  **Takvim (Calendar)** sayfasına gidip **Hacer Erkan** isimli hastaya tıklayarak P95 korumalı **Anamnez Lazy Loading** ve sağ üstteki neon kırmızı **Sistemik Risk Rozetini** görün.
4.  Tanı Panelinden **Akıllı Reçete** sihirbazına tıklayıp, **AES-GCM (Web Crypto API)** şifrelemeli çevrimdışı **Air-Gap** veritabanı simülasyonunu test edin.
5.  Billing sayfasına geçerek **Neural Financial Forecast (Yapay Zeka Öngörüsü)** grafiğini inceleyin.

Aura AI platformu, en zorlu ve kısıtlı ortamlarda dahi en yüksek kararlılıkla çalışacak şekilde mühürlenmiştir! 🚀
