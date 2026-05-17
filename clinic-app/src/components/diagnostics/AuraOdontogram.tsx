"use client";

import React, { useState } from 'react';
import { useDiagnosticStore } from '@/store/useDiagnosticStore';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TOOTH_NUMBERS_UPPER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
const TOOTH_NUMBERS_LOWER = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

const PROCEDURES = [
  { id: 'healthy', label: 'Sağlıklı', color: '#34C759', icon: '💎' },
  { id: 'caries', label: 'Çürük', color: '#FF3B30', icon: '🦠' },
  { id: 'extraction', label: 'Çekilecek', color: '#FF3B30', icon: '🦷' },
  { id: 'endo', label: 'Kanal Tedavisi', color: '#FF9F0A', icon: '🔬' },
  { id: 'filling', label: 'Dolgu', color: '#0066CC', icon: '💧' },
  { id: 'implant', label: 'İmplant', color: '#5856D6', icon: '🔩' },
  { id: 'missing', label: 'Eksik Diş', color: '#48484A', icon: '⬛' },
  { id: 'impacted', label: 'Gömülü Diş', color: '#C41E3A', icon: '🦷' },
  { id: 'lesion', label: 'Lezyon/Kist', color: '#FFD60A', icon: '⚠️' },
  { id: 'fracture', label: 'Kırık', color: '#FF6B9D', icon: '💥' },
  { id: 'resorption', label: 'Rezorpsiyon', color: '#30D5C8', icon: '🔄' },
  { id: 'cyst', label: 'Kistik Lezyon', color: '#AF52DE', icon: '🔮' },
  { id: 'bone_loss', label: 'Kemik Kaybı', color: '#FF9500', icon: '📉' },
];

const MESH_TO_FDI_MAP: Record<number, number> = {
  1: 18, 2: 17, 3: 16, 4: 15, 5: 14, 6: 13, 7: 12, 8: 11,
  9: 21, 10: 22, 11: 23, 12: 24, 13: 25, 14: 26, 15: 27, 16: 28,
  17: 38, 18: 37, 19: 36, 20: 35, 21: 34, 22: 33, 23: 32, 24: 31,
  25: 41, 26: 42, 27: 43, 28: 44, 29: 45, 30: 46, 31: 47, 32: 48
};

