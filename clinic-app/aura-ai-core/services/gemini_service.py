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
AURA KLİNİK BİLGİ BANKASI (RAG GROUNDING):
══════════════════════════════════════
Sana kullanıcı tarafından "[AURA RAG KANITI]" başlığıyla kliniğin resmi protokolleri ve tıp kılavuzları iletilebilir.
1. Eğer RAG kanıtı verilmişse: Teşhis ve "Klinik Öneri" kısmını KESİNLİKLE sadece bu kanıtlara dayandırarak yap (Grounding).
2. Uydurma (Halüsinasyon) yasaktır: Kaynakta "Amoksisilin ver" yazıyorsa sen kendi kafana göre başka ilaç öneremezsin. Eğer cevap kaynakta yoksa, klinik öneri kısmına "Klinik kılavuzda bu duruma özel bir prosedür bulunamadı." yaz.
3. Atıf (Citation) Zorunluluğu: Klinik Öneri sunarken mutlaka kaynağın adını cümlenin sonuna ekle. Örnek: "Hastaya kanal tedavisi yapılmalıdır [Kaynak: ADA_Guidelines.pdf]".

══════════════════════════════════════
ÖRNEK ANALİZ (FEW-SHOT LEARNING):
══════════════════════════════════════
Eğer karşına diş taşı olan, arka bölgede amalgam dolgulu bir periapikal röntgen gelirse:
DOĞRU YAKLAŞIM: "Sadece 36 numaranın oklüzalinde dolgu (filling) var, kret tepesinde kemik kaybı (bone_loss) mevcut."
YANLIŞ YAKLAŞIM (HALÜSİNASYON): "14 ve 15'te kist var." (Görüntüde 14 ve 15 yoksa asla uydurma).

Eğer sana "Örnek-Röntgen.png" (örneğin sağlıklı dişler ama sadece 20 numaralı dişte çürük) verilmişse, JSON kısmında SADECE 20 numaralı dişin bilgisini ver. Asla gereksiz yere sağlam dişleri listeye ekleme.

