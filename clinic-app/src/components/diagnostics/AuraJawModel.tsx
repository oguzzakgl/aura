'use client';

import React, { useMemo, useRef } from 'react';
import { useGLTF, Float, Environment, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDiagnosticStore } from '@/store/useDiagnosticStore';
import { useTransientStore } from '@/store/useTransientStore';

const FDI_TO_MESH_MAP: Record<number, number> = {
  11: 2,  12: 12, 13: 29, 14: 8,  15: 30, 16: 7,  17: 21, 18: 24,
  21: 3,  22: 20, 23: 25, 24: 14, 25: 26, 26: 13, 27: 4,  28: 19,
  31: 15, 32: 5,  33: 27, 34: 18, 35: 6,  36: 17, 37: 16, 38: 28,
  41: 1,  42: 9,  43: 31, 44: 23, 45: 11, 46: 22, 47: 10, 48: 32
};

export const AuraJawModel = () => {
  const dynamicModelUrl = useDiagnosticStore((state) => state.dynamicModelUrl);
  const isScanning = useDiagnosticStore((state) => state.isScanning);
  const isReconstructing = useDiagnosticStore((state) => state.isReconstructing);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
  const modelPath = dynamicModelUrl 
    ? `${apiUrl}${dynamicModelUrl}` 
    : '/test-images/human_teeth_elite.glb';
  
  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      {/* 🏛️ 3D Çene Sahnesi */}
      <ModelRenderer 
        url={modelPath} 
        isScanning={isScanning} 
        isReconstructing={isReconstructing} 
      />
      {/* 🚀 ZIRHLI TRANSIENT-CONNECTED İMPLANT MESH */}
      <TransientImplant />
    </group>
  );
};

/**
 * 🚀 TRANSIENT IMPLANT MESH:
 * React re-render döngüsünü tetiklemeden doğrudan Three.js render thread'ine koordinat basar.
 */
