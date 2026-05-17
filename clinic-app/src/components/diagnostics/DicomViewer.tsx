"use client";

import React, { useState, useEffect } from "react";
import { Slice, Sliders, Maximize2, ShieldAlert, Eye, Move } from "lucide-react";
import { motion } from "framer-motion";

interface DicomViewerProps {
  file: File | null;
  onClose: () => void;
}

export const DicomViewer = ({ file, onClose }: DicomViewerProps) => {
  const [slices, setSlices] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Eksen bazlı dilim indexleri
  const [axialIdx, setAxialIdx] = useState(8);
  const [sagittalIdx, setSagittalIdx] = useState(8);
  const [coronalIdx, setCoronalIdx] = useState(8);

  // Pencere / Kontrast ayarları
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  useEffect(() => {
    if (!file) return;

    const fetchSlices = async () => {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append("file", file);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/dicom-slices`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Dilimleme motoru yanıt vermedi.");
        }

        const data = await res.json();
        if (data.status === "SUCCESS") {
          setSlices(data);
        } else {
          throw new Error("Kesit verisi işlenemedi.");
        }
      } catch (err: any) {
        setError(err.message || "CBCT dilimleri yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlices();
  }, [file]);

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setAxialIdx(8);
    setSagittalIdx(8);
    setCoronalIdx(8);
  };

  return (
    <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-40 rounded-[40px] flex flex-col p-6 overflow-hidden">
      {/* 🚀 Üst Aksiyon Çubuğu */}
      <header className="flex justify-between items-center border-b border-white/10 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Aura 2.5D CBCT Tomografi Dilimleyici</h3>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
              {file ? file.name : "DICOM Yüklenmedi"} • Multiplanar Rekonstrüksiyon (MPR)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
          >
            Sıfırla
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
          >
            Kapat
          </button>
        </div>
      </header>

      {/* 🔄 Yükleme ve Hata Durumları */}
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white">
          <span className="w-10 h-10 border-4 border-t-blue-500 border-white/10 rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Tomografi Kesitleri Çıkartılıyor...</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-rose-500 p-6 text-center">
          <ShieldAlert size={48} />
          <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
          <button 
            onClick={onClose} 
            className="mt-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
          >
            Geri Dön
          </button>
        </div>
      )}

      {/* 🩻 Ana Görüntüleyici Alanı */}
      {slices && !loading && !error && (
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* MPR 3 Ekran Grid */}
          <div className="flex-1 grid grid-cols-3 gap-6 min-h-0">
            
            {/* 1. Aksiyel Kesit (Axial) */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-4 flex flex-col gap-3 min-h-0 relative group">
              <div className="absolute top-6 left-6 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-md z-10">
                Aksiyel (Axial)
              </div>
              <div className="flex-1 min-h-0 bg-black rounded-2xl overflow-hidden relative flex items-center justify-center border border-white/5 shadow-inner">
                <img 
                  src={`data:image/png;base64,${slices.axial[axialIdx]}`}
                  alt="Axial slice"
                  className="max-h-full max-w-full object-contain transition-all"
                  style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                />
              </div>
              <div className="shrink-0 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                  <span>Dilim #{axialIdx + 1}/16</span>
                  <span>Z-Eksen</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={axialIdx}
                  onChange={(e) => setAxialIdx(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* 2. Sagittal Kesit (Sagittal) */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-4 flex flex-col gap-3 min-h-0 relative group">
              <div className="absolute top-6 left-6 px-3 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-md z-10">
                Sagittal
              </div>
              <div className="flex-1 min-h-0 bg-black rounded-2xl overflow-hidden relative flex items-center justify-center border border-white/5 shadow-inner">
                <img 
                  src={`data:image/png;base64,${slices.sagittal[sagittalIdx]}`}
                  alt="Sagittal slice"
                  className="max-h-full max-w-full object-contain transition-all"
                  style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                />
              </div>
              <div className="shrink-0 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                  <span>Dilim #{sagittalIdx + 1}/16</span>
                  <span>X-Eksen</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={sagittalIdx}
                  onChange={(e) => setSagittalIdx(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            {/* 3. Koronal Kesit (Coronal) */}
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-4 flex flex-col gap-3 min-h-0 relative group">
              <div className="absolute top-6 left-6 px-3 py-1 bg-teal-500/20 border border-teal-500/30 text-teal-400 text-[9px] font-black uppercase tracking-widest rounded-md z-10">
                Koronal (Coronal)
              </div>
              <div className="flex-1 min-h-0 bg-black rounded-2xl overflow-hidden relative flex items-center justify-center border border-white/5 shadow-inner">
                <img 
                  src={`data:image/png;base64,${slices.coronal[coronalIdx]}`}
                  alt="Coronal slice"
                  className="max-h-full max-w-full object-contain transition-all"
                  style={{ filter: `brightness(${brightness}%) contrast(${contrast}%)` }}
                />
              </div>
              <div className="shrink-0 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                  <span>Dilim #{coronalIdx + 1}/16</span>
                  <span>Y-Eksen</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="15" 
                  value={coronalIdx}
                  onChange={(e) => setCoronalIdx(parseInt(e.target.value))}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>
            </div>

          </div>

          {/* 🎛️ Alt Kontrast / Parlaklık Panel Barı */}
          <footer className="h-20 bg-zinc-900/60 border border-white/5 p-4 rounded-2xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-8 flex-1 max-w-lg">
              {/* Parlaklık (Window Level) */}
              <div className="flex-1 flex items-center gap-3">
                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest w-16">Parlaklık</span>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <span className="text-[10px] font-black text-white w-8 text-right">%{brightness}</span>
              </div>

              {/* Kontrast */}
              <div className="flex-1 flex items-center gap-3">
                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest w-16">Kontrast</span>
                <input 
                  type="range" 
                  min="50" 
                  max="150" 
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <span className="text-[10px] font-black text-white w-8 text-right">%{contrast}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-black uppercase tracking-widest">
              <Eye size={12} className="text-zinc-400 animate-pulse" />
              <span>Real-Time Hounsfield Normalization (HU) Active</span>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};
