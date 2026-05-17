"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  MessageSquare, 
  Clock, 
  Zap, 
  AlertCircle, 
  ChevronRight, 
  Search,
  Scan,
  Maximize2,
  BrainCircuit,
  History,
  FileUp,
  Loader2,
  CheckCircle2
} from 'lucide-react';

import { DicomUploader } from '@/components/diagnostics/DicomUploader';

export default function DiagnosticsPage() {
  const [stage, setStage] = useState<'upload' | 'analyzing' | 'results'>('upload');
  const [findings, setFindings] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [timer, setTimer] = useState(0);

  // Tracker logic
  useEffect(() => {
    let interval: any;
    if (stage !== 'upload') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [stage]);

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    setSelectedFile(files[0]);
    setStage('analyzing');
    
    // 🏛️ AI INFERENCE INTEGRATION (Backend Call)
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const response = await fetch('http://localhost:8000/analyze-scan', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setFindings(data.findings);
        // Analiz süreci bitene kadar biraz beklet (Aesthetics)
        setTimeout(() => setStage('results'), 2000);
      }
    } catch (error) {
      console.error("Aura Brain Connection Failed:", error);
      // Fallback to mock for UI demonstration if backend is unreachable
      setFindings([
        { pathology: "Klinik Analiz Hatası", severity: "Hata", confidence: 0 }
      ]);
      setStage('results');
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 top-16 left-64 bg-(--background) text-(--muted) overflow-hidden flex flex-col md:flex-row border-t border-(--border)">
      
      {/* 🏛️ LEFT PANEL: ANALYTICAL VIEWPORT */}
      <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto no-scrollbar">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-(--primary)/10 rounded-2xl flex items-center justify-center text-(--primary) border border-(--primary)/20 shadow-xl shadow-(--primary)/5">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-(--foreground) tracking-tight">Aura Teşhis Motoru</h1>
              <p className="text-[10px] text-(--primary) font-black uppercase tracking-[0.2em]">Diagnostic Neural Engine v8.3</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-4 py-2 bg-(--surface) rounded-xl border border-(--border)">
                <div className={`w-2 h-2 rounded-full ${stage === 'results' ? 'bg-emerald-500' : 'bg-orange-500'} animate-pulse`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-(--foreground)">
                  {stage === 'upload' ? 'Giriş Bekleniyor' : stage === 'analyzing' ? 'AI Analizinde' : 'Rapor Hazır'}
                </span>
             </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {stage === 'upload' ? (
            <motion.div 
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <div className="w-full max-w-2xl bg-(--surface) rounded-[40px] border border-(--border) p-4 shadow-2xl">
                 <DicomUploader onUploadComplete={handleUpload} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col gap-8"
            >
              {/* X-RAY VIEWPORT */}
              <div className="relative aspect-21/9 bg-black rounded-[40px] border border-(--border) overflow-hidden shadow-2xl group">
                {selectedFile && (
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    className={`absolute inset-0 w-full h-full object-cover grayscale contrast-125 ${stage === 'analyzing' ? 'opacity-40' : 'opacity-80'}`}
                    alt="Radiograph"
                  />
                )}
                
                {/* Scan Line */}
                {stage === 'analyzing' && (
                  <motion.div 
                    initial={{ left: '-10%' }}
                    animate={{ left: '110%' }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-1 bg-linear-to-r from-transparent via-(--primary) to-transparent z-10 shadow-[0_0_30px_var(--primary)]"
                  />
                )}

                {/* Pathological Markers (Mühürlü Koordinatlar) */}
                {stage === 'results' && findings.map((f, i) => f.coordinates && (
                  <motion.div 
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ left: `${f.coordinates.x / 5}%`, top: `${f.coordinates.y / 5}%` }} // Simplified mapping
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer shadow-lg
                      ${f.severity === 'Kritik' ? 'border-rose-500 bg-rose-500/20' : 'border-orange-500 bg-orange-500/20'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${f.severity === 'Kritik' ? 'bg-rose-500' : 'bg-orange-500'}`} />
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-(--border) p-3 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all">
                        <p className="text-[10px] font-black uppercase text-white tracking-widest">{f.pathology}</p>
                        <p className="text-[8px] text-(--muted) font-mono">Güven: %{(f.confidence * 100).toFixed(0)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* FINDINGS LOG */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stage === 'analyzing' ? (
                   Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 bg-(--surface) rounded-3xl border border-(--border) animate-pulse" />
                   ))
                ) : (
                  findings.map((f, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-(--surface) p-6 rounded-3xl border border-(--border) relative overflow-hidden group hover:border-(--primary)/40 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest
                          ${f.severity === 'Kritik' ? 'bg-rose-500/10 text-rose-500' : 
                            f.severity === 'Temiz' ? 'bg-emerald-500/10 text-emerald-500' : 
                            'bg-orange-500/10 text-orange-500'}`}
                        >
                          {f.severity}
                        </span>
                        {f.severity === 'Temiz' ? <CheckCircle2 className="text-emerald-500" size={16} /> : <AlertCircle className="text-rose-500" size={16} />}
                      </div>
                      <h4 className="text-sm font-bold text-(--foreground) mb-1">{f.pathology}</h4>
                      <p className="text-[10px] text-(--muted) font-medium italic">Aura Teşhis Güveni: %{(f.confidence * 100).toFixed(0)}</p>
                      
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all">
                        <BrainCircuit size={48} />
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🏛️ RIGHT PANEL: CHAT & LIVE TRACKER */}
      <div className="w-full md:w-96 bg-(--surface) border-l border-(--border) flex flex-col">
        <div className="flex-1 flex flex-col p-8 overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-(--primary)/10 rounded-xl flex items-center justify-center text-(--primary)">
              <MessageSquare size={20} />
            </div>
            <h3 className="font-bold text-(--foreground) text-sm tracking-tight">Klinik Asistan</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 no-scrollbar">
            <div className="bg-(--background) p-5 rounded-3xl rounded-tl-none border border-(--border) shadow-sm">
              <p className="text-xs leading-relaxed text-(--foreground)">
                {stage === 'upload' ? 'Cerrahım, analiz için lütfen bir radyografi mühürleyin. Aura teşhis için hazır bekliyor.' : 
                 stage === 'analyzing' ? 'Görüntü üzerindeki piksel anomalileri taranıyor. Cerrahi beynimiz katmanları inceliyor.' :
                 `Analiz tamamlandı cerrahım. ${findings.filter(f => f.severity !== 'Temiz').length} adet anomali saptandı. Rapor detaylarını sol panelde görebilirsiniz.`}
              </p>
            </div>
          </div>
          
          <div className="mt-8 relative group">
            <input 
              type="text" 
              placeholder="Aura'ya sor..." 
              className="w-full bg-(--background) border border-(--border) rounded-2xl px-6 py-4 text-xs outline-none focus:border-(--primary)/40 transition-all text-(--foreground)"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-(--primary) rounded-xl flex items-center justify-center text-(--primary-foreground) shadow-lg shadow-(--primary)/20 group-hover:scale-105 active:scale-95 transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* TRACKER */}
        <div className="p-8 bg-(--background) border-t border-(--border) space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-(--primary)" />
              <span className="text-xs font-black text-(--foreground) uppercase tracking-[0.2em]">Klinik Sayaç</span>
            </div>
            <div className="text-3xl font-mono font-bold text-(--primary) tracking-tighter">{formatTime(timer)}</div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-1 h-12 bg-(--primary) rounded-full shadow-[0_0_10px_var(--primary)]" />
              <div>
                <p className="text-[10px] font-black text-(--muted) uppercase tracking-widest">Aktif Safha</p>
                <p className="text-sm font-bold text-(--foreground)">{stage === 'upload' ? 'Veri Kabulü' : stage === 'analyzing' ? 'Nöral Analiz' : 'Cerrahi Raporlama'}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => { setStage('upload'); setSelectedFile(null); setFindings([]); }}
            className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all border border-rose-500/20 active:scale-95"
          >
            Yeni Analiz Başlat
          </button>
        </div>
      </div>
    </div>
  );
}
