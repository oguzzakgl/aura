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

# Filter out index 0 (which is the main mesh or gum)
teeth = [m for m in meshes if m['index'] > 0]

# Sort all teeth by Y coordinate descending
teeth_sorted_by_y = sorted(teeth, key=lambda t: t['y'], reverse=True)

# The first 16 with highest Y are Upper teeth!
upper_teeth = teeth_sorted_by_y[:16]
# The remaining 16 with lowest Y are Lower teeth!
lower_teeth = teeth_sorted_by_y[16:]

print(f"Upper teeth isolated: {len(upper_teeth)}")
print(f"Lower teeth isolated: {len(lower_teeth)}")

# Upper teeth: sort by X ascending (Sağ to Sol)
upper_sorted_by_x = sorted(upper_teeth, key=lambda t: t['x'])
upper_fdi = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
upper_mapping = {}
for i, t in enumerate(upper_sorted_by_x):
    upper_mapping[upper_fdi[i]] = t['index']

# Lower teeth: sort by X ascending (Sağ to Sol)
# In standard dental charts:
# Lower left (38 to 31) are on patient's left (our right, high X)
# Lower right (41 to 48) are on patient's right (our left, low X)
# Let's map Lower teeth sorted by X ascending:
# Patient Right (FDI 48 to 41) -> Patient Left (FDI 31 to 38)
# So sorted list from lowest X to highest X represents:
# FDI 48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38 in exact order!
lower_sorted_by_x = sorted(lower_teeth, key=lambda t: t['x'])
lower_fdi = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]
lower_mapping = {}
for i, t in enumerate(lower_sorted_by_x):
    lower_mapping[lower_fdi[i]] = t['index']

# Combine mapping
full_mapping = {**upper_mapping, **lower_mapping}

print("\n--- GENERATED FLAWLESS FDI TO MESH MAP ---")
print("const FDI_TO_MESH_MAP: Record<number, number> = {")
for fdi in sorted(full_mapping.keys()):
    print(f"  {fdi}: {full_mapping[fdi]},")
print("};")