const TransientImplant = () => {
  const implantRef = useRef<THREE.Mesh>(null);

  React.useEffect(() => {
    // Zustand seçici pub/sub transient mekanizması
    const unsubscribe = useTransientStore.subscribe(
      (state) => {
        const pos = state.implantPosition;
        if (implantRef.current) {
          // React re-render tetiklemeden doğrudan referans matrisine koordinatları uygula
          implantRef.current.position.set(pos.x, pos.y, pos.z);
          implantRef.current.rotation.y = pos.angle * (Math.PI / 180);
          implantRef.current.rotation.z = pos.angle * 0.5 * (Math.PI / 180);
        }
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <mesh ref={implantRef} position={[0, -0.2, 0]}>
      {/* Titanyum Cerrahi İmplant Vidası Simülasyonu */}
      <cylinderGeometry args={[0.08, 0.05, 0.5, 16]} />
      <meshStandardMaterial 
        color="#8E8E93" 
        metalness={0.9} 
        roughness={0.1} 
        emissive="#5856D6" 
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const ModelRenderer = ({ url, isScanning, isReconstructing }: { url: string, isScanning: boolean, isReconstructing: boolean }) => {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const findings = useDiagnosticStore((state) => state.findings);

  const clinicalMaterials = useMemo(() => ({
    teeth: new THREE.MeshStandardMaterial({ 
      color: '#E5E5EA',
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.22,  // Premium yarı şeffaf cam estetiği
      depthWrite: false, // Arka plandaki boyalı dişlerin parıldayarak görünmesini garanti eder
    }),
    extraction: new THREE.MeshStandardMaterial({
      color: '#FF3B30', roughness: 0.8, metalness: 0,
    }),
    caries: new THREE.MeshStandardMaterial({
      color: '#FF3B30', roughness: 0.8, metalness: 0,
    }),
    endo: new THREE.MeshStandardMaterial({
      color: '#FF9F0A', roughness: 0.6, metalness: 0.1,
    }),
    filling: new THREE.MeshStandardMaterial({
      color: '#0066CC', roughness: 0.4, metalness: 0.15,
    }),
    implant: new THREE.MeshStandardMaterial({
      color: '#5856D6', roughness: 0.3, metalness: 0.3,
    }),
    missing: new THREE.MeshStandardMaterial({
      color: '#8E8E93', roughness: 0.9, metalness: 0,
      transparent: true, opacity: 0.4,
    }),
    lesion: new THREE.MeshStandardMaterial({
      color: '#FFD60A', roughness: 0.5, metalness: 0.1,
      emissive: '#FFD60A', emissiveIntensity: 0.15,
    }),
    impacted: new THREE.MeshStandardMaterial({
      color: '#C41E3A', roughness: 0.5, metalness: 0.1,
      emissive: '#C41E3A', emissiveIntensity: 0.1,
    }),
    fracture: new THREE.MeshStandardMaterial({
      color: '#FF6B9D', roughness: 0.6, metalness: 0,
    }),
    resorption: new THREE.MeshStandardMaterial({
      color: '#30D5C8', roughness: 0.5, metalness: 0.1,
    }),
    periodontitis: new THREE.MeshStandardMaterial({
      color: '#FF9F0A', roughness: 0.6, metalness: 0.1,
      emissive: '#FF9F0A', emissiveIntensity: 0.1,
    }),
    bone_loss: new THREE.MeshStandardMaterial({
      color: '#FF9F0A', roughness: 0.6, metalness: 0.1,
      emissive: '#FF9F0A', emissiveIntensity: 0.1,
    }),
    scanning: new THREE.MeshStandardMaterial({ 
      color: '#0066CC', wireframe: true, transparent: true, opacity: 0.4,
    }),
    reconstructing: new THREE.MeshStandardMaterial({ 
      color: '#D2D2D7', wireframe: true, transparent: true, opacity: 0.3,
    })
  }), []);

  const elapsedTimeRef = useRef(0);

  useFrame((state, delta) => {
    // 🛡️ @sec: R3F internal Clock deprecation kalkanı - delta tabanlı zaman birikimi
    elapsedTimeRef.current += delta;
    const time = elapsedTimeRef.current;

    if (isReconstructing && groupRef.current) {
      const pulse = (Math.sin(time * 2) + 1) / 2;
      groupRef.current.scale.setScalar(0.12 + pulse * 0.002);
    }
    if (!isScanning && !isReconstructing && groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 0.3) * 0.02;
    }
  });

  React.useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = (mesh.name || '').toLowerCase();
        
        // 🛡️ Kırılmaz Regex Kalkanı: .stl_X veya _X en son sayısal grubunu yakala
        const match = name.match(/_(\d+)$/) || name.match(/\.stl_(\d+)/);
        const meshIndex = match ? parseInt(match[1]) : 0;
        
        // 🔬 ANATOMİK KOORDİNAT TEŞHİSİ: Her mesh'in sahnedeki gerçek X, Y, Z konumunu logla
        const worldPos = new THREE.Vector3();
        mesh.getWorldPosition(worldPos);
        console.log(`[AURA 3D GEOMETRY]: Mesh: ${mesh.name} (Index: ${meshIndex}) -> Position X: ${worldPos.x.toFixed(4)}, Y: ${worldPos.y.toFixed(4)}, Z: ${worldPos.z.toFixed(4)}`);
        
        let matchedFinding: any = null;
        if (findings && Array.isArray(findings)) {
          matchedFinding = findings.find(f => {
            const tId = f.tooth_id;
            if (tId === undefined || tId === null || tId === '') return false;
            
            // FDI tooth_id'sinin mesh üzerindeki ardışık index karşılığını doğrula
            const expectedMeshIndex = FDI_TO_MESH_MAP[Number(tId)];
            return expectedMeshIndex !== undefined && expectedMeshIndex === meshIndex;
          });
          
          if (matchedFinding) {
            console.log("[AURA 3D MATCH]: Mesh:", name, "(Index:", meshIndex, ") successfully mapped with FDI:", matchedFinding.tooth_id);
          }
        }

        mesh.visible = true; 

        if (isReconstructing) {
          mesh.material = clinicalMaterials.reconstructing;
        } else if (isScanning) {
          mesh.material = clinicalMaterials.scanning;
        } else if (matchedFinding) {
          const pathType = (matchedFinding.pathology || '').toLowerCase();
          const materialKey = pathType as keyof typeof clinicalMaterials;
          const assignedMat = clinicalMaterials[materialKey] || clinicalMaterials.extraction;
          
          // 🛡️ Materyal Klonlama Kalkanı: Her mesh için bağımsız materyal instance'ı oluştur
          const clonedMat = assignedMat.clone();
          if (clonedMat instanceof THREE.MeshStandardMaterial) {
            clonedMat.transparent = false;
            clonedMat.opacity = 1.0;
          }
          mesh.material = clonedMat;
          
          console.log("[AURA 3D COLOR]: Assigned color for", name, "pathology:", pathType);
        } else {
          // Sağlıklı dişlere şık ve hafif şeffaf (Glassmorphism) varsayılan atayarak parlamayı artır
          const healthyMat = clinicalMaterials.teeth.clone();
          mesh.material = healthyMat;
        }
      }
    });
  }, [scene, isScanning, isReconstructing, clinicalMaterials, findings]);

  return (
    <group 
      ref={groupRef}
      onClick={(e: any) => {
        e.stopPropagation();
        const mesh = e.object;
        if (mesh && (mesh as THREE.Mesh).isMesh) {
          const meshName = (mesh.name || '').toLowerCase();
          const match = meshName.match(/_(\d+)$/) || meshName.match(/\.stl_(\d+)/);
          const index = match ? match[1] : '0';
          console.log(`%c[AURA CLICKED TOOTH MESH]: Name: ${mesh.name} -> Mesh Index: ${index}`, "color: #FF9F0A; font-weight: bold; font-size: 14px;");
          alert(`Tıkladığınız Dişin Mesh Numarası: ${index}\nMesh Adı: ${mesh.name}\n\nBu numarayı asistanınıza ileterek 3D haritalandırmayı saniyeler içinde kilitleyebilirsiniz!`);
        }
      }}
    >
      <Center>
        <Float speed={isReconstructing ? 3 : 1} rotationIntensity={0.2} floatIntensity={0.3}>
          <primitive object={scene} scale={0.12} />
        </Float>
      </Center>
    </group>
  );
};
