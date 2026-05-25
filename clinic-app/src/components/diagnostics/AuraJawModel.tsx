'use client';

import React, { useMemo, useRef } from 'react';
import { useGLTF, Float, Environment, Center, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDiagnosticStore } from '@/store/useDiagnosticStore';
import { useTransientStore } from '@/store/useTransientStore';



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
    // 1. KUSURSUZ SPATIAL K-NN HARİTALAMA (Geometrik Uzamsal Kilitleme)
    // Mesh isimleri (tooth1, root_1) tutarsız olduğu için isimleri tamamen yok sayıyoruz.
    // Her mesh'in 3D uzaydaki fiziksel merkezi hesaplanıp, ideal anatomik koordinatlara en yakın (Nearest Neighbor) dişe kilitleniyor.
    const IDEAL_TEETH = [
      // Üst Sağ Çene
      { uId: 1, x: -9.63, y: 5.52, z: 0.16 }, { uId: 2, x: -9.16, y: 5.86, z: 3.03 },
      { uId: 3, x: -8.48, y: 5.60, z: 5.82 }, { uId: 4, x: -7.88, y: 5.07, z: 8.13 },
      { uId: 5, x: -6.97, y: 4.97, z: 10.11 }, { uId: 6, x: -5.82, y: 5.59, z: 11.83 },
      { uId: 7, x: -3.97, y: 5.02, z: 13.22 }, { uId: 8, x: 0.02, y: 2.21, z: 14.46 },
      // Üst Sol Çene
      { uId: 9, x: 0.02, y: 4.68, z: 13.90 }, { uId: 10, x: 4.04, y: 5.02, z: 13.21 },
      { uId: 11, x: 5.86, y: 5.59, z: 11.84 }, { uId: 12, x: 7.02, y: 4.97, z: 10.11 },
      { uId: 13, x: 7.93, y: 5.07, z: 8.13 }, { uId: 14, x: 8.52, y: 5.60, z: 5.82 },
      { uId: 15, x: 9.21, y: 5.86, z: 3.03 }, { uId: 16, x: 9.66, y: 5.52, z: 0.17 },
      // Alt Sol Çene
      { uId: 17, x: 9.81, y: 0.38, z: -0.82 }, { uId: 18, x: 9.01, y: -0.41, z: 2.16 },
      { uId: 19, x: 8.24, y: -0.73, z: 5.23 }, { uId: 20, x: 7.60, y: -0.57, z: 7.62 },
      { uId: 21, x: 6.71, y: -0.85, z: 9.56 }, { uId: 22, x: 5.43, y: -1.74, z: 11.07 },
      { uId: 23, x: 3.49, y: -1.42, z: 12.41 }, { uId: 24, x: 0.02, y: -1.61, z: 12.48 },
      // Alt Sağ Çene (Not: 25 modelde eksik, o yüzden 24 ile aynı yere kilitlenir)
      { uId: 25, x: -0.02, y: -1.61, z: 12.48 }, { uId: 26, x: -3.45, y: -1.46, z: 12.41 },
      { uId: 27, x: -5.39, y: -1.73, z: 11.05 }, { uId: 28, x: -6.67, y: -0.85, z: 9.56 },
      { uId: 29, x: -7.55, y: -0.57, z: 7.62 }, { uId: 30, x: -8.20, y: -0.73, z: 5.23 },
      { uId: 31, x: -8.97, y: -0.41, z: 2.16 }, { uId: 32, x: -9.76, y: 0.39, z: -0.82 }
    ];

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        
        const center = new THREE.Vector3();
        mesh.geometry.boundingBox?.getCenter(center);
        
        // R3F sahne rotasyonlarını/scale'lerini iptal et ve raw GLB kök koordinatını bul
        mesh.updateWorldMatrix(true, false);
        scene.updateWorldMatrix(true, false);
        const localToGlbMatrix = new THREE.Matrix4().copy(scene.matrixWorld).invert().multiply(mesh.matrixWorld);
        center.applyMatrix4(localToGlbMatrix);

        // En yakın ideal anatomik koordinatı bul (Euclidean Distance)
        let closestUId = 1;
        let minDist = Infinity;
        
        IDEAL_TEETH.forEach(ideal => {
          const dx = center.x - ideal.x;
          const dy = center.y - ideal.y;
          const dz = center.z - ideal.z;
          const dist = dx * dx + dy * dy + dz * dz;
          if (dist < minDist) {
            minDist = dist;
            closestUId = ideal.uId;
          }
        });

        // 50 birim karesinden uzaksa bu diş değil, başka bir modeldir, atla.
        if (minDist < 50.0) {
          mesh.userData.universalId = closestUId;
        }
      }
    });

    // 2. Teşhisleri Uygula
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const uId = mesh.userData.universalId;
        
        if (!uId) return;

        mesh.visible = true; 

        let matchedFinding: any = null;
        if (findings && Array.isArray(findings)) {
          matchedFinding = findings.find(f => {
            const tId = f.tooth_id;
            if (tId === undefined || tId === null) return false;
            
            // 24 ve 25 numaralı dişler (Alt Santraller) 3D modelde tek bir obje (Mesh 15) olarak birleşiktir.
            // Bu nedenle uId 24 olan bu mesh, hem 24 hem de 25 numaralı teşhislerde boyanacaktır.
            let searchId = Number(tId);
            if (searchId === 25 && uId === 24) return true;
            
            return searchId === uId;
          });
        }

        if (isReconstructing) {
          mesh.material = clinicalMaterials.reconstructing;
        } else if (isScanning) {
          mesh.material = clinicalMaterials.scanning;
        } else if (matchedFinding) {
          const pathType = (matchedFinding.pathology || '').toLowerCase();
          const materialKey = pathType as keyof typeof clinicalMaterials;
          const assignedMat = clinicalMaterials[materialKey] || clinicalMaterials.extraction;
          
          const clonedMat = assignedMat.clone();
          if (clonedMat instanceof THREE.MeshStandardMaterial) {
            clonedMat.transparent = false;
            clonedMat.opacity = 1.0;
          }
          mesh.material = clonedMat;
        } else {
          mesh.material = clinicalMaterials.teeth.clone();
        }
      }
    });
  }, [scene, isScanning, isReconstructing, clinicalMaterials, findings]);

  return (
    <group 
      ref={groupRef}
      onPointerDown={(e: any) => {
        e.stopPropagation();
        const mesh = e.object;
        if (mesh && (mesh as THREE.Mesh).isMesh) {
          const uId = mesh.userData.universalId || 'Atanmadı';
          
          if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
          const center = new THREE.Vector3();
          mesh.geometry.boundingBox?.getCenter(center);
          mesh.updateWorldMatrix(true, false);
          scene.updateWorldMatrix(true, false);
          const localToGlbMatrix = new THREE.Matrix4().copy(scene.matrixWorld).invert().multiply(mesh.matrixWorld);
          center.applyMatrix4(localToGlbMatrix);

          console.log(`[AURA DEBUG] Mesh: ${mesh.name} | uId: ${uId} | X:${center.x.toFixed(2)} Y:${center.y.toFixed(2)} Z:${center.z.toFixed(2)}`);
          alert(`Tıkladığınız Diş:\nİsim: ${mesh.name}\nAtanan Universal ID: ${uId}\nKoordinat: X:${center.x.toFixed(2)}, Y:${center.y.toFixed(2)}, Z:${center.z.toFixed(2)}\n\nLütfen bunu asistanınıza iletin!`);
        }
      }}
    >
      <Center>
        <Float speed={isReconstructing ? 3 : 1} rotationIntensity={0.2} floatIntensity={0.3}>
          <primitive object={scene} scale={0.12} />
        </Float>
        <Html position={[0, 1.8, 0]} center>
          <div className="bg-black/85 backdrop-blur-md border border-emerald-500 text-white px-5 py-3 rounded-2xl shadow-lg flex flex-col items-center gap-1 min-w-[240px] pointer-events-none transition-all duration-300">
            <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Aura 3D Teşhis Modu</span>
            <span className="text-[11px] text-gray-400 mt-1">İmplant veya bulguları 3D inceleyin</span>
          </div>
        </Html>
      </Center>
    </group>
  );
};