══════════════════════════════════════
ÇOK KRİTİK - YAPILANDIRILMIŞ VERİ (JSON ÇIKTISI):
══════════════════════════════════════
ZORUNLU KURAL 0 (ANTI-HALÜSİNASYON): Klinik teşhislerde Yalancı Pozitif (False Positive) üretmek medikal bir hatadır. Bir radyolüsent alanın patoloji (çürük/kist) olduğundan %100 emin değilsen o dişi ASLA listeye ekleme. Tahmin yürütmek yasaktır.
Raporun en sonuna, aşağıdaki JSON formatında her dişin durumunu içeren bir liste ekle.
ZORUNLU KURAL 1: Bu listeyi ```json ve ``` işaretleri arasına koy.
ZORUNLU KURAL 2: Çıktının en sonu KESİNLİKLE ```json bloğu ile bitmelidir. JSON bloğundan sonra hiçbir açıklama, teşekkür veya ek metin YAZMA.
ZORUNLU KURAL 3: Bir dişte birden fazla durum varsa (örneğin hem dolgulu hem de çürükse), o diş için JSON listesinde birden fazla obje (satır) oluşturabilirsin.

Üst çenede soldan sağa 1'den 16'ya, alt çenede soldan sağa 17'den 32'ye kadar giden diş numaralandırma sistemini kullan (Universal/Sıralı). Sadece patoloji veya tedavi tespit edilen dişleri listele. Sağlıklı dişleri EKLEME.

Her JSON objesi şu alanları içermelidir:
- "tooth_id": Diş numarası (Integer)
- "pathology": "filling", "endo", "extraction", "implant", "missing", "caries", "cyst", "bone_loss", "lesion", "fracture", "resorption", "impacted", "calculus", "gingivitis", "recession", "plaque" değerlerinden BİRİ olmalı.
- "severity": "Düşük", "Orta", "Yüksek", "Kritik"
- "confidence": AI olarak bu tespitten ne kadar emin olduğunun skoru (0.0 ile 1.0 arası Float).
- "description": (İsteğe bağlı) Ek klinik detay (kök ucundaki kist boyutu mm, alveolar kemik kaybı derinliği mm vb.)

Örnek JSON Çıktısı:
```json
[
  {"tooth_id": 14, "pathology": "endo", "severity": "Yüksek", "confidence": 0.95},
  {"tooth_id": 14, "pathology": "cyst", "severity": "Kritik", "confidence": 0.91, "description": "Kök ucunda 6mm radyolüsent periapikal kistik lezyon şüphesi"},
  {"tooth_id": 36, "pathology": "bone_loss", "severity": "Yüksek", "confidence": 0.88, "description": "Mine-çimento sınırından itibaren 4mm kemik kaybı derinliği"},
  {"tooth_id": 16, "pathology": "filling", "severity": "Orta", "confidence": 0.90}
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

    async def _execute_gemini_call(self, image_path: str, rag_context: str = "") -> str:
        """Internal method to execute the actual Gemini API call."""
        if os.getenv("STRESS_TEST_MODE", "false").lower() == "true":
            print("[AURA STRESS TEST]: Mocking 429 Resource Exhausted for Gemini API.")
            raise Exception("429 RESOURCE_EXHAUSTED: Mocked rate limit for cyber resilience testing.")
        
        # Dosya varlık kontrolü (P2: Dosya bulunamadığında anlamlı hata ver)
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Görüntü dosyası bulunamadı: {image_path}")
            
        image_part = self._read_image(image_path)
        
        final_prompt = SYSTEM_PROMPT
        if rag_context:
            final_prompt += f"\n\n[AURA RAG KANITI]:\nAşağıdaki klinik kurallara KESİNLİKLE uy:\n{rag_context}"
            
        contents = [final_prompt, image_part]
        
        # Faz 1: Tiling / Ensembling Entegrasyonu
        from services.preprocessing import DicomPreprocessor
        temp_dir = os.path.join(os.getcwd(), ".tmp_tiles")
        os.makedirs(temp_dir, exist_ok=True)
        tiles = DicomPreprocessor.generate_tiles(image_path, temp_dir)
        
        try:
            for t_path in tiles:
                contents.append(self._read_image(t_path))

            for model_name in MODEL_FALLBACK_CHAIN:
                for attempt in range(1, MAX_RETRIES + 1):
                    try:
                        print(f"[AURA GEMINI]: Model={model_name}, Attempt={attempt}")

                        response = self.client.models.generate_content(
                            model=model_name,
                            contents=contents,
                            config={"temperature": 0.0}
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

        except Exception as outer_e:
            raise outer_e
        finally:
            for t_path in tiles:
                if os.path.exists(t_path):
                    try:
                        os.remove(t_path)
                    except Exception:
                        pass
        raise Exception("All Gemini models exhausted or failed.")

    async def analyze_radiograph(self, image_path: str, patient_query: str = "") -> str:
        """Verilen görüntü dosyasını Gemini Vision ve RAG ile analiz eder.
        
        @sec: P2-2 Circuit Breaker ile korunmaktadır.
        @sec: P3 Asenkron mimari - RAG sorguları event loop'u bloklamaz (asyncio.to_thread).
        """
        if self.client is None:
            return "Sistem Hazır Değil: Gemini API anahtarı ayarlanmamış."

        from services.circuit_breaker import circuit_breaker
        from services.fallback_llm_service import fallback_llm
        import asyncio
        
        rag_ctx = ""
        if patient_query:
            try:
                # RAG modülünü import et
                import sys
                from pathlib import Path
                # rag klasörü root_dir içinde
                sys.path.append(str(Path(__file__).parent.parent))
                from rag.retriever import retrieve_context
                
                # Event loop'u bloklamamak (Red-Flag Rule) için senkron RAG sorgusunu thread'e atıyoruz
                rag_ctx = await asyncio.to_thread(retrieve_context, patient_query)
                print(f"[AURA RAG] Context başarıyla çekildi ({len(rag_ctx)} karakter).")
            except Exception as e:
                print(f"[AURA RAG ERROR] RAG sorgusu başarısız, analiz normal devam edecek: {e}")
                rag_ctx = ""
        
        async def run_with_timeout(path: str, ctx: str):
            # Normal çalışma modu: Gemini Vision API'nin görüntüyü okuyup analiz etmesi için yeterli süre (60 saniye)
            try:
                return await asyncio.wait_for(self._execute_gemini_call(path, ctx), timeout=60.0)
            except asyncio.TimeoutError:
                print("[GEMINI ERROR] 60s Timeout exceeded. Graceful degradation triggered.")
                raise Exception("Gemini Timeout (60s limit exceeded)")
        
        return await circuit_breaker.execute(
            run_with_timeout, 
            fallback_llm.analyze_radiograph_fallback, 
            image_path,
            rag_ctx
        )


    async def verify_conflicts(self, image_path: str, conflicts: list) -> str:
        """
        P2: Reflexion Engine - İkinci Görüş Alınması
        YOLO'nun bulduğu ama Gemini'nin ilk turda kaçırdığı çatışmalı bulguları, 
        Gemini'ye tekrar ve çok daha sert odaklayarak sorar.
        """
        if self.client is None or not conflicts:
            return "[]"
            
        # Çatışma metnini hazırla
        conflict_text = "\n".join([
            f"- {c['tooth_id']} numaralı dişte YOLO motoru %{int(c['confidence']*100)} güvenle '{c['pathology']}' tespit etti." 
            for c in conflicts
        ])
        
        reflexion_prompt = f"""
SEN BİR KONSÜLTASYON (İKİNCİ GÖRÜŞ) KURULUSUN.
Daha önceki raporunda bazı detayları kaçırmış olabilirsin. Bizim hassas YOLO görüntü işleme motorumuz şu bulguları tespit etti:

{conflict_text}

GÖREVİN:
Lütfen SADECE yukarıda numarası verilen dişlere çok daha dikkatli bir şekilde, mikroskobik düzeyde tekrar odaklan. 
YOLO motorunun bulguları doğru mu yoksa bu bir artefakt/yanılsama mı?
Eğer YOLO haklıysa, o dişi listeye dahil et. Eğer YOLO yanılmışsa ve orası kesinlikle sağlıklıysa, dişi listeye EKLEME.

SADECE bu tartışmalı dişlerin sonucunu içeren JSON listesini döndür. Başka hiçbir şey yazma.
Örnek:
```json
[
  {{"tooth_id": 14, "pathology": "cyst", "severity": "Yüksek", "confidence": 0.90, "description": "İkinci Görüş: YOLO haklı, radyolüsensi mevcut"}}
]
```
"""
        try:
            image_part = self._read_image(image_path)
            # Daha küçük, daha ucuz ve hızlı bir model kullanabiliriz (gemini-2.5-flash)
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[reflexion_prompt, image_part],
                config={"temperature": 0.0}
            )
            print(f"[AURA REFLEXION]: İkinci Görüş tamamlandı. Çözülen çatışma sayısı: {len(conflicts)}")
            return response.text
        except Exception as e:
            print(f"[AURA REFLEXION ERROR]: İkinci görüş alınamadı: {e}")
            return "[]"

gemini_service = GeminiAuraService()
