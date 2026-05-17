import trimesh
import os
import re
import numpy as np

glb_path = "../public/test-images/human_teeth_elite.glb"
if not os.path.exists(glb_path):
    glb_path = "../../public/test-images/human_teeth_elite.glb"

scene = trimesh.load(glb_path)

meshes = []
# Iterate through scene geometry nodes to apply actual world transformations
for node_name in scene.graph.nodes_geometry:
    # Get geometry transform matrix in scene world coordinates
    transform, geometry_name = scene.graph[node_name]
    geom = scene.geometry[geometry_name]
    
    # Calculate centroid of the local geometry
    local_centroid = geom.centroid
    # Transform local centroid to world coordinates using the transform matrix!
    world_centroid = trimesh.transformations.transform_points([local_centroid], transform)[0]
    
    match = re.search(r'_(\d+)$', geometry_name)
    index = int(match.group(1)) if match else 0
    meshes.append({
        'name': geometry_name,
        'index': index,
        'x': world_centroid[0],
        'y': world_centroid[1],
        'z': world_centroid[2]
    })

# Filter out index 0
teeth = [m for m in meshes if m['index'] > 0]

# Deduplicate meshes if any
unique_teeth = {}
for t in teeth:
    unique_teeth[t['index']] = t
teeth = list(unique_teeth.values())

# Sort all teeth by Y coordinate descending (isolates Upper and Lower jaws)
teeth_sorted_by_y = sorted(teeth, key=lambda t: t['y'], reverse=True)
upper_teeth = teeth_sorted_by_y[:16]
lower_teeth = teeth_sorted_by_y[16:]

print(f"World Upper teeth count: {len(upper_teeth)}")
print(f"World Lower teeth count: {len(lower_teeth)}")

# Upper teeth: sort by X descending (Sağ to Sol)
upper_sorted_by_x = sorted(upper_teeth, key=lambda t: t['x'], reverse=True)
upper_fdi = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
upper_mapping = {}
for i, t in enumerate(upper_sorted_by_x):
    upper_mapping[upper_fdi[i]] = t['index']

# Lower teeth: sort by X descending (Sağ to Sol)
lower_sorted_by_x = sorted(lower_teeth, key=lambda t: t['x'], reverse=True)
lower_fdi = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
lower_mapping = {}
for i, t in enumerate(lower_sorted_by_x):
    lower_mapping[lower_fdi[i]] = t['index']

# Combine mapping
full_mapping = {**upper_mapping, **lower_mapping}

print("\n--- GENERATED TRANSFORMATION-CORRECTED FDI TO MESH MAP ---")
print("const FDI_TO_MESH_MAP: Record<number, number> = {")
for fdi in sorted(full_mapping.keys()):
    print(f"  {fdi}: {full_mapping[fdi]},")
print("};")
