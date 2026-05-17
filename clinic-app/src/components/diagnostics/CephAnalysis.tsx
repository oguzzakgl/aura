"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ShieldAlert, X, ChevronRight, Ruler, Award } from "lucide-react";
import { motion } from "framer-motion";

interface CephAnalysisProps {
  file: File | null;
  onClose: () => void;
}

export const CephAnalysis = ({ file, onClose }: CephAnalysisProps) => {
  const [cephData, setCephData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sefalometrik çizgi overlay toggle'ları
  const [showLines, setShowLines] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  useEffect(() => {
    if (!file) return;

    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append("file", file);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/cephalometric`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Sefalometrik analiz sunucusu yanıt vermedi.");
        }

        const data = await res.json();
        if (data.status === "SUCCESS") {
          setCephData(data);
        } else {
          throw new Error("Sefalometrik veriler işlenemedi.");
        }
      } catch (err: any) {
        setError(err.message || "Ortodontik analiz yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [file]);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xl z-50 flex items-center justify-center p-8">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-6xl bg-zinc-950 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh] text-white"
      >
        {/* 👤 Üst Başlık Paneli */}
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
              <Ruler size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Aura AI Sefalometrik & Kraniyometrik Analiz</h3>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                {file ? file.name : "Sefalometrik Röntgen Yüklenmedi"} • Otomatik Anatomik Landmark & Açı Tespiti
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </header>

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-400">
            <span className="w-8 h-8 border-4 border-t-blue-500 border-white/10 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Sefalometrik landmarklar aranıyor...</p>
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-rose-500 p-8 text-center">
            <ShieldAlert size={48} />
            <p className="text-xs font-black uppercase tracking-widest">{error}</p>
          </div>
        )}

        {cephData && !loading && !error && (
          <div className="flex-1 flex min-h-0">
            {/* 🩻 Sol Panel: SVG Sefalometrik Overlay Ekranı */}
            <div className="w-[500px] border-r border-white/5 p-8 flex flex-col justify-center bg-black relative">
              <div className="relative w-[440px] h-[440px] bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 flex items-center justify-center shadow-inner">
                
                {/* Röntgen Simülasyonu */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-zinc-800 to-zinc-950 opacity-40" />
                <div className="text-[9px] font-black text-zinc-700 absolute top-4 left-4 uppercase tracking-widest">Aura Ceph Engine v1.2</div>
                
                {/* SVG Çizim Alanı (Landmark Çizgileri) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                  {showLines && (
                    <>
                      {/* S-N Çizgisi (Sella-Nasion) */}
                      <line 
                        x1={cephData.landmarks["Sella (S)"][0]} y1={cephData.landmarks["Sella (S)"][1]} 
                        x2={cephData.landmarks["Nasion (N)"][0]} y2={cephData.landmarks["Nasion (N)"][1]} 
                        stroke="#3b82f6" strokeWidth="2" strokeDasharray="4"
                      />
                      {/* N-A Çizgisi (Nasion-A Noktası) */}
                      <line 
                        x1={cephData.landmarks["Nasion (N)"][0]} y1={cephData.landmarks["Nasion (N)"][1]} 
                        x2={cephData.landmarks["A Noktası (A)"][0]} y2={cephData.landmarks["A Noktası (A)"][1]} 
                        stroke="#f43f5e" strokeWidth="2"
                      />
                      {/* N-B Çizgisi (Nasion-B Noktası) */}
                      <line 
                        x1={cephData.landmarks["Nasion (N)"][0]} y1={cephData.landmarks["Nasion (N)"][1]} 
                        x2={cephData.landmarks["B Noktası (B)"][0]} y2={cephData.landmarks["B Noktası (B)"][1]} 
                        stroke="#eab308" strokeWidth="2"
                      />
                      {/* Go-Me Çizgisi (Gonion-Menton Mandibula Çizgisi) */}
                      <line 
                        x1={cephData.landmarks["Gonion (Go)"][0]} y1={cephData.landmarks["Gonion (Go)"][1]} 
                        x2={cephData.landmarks["Menton (Me)"][0]} y2={cephData.landmarks["Menton (Me)"][1]} 
                        stroke="#10b981" strokeWidth="2" strokeDasharray="4"
                      />
                    </>
                  )}
                </svg>

                {/* Saptanan Landmark Noktaları */}
                {Object.entries(cephData.landmarks).map(([name, coords]: [string, any]) => (
                  <div 
                    key={name}
                    className="absolute w-3.5 h-3.5 -ml-1.75 -mt-1.75 bg-blue-500 rounded-full border border-white shadow-[0_0_10px_rgba(59,130,246,0.8)] z-20 flex items-center justify-center group"
                    style={{ left: coords[0], top: coords[1] }}
                  >
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    {showLabels && (
                      <span className="absolute left-5 bg-black/80 backdrop-blur-md px-2 py-0.5 border border-white/10 rounded-md text-[8px] font-black uppercase tracking-widest text-blue-400 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                        {name}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Overlay Görünüm Kontrolleri */}
              <div className="flex gap-4 mt-6 justify-center">
                <button 
                  onClick={() => setShowLines(!showLines)}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all
                    ${showLines ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-zinc-900 border-white/5 text-zinc-400'}`}
                >
                  Analiz Çizgileri
                </button>
                <button 
                  onClick={() => setShowLabels(!showLabels)}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all
                    ${showLabels ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-zinc-900 border-white/5 text-zinc-400'}`}
                >
                  Etiketler
                </button>
              </div>
            </div>

            {/* 📊 Sağ Panel: Açı Ölçümleri & Klinik Bulgular */}
            <div className="flex-1 p-8 overflow-y-auto no-scrollbar flex flex-col gap-6">
              
              {/* İskeletsel Sınıf Rozeti */}
              <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-3xl flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">İskeletsel Sınıflandırma</span>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider mt-1">{cephData.skeletal_class}</h4>
                </div>
                <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl flex items-center justify-center">
                  <Award size={20} />
                </div>
              </div>

              {/* Açı Ölçüm Tablosu */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Sefalometrik Açı Norm Değerleri</span>
                
                <div className="space-y-2.5">
                  {cephData.measurements.map((m: any, idx: number) => {
                    const statusColor = m.color === 'rose' ? 'text-rose-500' : m.color === 'amber' ? 'text-amber-500' : 'text-emerald-500';
                    const progressBg = m.color === 'rose' ? 'bg-rose-500/20' : m.color === 'amber' ? 'bg-amber-500/20' : 'bg-emerald-500/20';
                    return (
                      <div key={idx} className="p-4 bg-zinc-900/10 border border-white/5 rounded-2xl flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-white uppercase tracking-wide">{m.name}</span>
                            <span className="text-[9px] text-zinc-400 font-bold">Norm: {m.norm}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-black ${statusColor}`}>{m.value}°</span>
                            <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">•</span>
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${statusColor}`}>{m.status}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Klinik Yorum */}
              <div className="p-6 bg-zinc-900/30 border border-white/5 rounded-3xl flex flex-col gap-3">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Ortodontik Klinik Rapor</span>
                <p className="text-[10px] leading-relaxed text-zinc-300 font-semibold">{cephData.clinical_summary}</p>
              </div>

            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
