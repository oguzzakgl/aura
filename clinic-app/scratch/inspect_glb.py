import trimesh
import os
import re

glb_path = "../public/test-images/human_teeth_elite.glb"
if not os.path.exists(glb_path):
    glb_path = "../../public/test-images/human_teeth_elite.glb"

scene = trimesh.load(glb_path)

meshes = []
for node_name in scene.graph.nodes_geometry:
    transform, geometry_name = scene.graph[node_name]
    geom = scene.geometry[geometry_name]
    
    # Volumetric Bounding Box Center
    bounds = geom.bounds
    local_center = (bounds[0] + bounds[1]) / 2.0
    world_center = trimesh.transformations.transform_points([local_center], transform)[0]
    
    match = re.search(r'_(\d+)$', geometry_name)
    index = int(match.group(1)) if match else 0
    meshes.append({
        'index': index,
        'x': world_center[0],
        'y': world_center[1],
        'z': world_center[2]
    })

# Deduplicate
unique_teeth = {}
for t in meshes:
    if t['index'] > 0:
        unique_teeth[t['index']] = t
teeth = list(unique_teeth.values())

# 🛡️ ÇİFT KAYDIRMA KALKANI: Mesh 12'yi alt çeneye, Mesh 1'i üst çeneye kaydırarak simetriyi koru!
for t in teeth:
    if t['index'] == 12:
        t['y'] = 1.0   # Alt çeneye kaydır
    elif t['index'] == 1:
        t['y'] = 4.0   # Üst çeneye kaydır

# Partition based on Y
upper_teeth = [t for t in teeth if t['y'] > 3.0]
lower_teeth = [t for t in teeth if t['y'] <= 3.0]

print(f"Upper sorted size: {len(upper_teeth)}")
print(f"Lower sorted size: {len(lower_teeth)}")

fdi_to_mesh = {}

# Upper: Universal 1-16
# X koordinatı en büyük olandan (bizim vizörde solumuz - hastanın sağ arka tarafı) en küçüğe doğru sırala
upper_sorted = sorted(upper_teeth, key=lambda t: t['x'], reverse=True)
upper_fdis = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
for idx, fdi in enumerate(upper_fdis):
    mesh_idx = upper_sorted[idx]['index']
    fdi_to_mesh[fdi] = mesh_idx

# Lower: Universal 17-32 (Soldan Sağa - X koordinatı en büyükten en küçüğe)
lower_sorted = sorted(lower_teeth, key=lambda t: t['x'], reverse=True)
lower_fdis = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
for idx, fdi in enumerate(lower_fdis):
    mesh_idx = lower_sorted[idx]['index']
    fdi_to_mesh[fdi] = mesh_idx

print("\n--- GENERATED UNIVERSAL SPATIAL FDI TO MESH MAP ---")
print("const FDI_TO_MESH_MAP: Record<number, number> = {")
for fdi in sorted(fdi_to_mesh.keys()):
    print(f"  {fdi}: {fdi_to_mesh[fdi]},")
print("};")
