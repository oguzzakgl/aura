import os
import json
import numpy as np
import cv2
from PIL import Image, ImageDraw
import matplotlib.pyplot as plt

# 🛡️ ZIRH: Kaggle Dosya Yolları
DATASET_PATH = "/kaggle/input/segmentation-teeth-images-and-masks" # Kaggle dataset yolunu kontrol edin
OUTPUT_DIR = "/kaggle/working/aura_masks"
os.makedirs(OUTPUT_DIR, exist_ok=True)

def labelme_json_to_mask(json_path, width, height):
    """
    JSON poligonlarını görsel maskelere (PNG) çevirir.
    """
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Boş bir maske oluştur (0 = Arka plan)
    mask = Image.new('L', (width, height), 0)
    draw = ImageDraw.Draw(mask)
    
    for shape in data['shapes']:
        label = shape['label']
        points = shape['points']
        
        # Etiket tipine göre farklı renk değerleri verilebilir
        # 1: Çürük, 2: Kanal, 3: Gömülü vb.
        color = 255 # Şimdilik ikili (binary) maske için 255
        if 'çürük' in label: color = 1
        elif 'kanal' in label: color = 2
        elif 'gömülü' in label: color = 3
        
        # Poligonu çiz
        flat_points = [tuple(p) for p in points]
        draw.polygon(flat_points, outline=color, fill=color)
        
    return np.array(mask)

# 🚀 ÖN İŞLEME TESTİ
# İlk 5 resmi maskeye çevirip kontrol edelim
print("--- Aura Data Ingest Started ---")
json_files = [f for f in os.listdir(DATASET_PATH) if f.endswith('.json')][:5]

for j_file in json_files:
    img_name = j_file.replace('.json', '.png')
    mask = labelme_json_to_mask(os.path.join(DATASET_PATH, j_file), 2829, 1316)
    cv2.imwrite(os.path.join(OUTPUT_DIR, f"mask_{img_name}"), mask)
    print(f"  -> Generated Mask for: {img_name}")

print(f"SUCCESS: Masks generated in {OUTPUT_DIR}")
