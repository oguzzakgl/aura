import trimesh
import os
import re
import numpy as np

glb_path = "../public/test-images/human_teeth_elite.glb"
if not os.path.exists(glb_path):
    glb_path = "../../public/test-images/human_teeth_elite.glb"

scene = trimesh.load(glb_path)

meshes = []
for node_name in scene.graph.nodes_geometry:
    transform, geometry_name = scene.graph[node_name]
    geom = scene.geometry[geometry_name]
    
    # 🔬 VOLUMETRIC BOUNDS SOLVER: Pivot kaymasını bypass etmek için asıl vertex sınırlarını oku!
    bounds = geom.bounds
    local_center = (bounds[0] + bounds[1]) / 2.0
    
    # Apply scene graph world transform
    world_center = trimesh.transformations.transform_points([local_center], transform)[0]
    
    match = re.search(r'_(\d+)$', geometry_name)
    index = int(match.group(1)) if match else 0
    meshes.append({
        'name': geometry_name,
        'index': index,
        'x': world_center[0],
        'y': world_center[1],
        'z': world_center[2]
    })

# Filter out index 0
teeth = [m for m in meshes if m['index'] > 0]

# Deduplicate
unique_teeth = {}
for t in teeth:
    unique_teeth[t['index']] = t
teeth = list(unique_teeth.values())

# Sort all teeth by their true volumetric Y coordinate descending
teeth_sorted_by_y = sorted(teeth, key=lambda t: t['y'], reverse=True)
upper_teeth = teeth_sorted_by_y[:16]
lower_teeth = teeth_sorted_by_y[16:]

print(f"Volumetric Upper teeth count: {len(upper_teeth)}")
print(f"Volumetric Lower teeth count: {len(lower_teeth)}")

# Print sorted lists to see the Y partition gap
print("\n--- UPPER TEETH VOLUMETRIC DETAILS ---")
for t in sorted(upper_teeth, key=lambda x: x['y'], reverse=True):
    print(f"Mesh {t['index']}: Y={t['y']:.4f}, X={t['x']:.4f}, Z={t['z']:.4f}")

print("\n--- LOWER TEETH VOLUMETRIC DETAILS ---")
for t in sorted(lower_teeth, key=lambda x: x['y'], reverse=True):
    print(f"Mesh {t['index']}: Y={t['y']:.4f}, X={t['x']:.4f}, Z={t['z']:.4f}")