export const AuraOdontogram = () => {
  const findings = useDiagnosticStore((state) => state.findings);
  const applyFindings = useDiagnosticStore((state) => state.applyFindings);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  
  const getToothStatus = (universalId: number) => {
    const fdiId = MESH_TO_FDI_MAP[universalId];
    if (!fdiId) return 'healthy';
    
    const finding = findings.find(f => {
      const tId = f.tooth_id;
      if (tId === undefined || tId === null || tId === '') return false;
      return Number(tId) === fdiId;
    });
    if (!finding) return 'healthy';
    
    const path = (finding.pathology || '').toLowerCase();
    if (path === 'periodontitis' || path === 'periodontal') return 'bone_loss';
    return path;
  };

  const handleSelectProcedure = (universalToothId: number, procedureId: string) => {
    const fdiId = MESH_TO_FDI_MAP[universalToothId];
    if (!fdiId) return;

    const newFindings = findings.filter(f => {
      const tId = f.tooth_id;
      if (tId === undefined || tId === null || tId === '') return true;
      return Number(tId) !== fdiId;
    });
    if (procedureId !== 'healthy') {
      newFindings.push({ 
        tooth_id: fdiId, 
        pathology: procedureId, 
        severity: procedureId === 'extraction' ? 'Kritik' : 'Yüksek' 
      });
    }
    applyFindings(newFindings);
    setSelectedTooth(null);
  };

  return (
    <div className="w-full bg-(--surface) p-6 rounded-3xl border border-(--border) shadow-sm relative transition-colors duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-(--foreground)">Odontogram (2D Şema)</h3>
        <div className="flex gap-3 flex-wrap">
           {PROCEDURES.filter(p => p.id !== 'healthy').slice(0, 5).map(p => (
             <LegendItem key={p.id} color={p.color} label={p.label} />
           ))}
        </div>
      </div>

      <div className="space-y-6 relative">
        <div className="relative">
          <p className="text-[9px] font-bold text-(--muted) uppercase tracking-widest mb-2 text-center">Üst Çene</p>
          <div className="flex justify-center gap-1.5">
            {TOOTH_NUMBERS_UPPER.map(num => (
              <ToothItem 
                key={num} 
                id={num} 
                status={getToothStatus(num)} 
                active={selectedTooth === num}
                onClick={() => setSelectedTooth(num)} 
              />
            ))}
          </div>
        </div>

        <div className="relative border-t border-(--background) pt-4">
          <div className="flex justify-center gap-1.5">
            {TOOTH_NUMBERS_LOWER.map(num => (
              <ToothItem 
                key={num} 
                id={num} 
                status={getToothStatus(num)} 
                active={selectedTooth === num}
                onClick={() => setSelectedTooth(num)} 
              />
            ))}
          </div>
          <p className="text-[9px] font-bold text-(--muted) uppercase tracking-widest mt-2 text-center">Alt Çene</p>
        </div>

        <AnimatePresence>
          {selectedTooth !== null && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-50 bg-(--surface)/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center border-2 border-(--primary)/20 shadow-2xl"
            >
              <button onClick={() => setSelectedTooth(null)} className="absolute top-4 right-4 p-2 text-(--muted) hover:text-red-500 transition-colors">
                <X size={20} />
              </button>

              <h4 className="text-lg font-bold text-(--foreground) mb-6">
                Diş <span className="text-(--primary)">#{selectedTooth}</span> İşlem
              </h4>

              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {PROCEDURES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProcedure(selectedTooth, p.id)}
                    className="flex items-center gap-3 p-4 bg-(--background) border border-(--border) rounded-2xl hover:border-(--primary) hover:bg-(--surface) transition-all group"
                  >
                    <span className="text-xl">{p.icon}</span>
                    <div className="flex flex-col items-start text-left">
                      <span className="text-sm font-bold text-(--foreground)">{p.label}</span>
                      <div className="w-8 h-1 rounded-full" style={{ backgroundColor: p.color }}></div>
                    </div>
                    <Check size={16} className="ml-auto text-(--primary) opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ToothItem = ({ id, status, active, onClick }: { id: number, status: string, active: boolean, onClick: () => void }) => {
  const colorMap: any = {
    healthy: 'bg-(--background) border-(--border) text-(--foreground)',
    caries: 'bg-[#FF3B30] border-[#FF3B30] text-white',
    extraction: 'bg-[#FF3B30] border-[#FF3B30] text-white',
    endo: 'bg-[#FF9F0A] border-[#FF9F0A] text-white',
    filling: 'bg-[#0066CC] border-[#0066CC] text-white',
    implant: 'bg-[#5856D6] border-[#5856D6] text-white',
    missing: 'bg-[#8E8E93] border-[#8E8E93] text-white opacity-60',
    impacted: 'bg-[#C41E3A] border-[#C41E3A] text-white',
    lesion: 'bg-[#FFD60A] border-[#FFD60A] text-black',
    fracture: 'bg-[#FF6B9D] border-[#FF6B9D] text-white',
    resorption: 'bg-[#30D5C8] border-[#30D5C8] text-white',
    cyst: 'bg-[#AF52DE] border-[#AF52DE] text-white',
    bone_loss: 'bg-[#FF9500] border-[#FF9500] text-white',
  };

  const currentStyle = colorMap[status] || colorMap.healthy;

  return (
    <div 
      onClick={onClick}
      className={`w-8 h-11 flex flex-col items-center justify-center rounded-lg border-2 transition-all cursor-pointer hover:scale-110 ${active ? 'ring-4 ring-(--primary)/20 border-(--primary)' : currentStyle}`}
    >
      <span className="text-[9px] font-bold leading-none">{id}</span>
      <div className="w-3 h-3 mt-1 rounded-sm opacity-10 bg-black/5 dark:bg-white/5"></div>
    </div>
  );
};

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center gap-2">
    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
    <span className="text-[10px] text-(--muted) font-medium">{label}</span>
  </div>
);
