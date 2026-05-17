import trimesh
import os

glb_path = "../public/test-images/human_teeth_elite.glb"
if not os.path.exists(glb_path):
    # Try alternate path
    glb_path = "../../public/test-images/human_teeth_elite.glb"

print(f"Loading GLB from: {glb_path}")
scene = trimesh.load(glb_path)
print("Mesh names in GLB:")
count = 0
for name in scene.geometry.keys():
    if "tooth" in name.lower() or "_" in name:
        print(f"- {name}")
        count += 1
print(f"Total matching meshes: {count}")
