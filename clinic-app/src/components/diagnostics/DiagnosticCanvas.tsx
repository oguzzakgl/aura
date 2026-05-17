'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { AuraJawModel } from './AuraJawModel';
import { useDiagnosticStore } from '@/store/useDiagnosticStore';

const DiagnosticCanvas = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 🛡️ @sec: THREE.Clock Deprecation Siber Log Filtre Kalkanı
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('THREE.Clock')) {
        return; // Deprecate uyarısını sessizce yut!
      }
      originalWarn(...args);
    };

    setMounted(true);
    
    return () => {
      console.warn = originalWarn; // Cleanup kalkanı
    };
  }, []);

  if (!mounted) return (
    <div className="w-full h-full bg-[#F5F5F7] flex items-center justify-center">
      <div className="text-[#0066CC] animate-pulse font-bold tracking-widest uppercase">
        Aura Initializing...
      </div>
    </div>
  );

  return (
    <div className="relative w-full h-full">
      {/* 🏛️ CLINICAL 3D VIEWPORT */}
      <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 35 }}>
        <color attach="background" args={['#000000']} />
        
        <React.Suspense fallback={null}>
          <AuraJawModel />
          <ContactShadows 
            position={[0, -1.2, 0]} 
            opacity={0.15} 
            scale={8} 
            blur={2.5} 
            far={4} 
          />
          <Environment preset="studio" />
        </React.Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={2.5} 
          maxDistance={6} 
          makeDefault 
        />
        
        {/* Soft Studio Lighting */}
        <ambientLight intensity={0.8} />
        <spotLight position={[5, 10, 5]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#0066CC" />
      </Canvas>
    </div>
  );
};

export default DiagnosticCanvas;
