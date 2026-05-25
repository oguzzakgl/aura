# Görüntü İşleme ve Yapay Zeka Araştırma Deposu (Computer Vision & AI)

Bu dosya, röntgenlerdeki pikselleri analiz eden, segmentasyon (boyama) ve nesne tespiti (bounding box) yapan yapay zeka modelleri için bir araştırma günlüğüdür. Bu projeler RAG (metin okuma) için değil, doğrudan YOLO modelimizin yanına "Görsel Asistan" olarak entegre edilmek içindir.

## 1. Multi-Domain Explainable AI Radiology Assistant
*   **Bağlantı:** [x-ai_chest](https://github.com/rakshitnarang018/x-ai_chest)
*   **Kullanım Alanı:** Bounding Box tespitinin yanında ısı haritası (Heatmap / Grad-CAM / LIME) oluşturmak ve "Hastalık Şiddeti (Severity Scoring)" algoritmasını Aura'ya entegre etmek için harika bir ilham kaynağı.

## 2. U-Net ile Diş Segmentasyonu
*   **Bağlantı:** [Segmentation-of-Teeth-in-Panoramic-X-ray-Image-Using-U-Net](https://github.com/SerdarHelli/Segmentation-of-Teeth-in-Panoramic-X-ray-Image-Using-U-Net)
*   **Kullanım Alanı:** Panoramik röntgenlerde her bir dişi farklı renkte piksel piksel boyamak (Maskeleme). Kullanıcıya (hastaya) görsel şölen sunmak için YOLO tespitinin yanına eklenebilir.

## 3. Mask R-CNN ile DentiAssist (Simurg AI Lab)
*   **Bağlantı:** [automatic-dental-segmentation-module](https://github.com/simurgailab/automatic-dental-segmentation-module)
*   **Kullanım Alanı:** U-Net'e alternatif olarak Mask R-CNN tabanlı diş bölütleme modülü. Anatomi eğitimi ve dişlerin sınırlarını hatasız çizmek için incelenebilir.

## 4. 3D CBCT (Tomografi) Segmentasyonu
*   **Bağlantı:** [SlicerDentalSegmentator](https://github.com/gaudot/SlicerDentalSegmentator)
*   **Kullanım Alanı:** Gelecekte Aura AI sistemine "3 Boyutlu Tomografi (CBCT) Analizi" ekleneceği zaman sıfırdan yazmak yerine doğrudan 3D Slicer altyapısıyla entegre edilecek altın değerinde depo.

## 5. Diş Gruplama (Tooth Group Network)
*   **Bağlantı:** [ToothGroupNetwork](https://github.com/limhoyeon/ToothGroupNetwork)
*   **Kullanım Alanı:** Dişlerin birbirine olan uzaklığı ve konumundan "FDI Diş Numarası" tahmini yapmak (Örn: Bu 36 numara, bu 11 numara) için matematiksel grafik (Graph) algoritmaları.

## 6. Klasik Diş Tespiti (Faster R-CNN)
*   **Bağlantı:** [tooth-detection](https://github.com/clemkoa/tooth-detection)
*   **Kullanım Alanı:** Hastalık yerine sadece dişlerin varlığını tespit eden kutulama modeli. Mevcut YOLOv8 sistemimiz çok daha ileri seviyede olsa da, mimari farklılıkları incelemek için tutulmalıdır.

## 💼 Sektörel Analiz ve Ticari Rakipler
*   **Bağlantı:** [AI-Powered Dental Software in 2025](https://www.analyticsvidhya.com/blog/2025/09/ai-powered-dental-software/)
*   **Özet:** Bu makale akademik bir projeden ziyade, 2025 yılında milyar dolarlık pazar değerine ulaşan ticari dental yapay zeka yazılımlarını (Overjet, Denti.ai, Dentrix Ascend, Medecro.ai vb.) incelemektedir. Bu makale, bizim Aura AI ile inşa ettiğimiz sistemin aslında şu an piyasada devasa bir pazar payına ve talebe sahip olduğunu doğrulayan bir piyasa araştırması (Market Research) niteliğindedir.
