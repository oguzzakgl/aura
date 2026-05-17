"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import DiagnosticCanvas from '@/components/diagnostics/DiagnosticCanvas';
import { useDiagnosticStore } from '@/store/useDiagnosticStore';
import { AuraClinicalDashboard } from "@/components/diagnostics/AuraClinicalDashboard";
import { Loader2, Activity, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PatientProfilePage() {
  const params = useParams();
  const resetDiagnostic = useDiagnosticStore((state) => state.resetDiagnostic);
  const isReconstructing = useDiagnosticStore((state) => state.isReconstructing);

  // 🛡️ ZIRH: Hasta değiştiğinde tüm tanısal verileri sıfırla
  useEffect(() => {
    resetDiagnostic();
  }, [params.id, resetDiagnostic]);

  return (
    <AuraClinicalDashboard>
      <div className="w-full h-full relative group">
        {/* 🩻 CORE IMAGING CANVAS */}
        <DiagnosticCanvas />

        {/* 🧬 RECONSTRUCTION OVERLAY */}
        <AnimatePresence>
          {isReconstructing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-[#0066CC]/20 border-t-[#0066CC] rounded-full animate-spin" />
                <Activity className="absolute inset-0 m-auto text-[#0066CC] animate-pulse" size={32} />
              </div>
              <h2 className="mt-8 text-2xl font-semibold text-[#1D1D1F]">Dijital İkiz İnşâ Ediliyor</h2>
              <p className="mt-2 text-[#86868B] text-xs font-bold uppercase tracking-widest animate-pulse">
                Aura ARE-v1 • DICOM İşleniyor
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🛰️ STATUS BADGE */}
        <div className="absolute top-8 left-8 z-10 flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-md border border-[#D2D2D7] rounded-full shadow-sm">
          <Zap size={16} className="text-[#0066CC] animate-pulse" />
          <span className="text-[10px] font-black text-[#1D1D1F] uppercase tracking-widest">
            {isReconstructing ? 'Aura Reconstruction Aktif' : 'Aura Klinik Modu'}
          </span>
        </div>
      </div>
    </AuraClinicalDashboard>
  );
}
