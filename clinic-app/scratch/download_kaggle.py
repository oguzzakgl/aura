import kagglehub
import shutil
import os

# Download the latest version
print("Downloading dental radiography dataset from Kaggle...")
path = kagglehub.dataset_download("imtkaggleteam/dental-radiography")

print(f"Dataset downloaded to: {path}")

# Source and Destination
dest_dir = "public/test-images/kaggle"

# Try to find images in the downloaded path
# We'll just copy the first few images we find to keep it light
count = 0
for root, dirs, files in os.walk(path):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.dcm', '.dicom')):
            src_file = os.path.join(root, file)
            # Rename for clarity
            dest_file = os.path.join(dest_dir, f"kaggle_sample_{count}{os.path.splitext(file)[1]}")
            shutil.copy(src_file, dest_file)
            print(f"Copied: {file} -> {dest_file}")
            count += 1
            if count >= 5: # Limit to 5 samples for now
                break
    if count >= 5:
        break

print(f"Successfully copied {count} Kaggle samples to {dest_dir}")
