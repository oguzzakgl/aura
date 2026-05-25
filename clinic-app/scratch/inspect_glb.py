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
    
    bounds = geom.bounds
    local_center = (bounds[0] + bounds[1]) / 2.0
    world_center = trimesh.transformations.transform_points([local_center], transform)[0]
    
    match = re.search(r'_(\d+)$', geometry_name)
    index = int(match.group(1)) if match else 0
    if index > 0:
        meshes.append({
            'index': index,
            'x': world_center[0],
            'y': world_center[1],
            'z': world_center[2]
        })

unique_teeth = {}
for t in meshes:
    unique_teeth[t['index']] = t
teeth = list(unique_teeth.values())

print("INDEX | X | Y | Z")
for t in sorted(teeth, key=lambda x: x['index']):
    print(f"{t['index']:2d} | {t['x']:6.2f} | {t['y']:6.2f} | {t['z']:6.2f}")
