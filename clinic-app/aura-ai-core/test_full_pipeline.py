"""
Tam pipeline teşhis testi: Upload → Storage → Worker → Gemini akışını simüle eder.
"""
import os
import sys
import shutil
import uuid

sys.path.append(os.getcwd())

# 1. Test için bir görüntü bul
test_images_dir = os.path.join(os.getcwd(), "..", "public", "test-images")
print(f"[TEST] Looking for test images in: {os.path.abspath(test_images_dir)}")

test_image = None
for f in os.listdir(test_images_dir) if os.path.exists(test_images_dir) else []:
    if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        test_image = os.path.join(test_images_dir, f)
        break

if not test_image:
    # Yoksa temp klasöründe arayalım
    temp_dir = os.path.join(os.getcwd(), "temp", "scans")
    if os.path.exists(temp_dir):
        for f in os.listdir(temp_dir):
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                test_image = os.path.join(temp_dir, f)
                break

if not test_image:
    print("[TEST FAIL] No test image found. Creating a dummy one is not useful.")
    print("[TEST] Checking mock_storage for previously uploaded files...")
    mock_dir = os.path.join(os.getcwd(), "mock_storage", "scans")
    if os.path.exists(mock_dir):
        files = os.listdir(mock_dir)
        print(f"[TEST] mock_storage/scans contains {len(files)} files: {files[:5]}")
        if files:
            test_image = os.path.join(mock_dir, files[0])
    else:
        print("[TEST] mock_storage/scans doesn't exist")

if not test_image:
    print("[TEST ABORT] No image file found anywhere.")
    sys.exit(1)

print(f"\n[TEST] Using image: {test_image}")
print(f"[TEST] File exists: {os.path.exists(test_image)}")
print(f"[TEST] File size: {os.path.getsize(test_image)} bytes")
print(f"[TEST] Extension: {os.path.splitext(test_image)[1]}")

# 2. Storage Service testi
print("\n=== STORAGE SERVICE TEST ===")
from services.storage_service import storage_service

mock_url = storage_service.upload_file(test_image)
print(f"[TEST] upload_file returned: {mock_url}")
print(f"[TEST] Returned path exists: {os.path.exists(mock_url)}")

# 3. Download test
tmp_dir = os.path.join(os.getcwd(), ".tmp_scans")
os.makedirs(tmp_dir, exist_ok=True)
original_ext = os.path.splitext(mock_url)[1].lower() or ".jpg"
dest_path = os.path.join(tmp_dir, f"test_{uuid.uuid4().hex}{original_ext}")
print(f"[TEST] Downloading to: {dest_path}")

local_file = storage_service.download_file(mock_url, dest_path)
print(f"[TEST] download_file returned: {local_file}")
print(f"[TEST] Downloaded file exists: {os.path.exists(local_file)}")
if os.path.exists(local_file):
    print(f"[TEST] Downloaded file size: {os.path.getsize(local_file)} bytes")

# 4. Gemini test
print("\n=== GEMINI SERVICE TEST ===")
import asyncio
from services.gemini_service import gemini_service

async def test_gemini():
    try:
        result = await gemini_service.analyze_radiograph(local_file)
        if "SİSTEM UYARISI" in result:
            print(f"[TEST GEMINI FAILED] Fallback triggered!")
            print(f"[TEST] First 200 chars: {result[:200]}")
        else:
            print(f"[TEST GEMINI SUCCESS!]")
            print(f"[TEST] First 300 chars: {result[:300]}")
    except Exception as e:
        print(f"[TEST GEMINI EXCEPTION] {type(e).__name__}: {e}")

asyncio.run(test_gemini())

# Cleanup
if os.path.exists(dest_path):
    os.remove(dest_path)
print("\n[TEST COMPLETE]")
