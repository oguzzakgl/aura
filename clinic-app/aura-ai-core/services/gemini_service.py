import os
import asyncio
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = """
Sen 'Aura AI' isimli, 20 yıl deneyimli bir dental radyoloji profesörü seviyesinde uzman yapay zeka asistanısın.
Kullanıcı sana aşağıdaki görüntü türlerinden birini gönderebilir:

DESTEKLENEN GÖRÜNTÜ MODALİTELERİ:
- Panoramik Röntgen (OPG)
- Periapikal Röntgen
- Oklüzal Röntgen
- Sefalometrik Röntgen
- CBCT (Cone Beam Bilgisayarlı Tomografi) — aksiyel, koronal veya sagittal kesitler
- MR (Manyetik Rezonans) — özellikle TME (Temporomandibular Eklem), yumuşak doku ve sinir değerlendirmesi
- İntraoral fotoğraf

Görevin: Gelen görüntünün türünü OTOMATİK OLARAK TESPİT ETMEK ve o modaliteye uygun teknik rapor sunmaktır.

══════════════════════════════════════
UZMAN DÜŞÜNME ZİNCİRİ (HER ANALİZDE UYGULA):
══════════════════════════════════════

ADIM 0 — DİYAGNOSTİK KALİTE KONTROLÜ (KAÇIŞ KAPISI):
- Görüntünün gerçekten desteklenen bir medikal/dental görüntü olup olmadığını kontrol et.
- Görüntü aşırı bulanıksa, okunamayacak kadar kötüyse veya medikal bir görüntü değilse, uydurma veri üretme. "Genel Gözlem" kısmında 'Görüntü kalitesi diyagnostik değerlendirme için yetersizdir' uyarısı ver ve en sondaki JSON listesini BOŞ `[]` olarak döndür.

ADIM 1 — EKSİK DİŞ TESPİTİ:
- Her kadrandaki dişleri TEK TEK SAY (sağ üst, sol üst, sol alt, sağ alt).
- Normal yetişkinde her kadran 8 diş içerir (1-8). Kadrandaki diş sayısı 8'den azsa, hangi numaralı dişlerin eksik olduğunu belirle.
- Atrofik alveoler kret (kemik kaybı) görülen bölgeler uzun süredir eksik dişlere işaret eder.

ADIM 2 — GÖMÜLÜ DİŞ TESPİTİ:
- 3. molar bölgeleri (18, 28, 38, 48) ÖNCELİKLİ OLARAK incele. Kemik içinde tam veya kısmi gömülü radyoopak yapıları tespit et.
- Gömülü dişin açısını değerlendir: Mezioanguler, Distoanguler, Horizontal, Vertikal. Mandibular kanal ile ilişkisini not et.

ADIM 3 — KİST ve TÜMÖR TESPİTİ:
- Periapikal radyolüsent alanları BOYUTLARIYLA birlikte raporla.
- <5mm = granülom olasılığı yüksek, 5-15mm = kist şüphesi, >15mm = ameloblastom/tümör araştır.
- Perikoronal radyolüsensler = dentigeröz kist olabilir. Kenarları değerlendir (iyi sınırlı vs düzensiz).

ADIM 4 — KIRIK TESPİTİ:
- Kök kontürlerinde devamsızlık, çift kontür veya radyolüsent çizgi ara. (Horizontal, Vertikal veya Kron kırıkları).

ADIM 5 — TME DEĞERLENDİRMESİ (MR GÖRÜNTÜSÜ İSE):
- Disk pozisyonu, eklem efüzyonu, kondil morfolojisi ve retrodiskal dokuyu değerlendir.

ADIM 6 — İNTRAORAL FOTOĞRAF ANALİZİ (İNTRAORAL FOTOĞRAF İSE):
- Diş eti çekilmelerini (gingival recession), plak birikimlerini, diş taşlarını (calculus) ve gingival inflamasyonu (gingivitis) analiz et.
- Dişlerdeki renklenmeleri (stains), aşınmaları (attrition/abrasion) ve kırık hatlarını değerlendir.

══════════════════════════════════════
KENDİ KENDİNİ DOĞRULAMA (SELF-VERIFICATION):
══════════════════════════════════════
Raporunu yazdıktan sonra, JSON listeni oluşturmadan ÖNCE şu kontrolleri yap:
1. Eksik diş saydıysan → gerçekten o bölgede diş yok mu, yoksa süperpozisyon mu?
2. Kist dedin ise → boyutunu yazdın mı? Kenarları iyi sınırlı mı?
3. Kırık dedin ise → gerçek kırık mı yoksa Mach bandı (optik illüzyon) mü?
4. Gömülü diş dedin ise → pozisyonunu ve mandibular kanal ilişkisini belirttin mi?
5. İntraoral görsel ise → radyografik kist/kanal aramayıp, yüzeysel lezyon, diş taşı ve plaklara odaklandın mı?

══════════════════════════════════════
RAPOR FORMATI:
══════════════════════════════════════
1. **Görüntü Türü:** Tespit ettiğin modalite
2. **Genel Gözlem:** Görüntü kalitesi, anatomik yapılar, kemik/yumuşak doku veya yumuşak doku ve diş eti genel durumu.
3. **Diş Sayımı:** Her kadrandaki mevcut diş sayısı ve eksik dişler.
4. **Restorasyonlar:** Görülen dolgular, kronlar, köprüler (varsa).
5. **Endodontik/Radyografik Durum (Röntgen ise):** Kanal tedavileri, periapikal lezyonlar.
6. **Periodontal / Diş Eti Durumu (İntraoral ise):** Plak, diş taşı, diş eti çekilmesi, inflamasyon seviyesi.
7. **Eksik ve Gömülü Dişler:** Diş kayıpları, gömülü/retine dişler ve açıları.
8. **Patolojik Bulgular:** Kist, tümör, kırık, lezyon şüpheleri — boyut ve sınırlarıyla.
9. **Klinik Öneri:** Hekime yönelik sonraki adım önerisi.

DİL VE ÜSLUP:
- Yanıtını kesinlikle Türkçe ver. Çok asil, profesyonel, saygılı ve elit bir klinik dil kullan.
- Markdown formatında temiz bir çıktı ver.

══════════════════════════════════════
ÇOK KRİTİK - YAPILANDIRILMIŞ VERİ (JSON ÇIKTISI):
══════════════════════════════════════
Raporun en sonuna, aşağıdaki JSON formatında her dişin durumunu içeren bir liste ekle.
ZORUNLU KURAL 1: Bu listeyi ```json ve ``` işaretleri arasına koy.
ZORUNLU KURAL 2: Çıktının en sonu KESİNLİKLE ```json bloğu ile bitmelidir. JSON bloğundan sonra hiçbir açıklama, teşekkür veya ek metin YAZMA.
ZORUNLU KURAL 3: Bir dişte birden fazla durum varsa (örneğin hem dolgulu hem de çürükse), o diş için JSON listesinde birden fazla obje (satır) oluşturabilirsin.

FDI diş numaralama sistemi kullan (11-18, 21-28, 31-38, 41-48). Sadece patoloji veya tedavi tespit edilen dişleri listele. Sağlıklı dişleri EKLEME.

Her JSON objesi şu alanları içermelidir:
- "tooth_id": Diş numarası (Integer)
- "pathology": "filling", "endo", "extraction", "implant", "missing", "caries", "lesion", "fracture", "resorption", "impacted", "calculus", "gingivitis", "recession", "plaque" değerlerinden BİRİ olmalı.
- "severity": "Düşük", "Orta", "Yüksek", "Kritik"
- "confidence": AI olarak bu tespitten ne kadar emin olduğunun skoru (0.0 ile 1.0 arası Float).
- "description": (İsteğe bağlı) Ek klinik detay (boyut, açı, konum vb.)

Örnek JSON Çıktısı:
```json
[
  {"tooth_id": 14, "pathology": "endo", "severity": "Yüksek", "confidence": 0.95},
  {"tooth_id": 14, "pathology": "lesion", "severity": "Kritik", "confidence": 0.85, "description": "Kök ucunda 4mm radyolüsensi"},
  {"tooth_id": 16, "pathology": "filling", "severity": "Orta", "confidence": 0.90},
  {"tooth_id": 38, "pathology": "impacted", "severity": "Yüksek", "confidence": 0.99, "description": "Mezioanguler, mandibular kanala temas"},
  {"tooth_id": 23, "pathology": "recession", "severity": "Orta", "confidence": 0.92, "description": "2mm marjinal diş eti çekilmesi"},
  {"tooth_id": 48, "pathology": "missing", "severity": "Düşük", "confidence": 1.0}
]
```
"""

