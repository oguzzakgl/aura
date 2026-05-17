import trimesh
import os

def convert_dental_raw_to_glb():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    raw_dir = os.path.join(base_dir, "temp")
    output_path = os.path.join(base_dir, "..", "public", "test-images", "human_teeth_elite.glb")

    print(f"--- Aura A.R.E. Smart Filter Started: {raw_dir}")

    scene = trimesh.Scene()
    
    stl_files = [f for f in os.listdir(raw_dir) if f.lower().endswith('.stl')]
    
    if not stl_files:
        print("ERROR: No STL SubTools found!")
        return

    # Önce en büyük dosyayı (genellikle dişler) bulalım
    stl_files.sort(key=lambda x: os.path.getsize(os.path.join(raw_dir, x)), reverse=True)
    
    # Sadece en büyük dosyayı (Dişler) parçalara bölüp kullanıyoruz. 
    # Diğerleri (SubTool2 vb.) eğer duplicate ise sahneyi bozuyor.
    primary_file = stl_files[0]
    print(f"  -> Processing Primary Unit: {primary_file}")
    
    path = os.path.join(raw_dir, primary_file)
    mesh = trimesh.load(path)
    
    # 🧬 SEGMENTASYON
    print(f"  -> Segmenting {primary_file} into individual shells...")
    individual_teeth = mesh.split(only_watertight=False)
    print(f"     Detected {len(individual_teeth)} units.")
    
    for i, tooth in enumerate(individual_teeth):
        scene.add_geometry(tooth, node_name=f"tooth_{i+1}")

    # 🛡️ ZIRH: Eğer 2. bir dosya varsa ve boyutu 1.den çok küçükse (muhtemelen diş etidir) ekle
    # Ama eğer o da devasa bir dosyaysa, muhtemelen duplicate'tir, EKLEME.
    if len(stl_files) > 1:
        secondary_file = stl_files[1]
        size1 = os.path.getsize(os.path.join(raw_dir, primary_file))
        size2 = os.path.getsize(os.path.join(raw_dir, secondary_file))
        
        # Eğer 2. dosya 1.nin %30'undan daha küçükse diş eti olma ihtimali yüksektir
        if size2 < (size1 * 0.4):
            print(f"  -> Adding Secondary Anatomical Feature (Gums): {secondary_file}")
            mesh2 = trimesh.load(os.path.join(raw_dir, secondary_file))
            scene.add_geometry(mesh2, node_name="subtool2")
        else:
            print(f"  !! Skipping Duplicate Ghost Model: {secondary_file}")

    print(f"  -> Total clinical units in final scene: {len(scene.geometry)}")

    scene.apply_translation(-scene.centroid)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    scene.export(output_path, file_type='glb')
    
    print(f"SUCCESS! Clean Single Model sealed at: {output_path}")

if __name__ == "__main__":
    convert_dental_raw_to_glb()
