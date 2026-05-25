# RAG (Retrieval-Augmented Generation) Araştırma Deposu

Bu dosya, **"Okuyan, Anlayan ve Konuşan"** yapay zeka hafızası (RAG) modülü için araştırma ve notların tutulduğu günlüktür. RAG sistemi piksellerle (röntgen) ilgilenmez; sadece klinik kılavuzları, PDF ders kitaplarını ve kurum standartlarını okuyarak LLM'in (Gemini) kararlarına akademik rehberlik yapar.

## RAG Araştırma Odakları ve Anahtar Kelimeler
Yeni RAG repoları ve mimarileri ararken kullanılacak anahtar kelimeler:
*   `Medical RAG LLM`
*   `Clinical guidelines RAG architecture`
*   `Dental Diagnosis Assistant RAG`
*   `LangChain Medical RAG`

## Mevcut Aura RAG Planımız (Zero-Dependency RAG)
Aura AI için ağır veritabanları (Pinecone, ChromaDB) kurmak yerine, **Google Gemini Text-Embedding-004** ve **Numpy Kosinüs Benzerliği** kullanılarak hafif, maliyetsiz ve yerleşik bir sistem tasarlanmaktadır.

### RAG İçin Toplanacak Veriler (Gelecek Görevler)
Aura'nın hafızasına yüklenmek üzere aşağıdaki dokümanlar toplanmalıdır:
1.  **Kurum Protokolü:** Aura Kliniğinin kendi yazacağı 5-10 sayfalık tanı/teşhis kuralları rehberi.
2.  **Geçmiş Raporlar:** Kliniğin daha önceden yazmış olduğu örnek en iyi 500 hasta teşhis raporu (Anonimleştirilmiş).
3.  **Akademik PDF'ler:** (Opsiyonel) Temel Diş Hekimliği radyoloji kılavuzları (ADA, TDB vb. açık kaynaklı yönergeleri).

*(Not: Bulduğunuz yeni RAG tabanlı repoları doğrudan bu belgenin altına not edebilirsiniz.)*

## 📚 Akademik Makaleler ve Yayınlar
### 1. Retrieval augmented generation in dentistry: potentials, applications, and future directions
*   **Bağlantı:** [PMC12916606](https://pmc.ncbi.nlm.nih.gov/articles/PMC12916606/)
*   **Özet:** Diş hekimliğinde RAG (Bilgi Çıkarımı) sistemlerinin kullanımı, LLM'lerin (Büyük Dil Modelleri) halüsinasyonlarını nasıl engellediği ve diş hekimliğinde radyoloji asistanı olarak kullanılması üzerine çok yeni ve doğrudan bizim inşa ettiğimiz vizyonu anlatan altın standart bir makale.

### 2. Dental Anomaly Recognition on Radiographs Using LLMs
*   **Bağlantı:** [CEUR-WS Vol-4083 Paper55](https://ceur-ws.org/Vol-4083/paper55.pdf)
*   **Özet:** Büyük Dil Modellerini (LLM) kullanarak radyografilerdeki diş anomalilerinin tespiti üzerine yapılmış taze bir akademik çalışma. Bizim `gemini_service.py` içinde uyguladığımız mantığın birebir akademiye yansımış hali. Diş hekimliğinde LLM-Görüntü analizini doğrulamak için mükemmel bir kaynak.

## 💻 Medikal RAG Kod Depoları (İlham Alınacak Projeler)
### 1. Medical RAG using BioMistral 7B (AquibPy)
*   **Bağlantı:** [Medical-RAG-LLM](https://github.com/AquibPy/Medical-RAG-LLM)
*   **Mimari:** BioMistral 7B (LLM), PubMedBert (Gömme), Qdrant (Vektör DB), Langchain.
*   **Aura RAG ile Kıyaslama:** Bu proje, tıp camiasında çok bilinen "Ağır" RAG mimarilerinden biridir. Bilgisayarınıza Llama.cpp ve Qdrant veritabanı kurmanızı gerektirir (çok yüksek donanım ister). Bizim tasarladığımız "Zero-Dependency RAG" ise dışarıya hiç bağımlı olmadan sadece Gemini'nin beyniyle bu işi saniyeler içinde yapar. Ancak eğer gelecekte Aura'yı tamamen internetsiz (Local) çalıştırmak isterseniz, bu deponun mimarisi kullanılmalıdır.
