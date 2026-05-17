'use client';

import React, { useMemo, useRef } from 'react';
import { useGLTF, Float, Environment, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useDiagnosticStore } from '@/store/useDiagnosticStore';
import { useTransientStore } from '@/store/useTransientStore';

export const AuraJawModel = () => {
  const dynamicModelUrl = useDiagnosticStore((state) => state.dynamicModelUrl);
  const isScanning = useDiagnosticStore((state) => state.isScanning);
  const isReconstructing = useDiagnosticStore((state) => state.isReconstructing);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
      color: '#D2D2D7',
      roughness: 0.35,
      metalness: 0.05,
      emissive: '#000000',
      emissiveIntensity: 0,
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

  useMemo(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const name = (mesh.name || '').toLowerCase();
        
        const isTooth = name.includes('tooth');
        
        let matchedFinding: any = null;
        if (isTooth && findings && Array.isArray(findings)) {
          matchedFinding = findings.find(f => {
            const tId = f.tooth_id;
            if (tId === undefined || tId === null || tId === '') return false;
            return name.includes(`_${tId}`) || name === `tooth_${tId}`;
          });
        }

        mesh.visible = true; 

        if (isReconstructing) {
          mesh.material = clinicalMaterials.reconstructing;
        } else if (isScanning) {
          mesh.material = clinicalMaterials.scanning;
        } else if (matchedFinding) {
          const pathType = (matchedFinding.pathology || '').toLowerCase();
          const materialKey = pathType as keyof typeof clinicalMaterials;
          mesh.material = clinicalMaterials[materialKey] || clinicalMaterials.extraction;
        } else {
          mesh.material = clinicalMaterials.teeth;
        }
      }
    });
  }, [scene, isScanning, isReconstructing, clinicalMaterials, findings]);

  return (
    <group ref={groupRef}>
      <Center>
        <Float speed={isReconstructing ? 3 : 1} rotationIntensity={0.2} floatIntensity={0.3}>
          <primitive object={scene} scale={0.12} />
        </Float>
      </Center>
    </group>
  );
};