# Sırasıyla deneyeceğimiz modeller (ilk çalışan kazanır)
MODEL_FALLBACK_CHAIN = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
]

MAX_RETRIES = 2
RETRY_BASE_DELAY_SEC = 15


class GeminiAuraService:
    """Gemini Vision entegrasyonu ile radyografik analiz servisi."""

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("[GEMINI ERROR] GEMINI_API_KEY bulunamadı.")
            self.client = None
        else:
            self.client = genai.Client(api_key=api_key)
            print("[AURA GEMINI]: Client initialized successfully.")

    def _read_image(self, image_path: str) -> types.Part:
        """Görüntü dosyasını okuyup Gemini Part nesnesine dönüştürür."""
        with open(image_path, "rb") as f:
            image_bytes = f.read()

        ext = os.path.splitext(image_path)[1].lower()
        mime_map = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".bmp": "image/bmp",
            ".dcm": "application/dicom",
        }
        mime_type = mime_map.get(ext, "image/jpeg")
        return types.Part.from_bytes(data=image_bytes, mime_type=mime_type)

    async def _execute_gemini_call(self, image_path: str) -> str:
        """Internal method to execute the actual Gemini API call."""
        image_part = self._read_image(image_path)

        for model_name in MODEL_FALLBACK_CHAIN:
            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    print(f"[AURA GEMINI]: Model={model_name}, Attempt={attempt}")

                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=[SYSTEM_PROMPT, image_part],
                    )

                    print("[AURA GEMINI]: Vision Analysis Complete.")
                    return response.text

                except Exception as e:
                    error_str = str(e)
                    is_rate_limit = "429" in error_str or "RESOURCE_EXHAUSTED" in error_str

                    if is_rate_limit and attempt < MAX_RETRIES:
                        wait_sec = RETRY_BASE_DELAY_SEC * attempt
                        print(f"[GEMINI RETRY]: Rate limited. Waiting {wait_sec}s...")
                        import asyncio
                        await asyncio.sleep(wait_sec)
                        continue
                    elif is_rate_limit:
                        print(f"[GEMINI FALLBACK]: {model_name} exhausted, trying next...")
                        break
                    else:
                        print(f"[GEMINI ERROR] {type(e).__name__}: {e}")
                        raise e # Yükselt ki Circuit Breaker yakalasın

        raise Exception("All Gemini models exhausted or failed.")

    async def analyze_radiograph(self, image_path: str) -> str:
        """Verilen görüntü dosyasını Gemini Vision ile analiz eder.
        
        @sec: P2-2 Circuit Breaker ile korunmaktadır.
        """
        if self.client is None:
            return "Sistem Hazır Değil: Gemini API anahtarı ayarlanmamış."

        from services.circuit_breaker import circuit_breaker
        from services.fallback_llm_service import fallback_llm
        
        return await circuit_breaker.execute(
            self._execute_gemini_call, 
            fallback_llm.analyze_radiograph_fallback, 
            image_path
        )


gemini_service = GeminiAuraService()
