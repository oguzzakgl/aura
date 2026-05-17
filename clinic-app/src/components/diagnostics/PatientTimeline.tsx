"use client";

import React, { useState, useEffect } from "react";
import { Calendar, ChevronRight, History, HeartPulse, Sparkles, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PatientTimelineProps {
  patientId: string;
  onClose: () => void;
}

export const PatientTimeline = ({ patientId, onClose }: PatientTimelineProps) => {
  const [scans, setScans] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Diş bazlı progresyon takibi state'leri
  const [targetTooth, setTargetTooth] = useState<number>(16);
  const [toothProgression, setToothProgression] = useState<any[]>([]);
  const [loadingTooth, setLoadingTooth] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/patients/${patientId}/scans`);
        if (!res.ok) throw new Error("Hasta geçmişi yüklenemedi.");
        const data = await res.json();
        setScans(data);
        if (data.length > 0) {
          setSelectedScan(data[0]); // En son taramayı varsayılan seç
        }
      } catch (err: any) {
        setError(err.message || "Geçmiş verileri çekilemedi.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [patientId]);

  // Diş bazlı progresyon sorgulama
  const handleCheckTooth = async () => {
    if (!targetTooth) return;
    setLoadingTooth(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/patients/${patientId}/tooth/${targetTooth}`);
      if (res.ok) {
        const data = await res.json();
        setToothProgression(data);
      }
    } catch (err) {
      console.error("Tooth progression query failed:", err);
    } finally {
      setLoadingTooth(false);
    }
  };

  useEffect(() => {
    if (scans.length > 0) {
      handleCheckTooth();
    }
  }, [targetTooth, scans]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-8">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-5xl bg-zinc-950 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh] text-white"
      >
        {/* 👤 Üst Başlık Paneli */}
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">Klinik Geçmiş ve Zaman Serisi Progresyonu</h3>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Hasta ID: #{patientId} • Kronolojik İnceleme</p>
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
            <span className="w-8 h-8 border-4 border-t-emerald-500 border-white/10 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Zaman çizelgesi oluşturuluyor...</p>
          </div>
        )}

        {!loading && scans.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-500 p-8 text-center">
            <History size={48} />
            <p className="text-xs font-black uppercase tracking-widest">Klinik tarama geçmişi bulunamadı.</p>
          </div>
        )}

        {scans.length > 0 && !loading && (
          <div className="flex-1 flex min-h-0">
            {/* 🧭 Sol Taraf: Kronolojik Zaman Çizelgesi Aksı */}
            <div className="w-80 border-r border-white/5 p-6 overflow-y-auto no-scrollbar flex flex-col gap-6">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Taramalar Timeline</span>
              
              <div className="relative border-l border-emerald-500/30 ml-3 pl-6 space-y-6">
                {scans.map((scan, idx) => {
                  const isSelected = selectedScan?.scan_id === scan.scan_id;
                  return (
                    <div 
                      key={scan.scan_id} 
                      onClick={() => setSelectedScan(scan)}
                      className="relative cursor-pointer group"
                    >
                      {/* Timeline Noktası */}
                      <span className={`absolute left-[-31px] top-1.5 w-3 h-3 rounded-full border-2 transition-all
                        ${isSelected 
                          ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)] scale-125' 
                          : 'bg-zinc-950 border-zinc-600 group-hover:border-emerald-400'}`} 
                      />
                      
                      <div className={`p-4 rounded-2xl border transition-all
                        ${isSelected 
                          ? 'bg-emerald-500/10 border-emerald-500/30' 
                          : 'bg-zinc-900/30 border-white/5 hover:border-white/10'}`}>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{scan.scan_date}</span>
                          <span className="text-[8px] bg-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded-md">{scan.scan_id}</span>
                        </div>
                        <h4 className="text-[10px] font-black text-white uppercase tracking-wide mt-2">{scan.modality}</h4>
                        <p className="text-[9px] text-zinc-400 mt-1">{scan.consensus_findings.length} Bulgu Saptandı</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🏗️ Merkez Taraf: Seçilen Taramanın Detayları */}
            <div className="flex-1 p-8 overflow-y-auto no-scrollbar flex flex-col gap-6">
              {selectedScan && (
                <>
                  <div className="flex justify-between items-start border-b border-white/5 pb-4">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">Tarama Rapor Detayları</h4>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                        {selectedScan.modality} • {selectedScan.scan_date} Tarihli AI Konsensüsü
                      </p>
                    </div>
                  </div>

                  {/* Bulgular Listesi */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-zinc-900/30 border border-white/5 rounded-3xl flex flex-col gap-4">
                      <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Saptanan Patolojiler</span>
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                        {selectedScan.consensus_findings.map((f: any, idx: number) => {
                          const severityColor = f.severity === 'Kritik' ? 'text-rose-500' : 'text-amber-500';
                          return (
                            <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center">
                              <div>
                                <span className="text-[9px] font-black text-white uppercase tracking-wide">Diş #{f.tooth_id} • {f.pathology.toUpperCase()}</span>
                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Konsensüs: {f.consensus}</p>
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-widest ${severityColor}`}>{f.severity}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-5 bg-zinc-900/30 border border-white/5 rounded-3xl flex flex-col gap-4">
                      <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Klinik AI Yorumu</span>
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-[10px] leading-relaxed text-zinc-300 overflow-y-auto max-h-[220px] custom-scrollbar">
                        {selectedScan.gemini_report}
                      </div>
                    </div>
                  </div>

                  {/* 📈 Diş Bazlı Progresyon Takip Paneli */}
                  <div className="mt-2 border-t border-white/5 pt-6 flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <HeartPulse size={16} className="text-emerald-400" />
                        <span className="text-[10px] text-white font-black uppercase tracking-widest">Diş Bazlı Regresyon / Progresyon Takipçisi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Diş Numarası (FDI):</span>
                        <input 
                          type="number" 
                          min="11" 
                          max="48"
                          value={targetTooth}
                          onChange={(e) => setTargetTooth(parseInt(e.target.value))}
                          className="w-14 bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-center text-white font-black outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    {loadingTooth ? (
                      <span className="text-zinc-500 text-[9px] uppercase tracking-widest animate-pulse">Zaman serisi sorgulanıyor...</span>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        {toothProgression.map((point: any, idx: number) => {
                          const isCaries = point.finding.pathology === "caries";
                          const isClean = point.finding.pathology === "clean";
                          const badgeColor = isCaries ? "text-rose-500 border-rose-500/20 bg-rose-500/5"
                            : isClean ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                            : "text-amber-500 border-amber-500/20 bg-amber-500/5";
                          return (
                            <div key={idx} className="p-4 bg-zinc-900/20 border border-white/5 rounded-2xl flex flex-col gap-2 relative">
                              {idx < toothProgression.length - 1 && (
                                <ArrowRight size={14} className="absolute -right-3 top-1/2 -translate-y-1/2 text-zinc-600 hidden md:block" />
                              )}
                              <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">{point.scan_date}</span>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[9px] font-black text-white uppercase tracking-wider">Diş #{targetTooth}</span>
                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md border ${badgeColor}`}>
                                  {point.finding.pathology === "clean" ? "TEMİZ" : point.finding.pathology.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[8px] text-zinc-400 font-semibold uppercase tracking-widest mt-1">Durum: {point.finding.severity}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
