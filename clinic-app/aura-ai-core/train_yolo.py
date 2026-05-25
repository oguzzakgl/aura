"""
🏛️ AURA YOLOv8 TRAINING ENGINE
Kendi diş röntgeni verilerinizle Aura Bounding Box motorunu eğitmenizi sağlar.

Kullanım Önkoşulu:
1. Roboflow gibi bir kaynaktan veri setini "YOLOv8" formatında indirin.
2. Bu klasörün içine `datasets/dental_data` şeklinde kopyalayın.
3. İçindeki `data.yaml` dosyasının yolunu aşağıdaki `DATA_YAML_PATH` değişkenine yazın.
"""

import os
import shutil
try:
    from ultralytics import YOLO
except ImportError:
    print("[HATA] ultralytics kütüphanesi yüklü değil. Kurmak için: pip install ultralytics")
    exit(1)

# Ayarlar
DATA_YAML_PATH = r"c:\Users\oguz\Desktop\dentaldata\data.yaml"
EPOCHS = 100       # Eğitim turu sayısı (kalite için 50-100 önerilir)
IMG_SIZE = 640    # Görüntü boyutu (YOLOv8 standartı)
BATCH_SIZE = 16    # GPU belleğinize göre artırabilirsiniz (16, 32)
BASE_MODEL = "yolov8n.pt" # "n" = nano (en hızlısı). İsteğe göre "s" veya "m" kullanılabilir.

def main():
    print("🏛️ [AURA YOLO TRAINER] Eğitim motoru başlatılıyor...")
    
    if not os.path.exists(DATA_YAML_PATH):
        print(f"⚠️ [UYARI] Veri seti bulunamadı: {DATA_YAML_PATH}")
        print("Lütfen eğitim için YOLOv8 formatında etiketlenmiş veri setini indirin ve yolu ayarlayın.")
        return

    # Modeli Yükle (Transfer Learning)
    print(f"[1/3] Temel model {BASE_MODEL} yükleniyor...")
    model = YOLO(BASE_MODEL)
    
    # Eğitimi Başlat
    print(f"[2/3] Eğitim başlatılıyor... ({EPOCHS} Epoch)")
    results = model.train(
        data=DATA_YAML_PATH,
        epochs=EPOCHS,
        imgsz=IMG_SIZE,
        batch=BATCH_SIZE,
        device="cpu", # Bilgisayarda GPU olmadığı (veya CUDA kurulu olmadığı) için işlemci gücü kullanılacak
        patience=15, # [ANTI-OVERFITTING] 15 tur boyunca iyileşme olmazsa eğitimi otomatik kes
        dropout=0.1, # [ANTI-HALÜSİNASYON] Yapay zekanın ezberlemesini engelleyen unutma faktörü
        project="models",
        name="aura_yolo_run",
        exist_ok=True # Aynı isimli klasör varsa üzerine yazar
    )
    
    # En iyi ağırlıkları ana modele kopyala
    best_weights_path = os.path.join("models", "aura_yolo_run", "weights", "best.pt")
    target_path = os.path.join("models", "best_yolo_dental.pt")
    
    print("[3/3] Eğitim bitti. En iyi ağırlıklar güvence altına alınıyor...")
    if os.path.exists(best_weights_path):
        shutil.copy2(best_weights_path, target_path)
        print(f"✅ Başarılı! Yeni Aura Bounding Box modeliniz hazır: {target_path}")
    else:
        print("❌ Eğitim başarısız oldu veya best.pt dosyası üretilemedi.")

if __name__ == "__main__":
    main()
