import trimesh
import os
import re
import numpy as np

glb_path = "../public/test-images/human_teeth_elite.glb"
if not os.path.exists(glb_path):
    glb_path = "../../public/test-images/human_teeth_elite.glb"

scene = trimesh.load(glb_path)

meshes = []
for name, geom in scene.geometry.items():
    centroid = geom.centroid
    match = re.search(r'_(\d+)$', name)
    index = int(match.group(1)) if match else 0
    meshes.append({
        'name': name,
        'index': index,
        'x': centroid[0],
        'y': centroid[1],
        'z': centroid[2]
    })

# Filter out index 0
teeth = [m for m in meshes if m['index'] > 0]

# Sort all teeth by Y coordinate descending (isolates Upper and Lower jaws)
teeth_sorted_by_y = sorted(teeth, key=lambda t: t['y'], reverse=True)
upper_teeth = teeth_sorted_by_y[:16]
lower_teeth = teeth_sorted_by_y[16:]

# 🔬 X-axis Inversion Shield:
# Based on clinical logs, FDI 16 corresponds to mesh Index 7 (which has high X: 34.75)
# Therefore, higher X values correspond to the patient's RIGHT side (FDI 1x and 4x)!
# Lower X values correspond to the patient's LEFT side (FDI 2x and 3x)!

# Upper teeth: sort by X descending (from Patient Right/high X to Patient Left/low X)
upper_sorted_by_x = sorted(upper_teeth, key=lambda t: t['x'], reverse=True)
upper_fdi = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
upper_mapping = {}
for i, t in enumerate(upper_sorted_by_x):
    upper_mapping[upper_fdi[i]] = t['index']

# Lower teeth: sort by X descending (from Patient Right/high X to Patient Left/low X)
# Standard dental FDI chart for lower teeth:
# Lower Right (48 to 41): patient's right side (high X) -> goes from 48 (far right) to 41 (center right)
# Lower Left (31 to 38): patient's left side (low X) -> goes from 31 (center left) to 38 (far left)
# So sorted list from highest X to lowest X represents:
# FDI 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38 in exact order!
lower_sorted_by_x = sorted(lower_teeth, key=lambda t: t['x'], reverse=True)
lower_fdi = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
lower_mapping = {}
for i, t in enumerate(lower_sorted_by_x):
    lower_mapping[lower_fdi[i]] = t['index']

# Combine mapping
full_mapping = {**upper_mapping, **lower_mapping}

print("\n--- GENERATED INVERSION-CORRECTED FDI TO MESH MAP ---")
print("const FDI_TO_MESH_MAP: Record<number, number> = {")
for fdi in sorted(full_mapping.keys()):
    print(f"  {fdi}: {full_mapping[fdi]},")
print("};")
