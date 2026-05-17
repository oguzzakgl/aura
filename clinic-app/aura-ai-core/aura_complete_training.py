import os
import json
import numpy as np
import cv2
import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# 🛡️ ZIRH: GPU Bellek Yönetimi (Aura CUDA Optimization)
gpus = tf.config.experimental.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print("🏛️ [AURA GPU ENGINE]: OPTIMIZED AND SECURED")
    except RuntimeError as e:
        print(f"⚠️ [GPU CONFIG ERROR]: {e}")

# 🏛️ SETTINGS: Clinical Core Configuration
DATASET_PATH = "/kaggle/input/datasets/lemhui/dentex/training_data/training_data/quadrant_enumeration/xrays"
IMG_SIZE = (512, 512)
BATCH_SIZE = 8
EPOCHS = 30
NUM_CLASSES = 4 # Background, Caries (Çürük), Canal (Kanal), Impacted (Gömülü)

def load_and_preprocess(img_path):
    """
    Cerrahi Ön-İşleme: Görüntü ve Maske Senkronizasyonu
    """
    img_path = img_path.numpy().decode('utf-8')
    json_path = img_path.replace('.png', '.json')
    
    # Image Loading
    img = cv2.imread(img_path)
    if img is None:
        return np.zeros((*IMG_SIZE, 3), dtype=np.float32), np.zeros((*IMG_SIZE, 1), dtype=np.float32)
    
    img = cv2.resize(img, IMG_SIZE)
    img = img.astype(np.float32) / 255.0
    
    # Mask Generation
    mask = np.zeros((*IMG_SIZE, 1), dtype=np.float32)
    
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            h, w = data.get('imageHeight', 1316), data.get('imageWidth', 2829)
            
            for shape in data['shapes']:
                label = shape['label'].lower()
                points = np.array(shape['points'])
                
                # Rescale points to IMG_SIZE
                points[:, 0] = points[:, 0] * (IMG_SIZE[1] / w)
                points[:, 1] = points[:, 1] * (IMG_SIZE[0] / h)
                
                # Clinical Classification
                val = 0
                if 'çürük' in label or 'caries' in label: val = 1
                elif 'kanal' in label or 'canal' in label: val = 2
                elif 'gömülü' in label or 'impacted' in label: val = 3
                
                if val > 0:
                    cv2.fillPoly(mask, [points.astype(np.int32)], val)
        except Exception as e:
            print(f"⚠️ [JSON PARSE ERROR]: {json_path} -> {e}")
            
    return img, mask

def tf_parse_function(img_path):
    """TensorFlow data pipeline entegrasyonu"""
    [img, mask] = tf.py_function(load_and_preprocess, [img_path], [tf.float32, tf.float32])
    img.set_shape((*IMG_SIZE, 3))
    mask.set_shape((*IMG_SIZE, 1))
    return img, mask

def build_aura_diagnostic_net(input_shape=(512, 512, 3)):
    """
    Aura Diagnostic U-Net: Diş yapısı için optimize edilmiş derin mimari
    """
    def conv_block(x, filters):
        x = layers.Conv2D(filters, 3, padding="same")(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation("relu")(x)
        x = layers.Conv2D(filters, 3, padding="same")(x)
        x = layers.BatchNormalization()(x)
        x = layers.Activation("relu")(x)
        return x

    def encoder_block(x, filters):
        s = conv_block(x, filters)
        p = layers.MaxPooling2D((2, 2))(s)
        return s, p

    def decoder_block(x, skip, filters):
        x = layers.Conv2DTranspose(filters, (2, 2), strides=2, padding="same")(x)
        x = layers.Concatenate()([x, skip])
        x = conv_block(x, filters)
        return x

    inputs = layers.Input(input_shape)

    # Encoder (Downsampling)
    s1, p1 = encoder_block(inputs, 64)
    s2, p2 = encoder_block(p1, 128)
    s3, p3 = encoder_block(p2, 256)
    s4, p4 = encoder_block(p3, 512)

    # Bridge (Bottleneck)
    b1 = conv_block(p4, 1024)

    # Decoder (Upsampling)
    d1 = decoder_block(b1, s4, 512)
    d2 = decoder_block(d1, s3, 256)
    d3 = decoder_block(d2, s2, 128)
    d4 = decoder_block(d3, s1, 64)

    outputs = layers.Conv2D(NUM_CLASSES, 1, activation="softmax")(d4)
    return models.Model(inputs, outputs, name="Aura_Diagnostic_Net")

# 🏛️ PREPARATION: Dataset Discovery
print("🏛️ [AURA CORE]: DISCOVERING CLINICAL SAMPLES...")
all_files = [os.path.join(DATASET_PATH, f) for f in os.listdir(DATASET_PATH) if f.endswith('.png')]
train_files, val_files = train_test_split(all_files, test_size=0.15, random_state=42)

# 🏛️ PIPELINE: High-Performance Data Loader
def get_dataset(files, is_train=True):
    ds = tf.data.Dataset.from_tensor_slices(files)
    if is_train:
        ds = ds.shuffle(len(files))
    ds = ds.map(tf_parse_function, num_parallel_calls=tf.data.AUTOTUNE)
    ds = ds.batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    return ds

train_ds = get_dataset(train_files)
val_ds = get_dataset(val_files, is_train=False)

# 🏛️ MODEL: Build and Compile
print("🏛️ [AURA CORE]: INITIALIZING DIAGNOSTIC NET...")
model = build_aura_diagnostic_net()
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# 🏛️ MONITORING: Elite Callbacks
aura_callbacks = [
    callbacks.ModelCheckpoint("/kaggle/working/best_aura_clinical_model.h5", save_best_only=True, monitor='val_accuracy', mode='max', verbose=1),
    callbacks.EarlyStopping(monitor='val_loss', patience=7, restore_best_weights=True, verbose=1),
    callbacks.ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-7, verbose=1),
    callbacks.CSVLogger("/kaggle/working/aura_training_audit.csv")
]

# 🏛️ EXECUTION: Start Training
print(f"🚀 [AURA CORE]: LAUNCHING ELITE TRAINING ON {len(train_files)} SAMPLES")
history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=aura_callbacks
)

# 🏛️ FINALIZATION: Secure Results
print("🏛️ [AURA CORE]: TRAINING COMPLETE. BRAIN IS NOW ELITE.")
model.save("/kaggle/working/aura_brain_final_legacy.h5")
