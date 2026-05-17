"use client";

import React, { useState, useMemo } from "react";
import { 
  Activity, Users, Calendar, Clipboard, 
  MessageSquare, ChevronRight, Bell, FileUp, X, Loader2, AlertCircle, FileText, Clock, Sliders, Sparkles
} from "lucide-react";
import { AuraOdontogram } from "./AuraOdontogram";
import { DicomUploader } from "./DicomUploader";
import { DicomViewer } from "./DicomViewer";
import { PatientTimeline } from "./PatientTimeline";
import { PerioChart } from "./PerioChart";
import { CephAnalysis } from "./CephAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import { useDiagnosticStore } from "@/store/useDiagnosticStore";
import { useTransientStore } from "@/store/useTransientStore";
import { PrescriptionWizard } from "./PrescriptionWizard";
import DOMPurify from "dompurify";

export const AuraClinicalDashboard = ({ children }: { children: React.ReactNode }) => {
  const applyFindings = useDiagnosticStore((state) => state.applyFindings);
  const resetStore = useDiagnosticStore((state) => state.resetStore);
  const [showUploader, setShowUploader] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [geminiReport, setGeminiReport] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"findings" | "treatment">("findings");
  const [treatmentPlan, setTreatmentPlan] = useState<any>(null);
  const [showDicomViewer, setShowDicomViewer] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showPerio, setShowPerio] = useState(false);
  const [showCeph, setShowCeph] = useState(false);
  const [showImplantTuner, setShowImplantTuner] = useState(false);
  const [showPrescription, setShowPrescription] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [findings, setFindings] = useState<any[]>([
    { label: "Analiz Bekleniyor", location: "Veri Girişi Gerekli", confidence: 0 }
  ]);

  React.useEffect(() => {
    // 🛡️ ZIRH: Sayfa ilk açıldığında localStorage önbelleğindeki eski uyumsuz bulguları tamamen temizle!
    resetStore();
    console.log("[AURA SHIELD]: Local storage diagnostic cache successfully purged on mount.");
  }, [resetStore]);

  const handleUploadComplete = async (files: File[]) => {
    if (files.length === 0) return;
    
    // 🛡️ ZIRH: Eski tarama/manuel bulgu kalıntılarını tamamen temizle
    resetStore();
    
    setUploadedFile(files[0]);
    setShowUploader(false);
    setIsAnalyzing(true);
    setScanProgress(0);
    setGeminiReport("");
    setTreatmentPlan(null);
    setFindings([{ label: "Aura Devrede", location: "Nöral Ağlar Taranıyor...", confidence: 0, severity: "Orta" }]);
    
    // Fiktif Nöral Tarama Barı (Backend yanıt verene kadar %90'a kadar dolar)
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.floor(Math.random() * 10) + 5;
      });
    }, 400);

    // 🏛️ AI INFERENCE INTEGRATION
    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
      console.log("[AURA DIAGNOSTICS LOG] Resolved API URL is:", apiUrl);
      
      // 1. Initiate async analysis task
      const response = await fetch(`${apiUrl}/analyze-scan`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const initData = await response.json();
      
      const processResults = async (resultData: any) => {
        const consensusData = resultData.consensus_findings || [];
        const clinicalFindings = consensusData.map((f: any) => {
          const statusEmoji = f.consensus === 'Onaylı' ? '✅✅' : f.consensus === 'Muhtemel' ? '✅❓' : '❓';
          return {
            label: `${statusEmoji} ${f.pathology}`,
            location: f.tooth_id ? `Diş #${f.tooth_id} • ${f.engines}` : `${f.engines}`,
            confidence: Math.round((f.confidence || 0) * 100),
            severity: f.severity,
            consensus: f.consensus,
          };
        });
        
        setFindings(clinicalFindings.length > 0 ? clinicalFindings : [{ label: "Patoloji Saptanmadı", location: "Temiz", confidence: 99 }]);
        if (resultData.gemini_analysis) {
            setGeminiReport(resultData.gemini_analysis);
        }

        // 🏛️ Konsensüs bulgularını 3D Model + 2D Odontogram'a yansıt
        if (consensusData.length > 0) {
            const fdiToUniversal: Record<number, number> = {
              18:1, 17:2, 16:3, 15:4, 14:5, 13:6, 12:7, 11:8,
              21:9, 22:10, 23:11, 24:12, 25:13, 26:14, 27:15, 28:16,
              38:17, 37:18, 36:19, 35:20, 34:21, 33:22, 32:23, 31:24,
              41:25, 42:26, 43:27, 44:28, 45:29, 46:30, 47:31, 48:32,
            };
            
            // Sadece tooth_id'si olan ve "clean" olmayan bulguları senkronize et
            const mappedFindings = consensusData
              .filter((f: any) => f.tooth_id != null && f.pathology !== 'clean')
              .map((f: any) => ({
                tooth_id: f.tooth_id,
                pathology: f.pathology,
                severity: f.severity,
              }));
            
            applyFindings(mappedFindings);
            console.log("[AURA SYNC]: Consensus findings applied directly in FDI:", mappedFindings);
            
            // 4. Otomatik Tedavi Planı Üret (Özellik 6)
            try {
              const planRes = await fetch(`${apiUrl}/treatment-plan`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ consensus_findings: consensusData }),
              });
              if (planRes.ok) {
                const planData = await planRes.json();
                setTreatmentPlan(planData);
                console.log("[AURA PLANNER]: Automatic treatment plan ready:", planData);
              }
            } catch (planErr) {
              console.error("Automatic treatment planner failed:", planErr);
            }
        }
      };

      if (initData.status === 'success') {
        // Doğrudan senkron yanıt geldiyse anında işle!
        await processResults(initData);
      } else if (initData.status === 'processing' && initData.task_id) {
        const taskId = initData.task_id;
        
        // 2. Poll for task completion (Maksimum 10 deneme / 20 saniye siber kalkan)
        let isDone = false;
        let finalData = null;
        let attempts = 0;
        const maxAttempts = 10;
        
        while (!isDone && attempts < maxAttempts) {
          attempts++;
          await new Promise(r => setTimeout(r, 2000)); // Poll every 2 seconds
          
          const statusRes = await fetch(`${apiUrl}/task-status/${taskId}`);
          if (!statusRes.ok) throw new Error("Task polling failed");
          
          const statusData = await statusRes.json();
          
          if (statusData.status === 'success') {
            isDone = true;
            finalData = statusData;
          } else if (statusData.status === 'failed') {
            throw new Error(`Task failed: ${statusData.error}`);
          } else {
            // Update UI with step info if available
            setFindings([{ label: "Aura Devrede", location: statusData.step || "İşleniyor...", confidence: 0, severity: "Orta" }]);
          }
        }
        
        if (!isDone) {
          throw new Error("Analiz sunucusu kuyruğu zaman aşımına uğradı. Güvenli moda geçiliyor.");
        }
        
        // 3. Process Final Data
        await processResults(finalData);
      }
    } catch (error) {
      console.error("Aura Brain Connection Failed:", error);
      setFindings([{ label: "Bağlantı Hatası", location: "Backend Çevrimdışı", confidence: 0 }]);
      setGeminiReport("Sistem Çevrimdışı: API bağlantısı kurulamadı.");
    } finally {
      clearInterval(progressInterval);
      setScanProgress(100);
      
      // %100 dolduktan sonra küçük bir bekleme ve analiz modundan çıkış
      setTimeout(() => {
        setIsAnalyzing(false);
        setScanProgress(0);
      }, 800);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001';
      const response = await fetch(`${apiUrl}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: "Hacer Erkan",
          findings: findings.map(f => {
            let tId = null;
            if (f.location && f.location.includes("Diş #")) {
                tId = parseInt(f.location.split("Diş #")[1].split(" •")[0]);
            }
            return {
              tooth_id: tId,
              pathology: f.label.replace(/[^\w\sıişğüçö]/gi, "").trim(),
              severity: f.severity || "Orta",
              consensus: f.consensus || "Muhtemel",
              confidence: f.confidence / 100
            };
          }),
          gemini_analysis: geminiReport || "Detaylı klinik analiz henüz tamamlanmadı."
        })
      });
      
      if (!response.ok) throw new Error("Rapor üretilemedi.");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Aura_Tehhis_Raporu_Hacer_Erkan.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Rapor indirilirken hata oluştu: " + err);
    }
  };

  return (
    <div className="flex h-screen bg-(--background) text-(--foreground) overflow-hidden transition-colors duration-500">
      {/* 🧭 NAVIGATION SIDEBAR */}
      <aside className="w-20 bg-(--surface) border-r border-(--border) flex flex-col items-center py-8 gap-10 shrink-0">
        <div className="w-10 h-10 bg-(--primary) rounded-xl flex items-center justify-center text-(--primary-foreground) font-bold text-xl shadow-lg shadow-(--primary)/20">A</div>
        
        <nav className="flex flex-col gap-8 flex-1">
          <NavItem icon={<Activity size={24} />} active />
          <NavItem icon={<Users size={24} />} />
          <NavItem icon={<Calendar size={24} />} />
          <NavItem icon={<Clipboard size={24} />} />
        </nav>
        
        <div className="w-10 h-10 rounded-full bg-(--secondary) border border-(--border) overflow-hidden shadow-inner">
           <div className="w-full h-full bg-linear-to-tr from-(--primary) to-teal-400 opacity-20" />
        </div>
      </aside>

      {/* 🏗️ MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 👤 PATIENT HEADER */}
        <header className="h-24 bg-(--surface) border-b border-(--border) px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-(--secondary) rounded-2xl border border-(--border) overflow-hidden flex items-center justify-center shadow-sm">
               <span className="text-xl font-bold text-(--muted)">HE</span>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-(--foreground) tracking-tight">Hacer Erkan</h1>
                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">Aktif</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <p className="text-[10px] text-(--muted) font-black uppercase tracking-widest opacity-60">ID: #76A22DC2 • Yaş: 32 • Kan Grubu: A Rh+</p>
                <button 
                  onClick={() => setShowTimeline(true)}
                  className="px-2.5 py-1 bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 transition-all text-[8px] font-black uppercase tracking-widest rounded-md border border-blue-500/20 cursor-pointer"
                >
                  📋 Klinik Geçmiş (Timeline)
                </button>
                <button 
                  onClick={() => setShowPerio(true)}
                  className="px-2.5 py-1 bg-indigo-500/15 text-indigo-500 hover:bg-indigo-500/25 transition-all text-[8px] font-black uppercase tracking-widest rounded-md border border-indigo-500/20 cursor-pointer"
                >
                  🦷 Perio Haritası
                </button>
                <button 
                  onClick={() => setShowImplantTuner(!showImplantTuner)}
                  className={`px-2.5 py-1 transition-all text-[8px] font-black uppercase tracking-widest rounded-md border cursor-pointer
                    ${showImplantTuner 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-zinc-800 text-zinc-400 border-white/5 hover:bg-zinc-700'}`}
                >
                  🔬 3D İmplant Simülatörü
                </button>
                <button 
                  onClick={() => setShowPrescription(!showPrescription)}
                  className={`px-2.5 py-1 transition-all text-[8px] font-black uppercase tracking-widest rounded-md border cursor-pointer
                    ${showPrescription 
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' 
                      : 'bg-zinc-800 text-zinc-400 border-white/5 hover:bg-zinc-700'}`}
                >
                  💊 Akıllı Reçete
                </button>
                {uploadedFile && (
                  <button 
                    onClick={() => setShowCeph(true)}
                    className="px-2.5 py-1 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 transition-all text-[8px] font-black uppercase tracking-widest rounded-md border border-blue-500/20 cursor-pointer"
                  >
                    📐 Sefalometrik Analiz
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowUploader(true)}
                className="flex items-center gap-3 px-6 py-3 bg-(--surface) border border-(--border) text-(--foreground) rounded-2xl font-bold text-xs hover:border-(--primary) transition-all shadow-sm group"
             >
                <FileUp size={18} className="text-(--primary) group-hover:scale-110 transition-transform" />
                Röntgen Yükle
             </button>
             
             {/* P1-1 & Özellik 2: Mühürlü PDF Rapor İndirme Butonu */}
             <button 
                onClick={handleDownloadReport}
                disabled={!geminiReport}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-xs transition-all shadow-md group
                  ${geminiReport 
                    ? 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer hover:scale-105 active:scale-95' 
                    : 'bg-(--surface) border border-(--border) text-(--muted) opacity-40 cursor-not-allowed'}`}
             >
                <FileText size={18} className={geminiReport ? "text-white" : "text-(--muted)"} />
                Raporu İndir
             </button>
             
             <div className="w-px h-8 bg-(--border) mx-2" />
             <button className="px-8 py-3 bg-(--primary) text-(--primary-foreground) rounded-2xl font-bold text-xs shadow-xl shadow-(--primary)/20 hover:scale-105 active:scale-95 transition-all">
               Yeni İşlem
             </button>
          </div>
        </header>

        {/* 🩻 IMAGING & DIAGNOSTIC AREA */}
        <section className="flex-1 overflow-hidden p-8 flex gap-8">
          <div className="flex-3 min-w-0 flex flex-col gap-8 h-full">
             <div className="flex-1 min-h-[300px] bg-black rounded-[40px] border border-(--border) shadow-sm relative overflow-hidden flex items-center justify-center transition-all">
                {isAnalyzing && (
                  <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center">
                    <Loader2 className="text-(--primary) animate-spin mb-4" size={48} />
                    <p className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">Aura Nöral Analiz Devrede...</p>
                  </div>
                )}
                {children}

                {/* 🔬 USP ÖZELLİĞİ: 3D CERRAHİ İMPLANT FİNE-TUNİNG KONTROL PANELİ */}
                <AnimatePresence>
                  {showImplantTuner && (
                    <motion.div 
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="absolute left-6 top-6 bottom-6 w-64 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col gap-4 z-30 shadow-2xl shadow-black/80"
                    >
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">3D Cerrahi Konumlandırma</span>
                      </div>
                      
                      <p className="text-[9px] text-zinc-400 font-bold uppercase leading-relaxed">
                        Zustand Transient Update altyapısı sayesinde sıfır lag ile milimetrik implant hizalaması yapın.
                      </p>

                      <div className="flex-1 flex flex-col justify-center gap-4 border-t border-b border-white/5 py-4">
                        {/* X Pozisyonu Slider */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-zinc-500">
                            <span>X Ekseni (Sağ/Sol)</span>
                          </div>
                          <input 
                            type="range" 
                            min="-1.5" 
                            max="1.5" 
                            step="0.01"
                            defaultValue="0"
                            onChange={(e) => useTransientStore.getState().setImplantPosition({ x: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-1 appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Y Pozisyonu Slider */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-zinc-500">
                            <span>Y Ekseni (Yukarı/Aşağı)</span>
                          </div>
                          <input 
                            type="range" 
                            min="-1.5" 
                            max="1.5" 
                            step="0.01"
                            defaultValue="-0.2"
                            onChange={(e) => useTransientStore.getState().setImplantPosition({ y: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-1 appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Z Pozisyonu Slider */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-zinc-500">
                            <span>Z Ekseni (Ön/Arka)</span>
                          </div>
                          <input 
                            type="range" 
                            min="-1.5" 
                            max="1.5" 
                            step="0.01"
                            defaultValue="0"
                            onChange={(e) => useTransientStore.getState().setImplantPosition({ z: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-1 appearance-none cursor-pointer"
                          />
                        </div>

                        {/* Açı (Angle) Slider */}
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-zinc-500">
                            <span>Açısal Eğim (Angle)</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="360" 
                            step="1"
                            defaultValue="0"
                            onChange={(e) => useTransientStore.getState().setImplantPosition({ angle: parseFloat(e.target.value) })}
                            className="w-full accent-emerald-500 bg-zinc-800 rounded-lg h-1 appearance-none cursor-pointer"
                          />
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          useTransientStore.getState().setImplantPosition({ x: 0, y: -0.2, z: 0, angle: 0 });
                          if ("speechSynthesis" in window) {
                            window.speechSynthesis.cancel();
                            window.speechSynthesis.speak(new SpeechSynthesisUtterance("İmplant koordinatları sıfırlandı."));
                          }
                        }}
                        className="w-full py-2.5 bg-zinc-850 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
                      >
                        Hizalamayı Sıfırla
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 💊 USP ÖZELLİĞİ: SECURE AIR-GAP PRESCRIPTION WIZARD */}
                <AnimatePresence>
                  {showPrescription && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-6 top-6 bottom-6 w-lg z-40 shadow-2xl flex items-center justify-center pointer-events-auto"
                    >
                      <div className="relative w-full h-full">
                        {/* Kapatma Butonu */}
                        <button 
                          onClick={() => setShowPrescription(false)}
                          className="absolute top-4 right-4 z-50 p-2 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl transition-all border border-white/5 cursor-pointer"
                        >
                          <X size={16} />
                        </button>
                        
                        <div className="w-full h-full overflow-y-auto no-scrollbar rounded-[2.5rem] bg-zinc-950 border border-white/10 shadow-2xl">
                          <PrescriptionWizard patientAllergies={["penicillin"]} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 🩻 3D CBCT DİLİMLEME TETİKLEYİCİ BUTON */}
                {uploadedFile && !isAnalyzing && (
                  <button 
                    onClick={() => setShowDicomViewer(true)}
                    className="absolute top-6 right-6 px-4 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 z-20 flex items-center gap-2 group"
                  >
                    <Sliders size={14} className="text-blue-500 group-hover:rotate-90 transition-transform" />
                    3D CBCT Dilimleyici
                  </button>
                )}

                {/* 🩻 DİLİMLEME EKRANI OVERLAY */}
                <AnimatePresence>
                  {showDicomViewer && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 z-40"
                    >
                      <DicomViewer 
                        file={uploadedFile} 
                        onClose={() => setShowDicomViewer(false)} 
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 🚀 NÖRAL TARAMA BARI */}
                <AnimatePresence>
                  {(isAnalyzing || scanProgress > 0) && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20, transition: { delay: 0.5 } }}
                      className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 max-w-sm bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-3xl z-50 shadow-2xl shadow-black/50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Vision Inference Core</span>
                        <span className="text-[10px] font-black text-(--primary)">%{scanProgress}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
                        <motion.div 
                          className="absolute top-0 left-0 h-full bg-(--primary) rounded-full shadow-[0_0_10px_rgba(0,102,204,0.8)]"
                          initial={{ width: "0%" }}
                          animate={{ width: `${scanProgress}%` }}
                          transition={{ ease: "easeOut", duration: 0.4 }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             <AuraOdontogram />
          </div>

          {/* 🤖 AI & CLINICAL PANEL */}
          <aside className="w-80 shrink-0 flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">
            <div className="aura-card p-6 flex flex-col gap-5 bg-(--surface) border border-(--border) rounded-3xl shadow-sm relative overflow-hidden shrink-0">
              <div className="flex items-center justify-between border-b border-(--border) pb-3">
                <div className="flex gap-2 w-full">
                  <button 
                    onClick={() => setActiveTab("findings")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all
                      ${activeTab === 'findings' 
                        ? 'bg-(--primary) text-(--primary-foreground) shadow-md' 
                        : 'bg-(--background) text-(--muted) hover:text-(--foreground)'}`}
                  >
                    Bulgular
                  </button>
                  <button 
                    onClick={() => setActiveTab("treatment")}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all relative overflow-hidden
                      ${activeTab === 'treatment' 
                        ? 'bg-(--primary) text-(--primary-foreground) shadow-md' 
                        : 'bg-(--background) text-(--muted) hover:text-(--foreground)'}`}
                  >
                    Tedavi Planı
                    {treatmentPlan && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                  </button>
                </div>
              </div>

              {activeTab === 'findings' ? (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  {findings.map((item, idx) => (
                    <DiagnosisItem 
                      key={idx}
                      label={item.label} 
                      location={item.location} 
                      confidence={item.confidence} 
                      severity={item.severity}
                      consensus={item.consensus}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
                  {!treatmentPlan ? (
                    <div className="text-center py-8 text-xs text-(--muted) font-semibold uppercase tracking-widest opacity-60">
                      Röntgen analizi tamamlandığında tedavi planı otomatik hazırlanacaktır.
                    </div>
                  ) : (
                    <>
                      {/* Tedavi Özet Kartları */}
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="p-3 bg-(--background) rounded-2xl border border-(--border) flex flex-col items-center">
                          <span className="text-[9px] text-(--muted) font-black uppercase tracking-widest">Toplam Seans</span>
                          <span className="text-lg font-black text-(--foreground) mt-1">{treatmentPlan.total_sessions} Seans</span>
                        </div>
                        <div className="p-3 bg-(--background) rounded-2xl border border-(--border) flex flex-col items-center">
                          <span className="text-[9px] text-(--muted) font-black uppercase tracking-widest">Süre</span>
                          <span className="text-lg font-black text-(--foreground) mt-1 flex items-center gap-1">
                            <Clock size={14} className="text-(--primary)" />
                            {treatmentPlan.estimated_time_mins} dk
                          </span>
                        </div>
                      </div>

                      {/* Tedavi Kalemleri */}
                      <div className="space-y-3">
                        {treatmentPlan.all_procedures.map((proc: any, idx: number) => {
                          const urgencyColor = proc.urgency === 'Kritik' ? 'text-rose-500 border-rose-500/20 bg-rose-500/5'
                            : proc.urgency === 'Yüksek' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                            : proc.urgency === 'Orta' ? 'text-blue-500 border-blue-500/20 bg-blue-500/5'
                            : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
                          return (
                            <div key={idx} className="p-3 bg-(--background) border border-(--border) rounded-2xl flex flex-col gap-2 hover:border-(--primary)/30 transition-all">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-[10px] font-black text-(--foreground) uppercase tracking-wide">{proc.treatment_title}</h4>
                                  <p className="text-[9px] text-(--muted) font-bold uppercase tracking-wider mt-0.5">Diş #{proc.tooth_id} • {proc.finding_type}</p>
                                </div>
                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md border ${urgencyColor}`}>
                                  {proc.urgency}
                                </span>
                              </div>
                              <p className="text-[9px] text-(--muted) leading-relaxed border-t border-(--border)/40 pt-1.5">{proc.clinical_notes}</p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
              {/* Background Glow */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-(--primary) opacity-5 blur-[50px] rounded-full pointer-events-none" />
            </div>

            <div className="flex-1 aura-card p-6 flex flex-col gap-4 bg-(--surface) border border-(--border) rounded-3xl relative overflow-hidden">
               <div className="flex items-center gap-3 border-b border-(--border) pb-4">
                  <div className="w-8 h-8 bg-(--primary)/10 rounded-lg flex items-center justify-center text-(--primary)">
                    <MessageSquare size={16} />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-widest text-(--foreground)">Aura AI Asistan</span>
               </div>
               <div className="flex-1 flex flex-col justify-start gap-6 overflow-hidden">
                  <div className="bg-(--background) p-5 rounded-3xl rounded-tl-none border border-(--border) text-[11px] leading-relaxed text-(--foreground) shadow-sm overflow-y-auto custom-scrollbar flex-1">
                    {isAnalyzing ? "Şu an radyografiyi mühürlü beyin ağımızda işliyorum cerrahım. Lokal model koordinatları hesaplarken, Gemini Vision motoru genel tabloyu yorumluyor..." : 
                     geminiReport ? (
                        <div className="whitespace-pre-wrap font-medium space-y-2" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(geminiReport.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-blue-500">$1</span>')) }} />
                     ) :
                     findings[0]?.confidence > 0 ? `Lokal analiz tamamlandı. Ancak Gemini Vision devrede değil.` :
                     "Merhabalar Cerrahım. Analiz için bir görüntü mühürlendiğinde klinik asistanınız olarak burada olacağım."}
                  </div>
                  <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Aura'ya sorun..." 
                      className="w-full bg-(--background) border border-(--border) rounded-2xl px-6 py-4 text-xs outline-none focus:border-(--primary)/40 transition-all text-(--foreground)"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted) group-hover:text-(--primary) transition-colors">
                      <ChevronRight size={18} />
                    </div>
                  </div>
               </div>
            </div>
          </aside>
        </section>
      </main>

      {/* 🏛️ AI UPLOADER MODAL */}
      <AnimatePresence>
        {showUploader && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-black/60 backdrop-blur-xl flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-(--surface) border border-(--border) rounded-[40px] shadow-2xl relative p-4"
            >
              <button 
                onClick={() => setShowUploader(false)}
                className="absolute top-6 right-6 p-2 bg-(--background) hover:bg-rose-500/10 text-(--muted) hover:text-rose-500 rounded-xl transition-all z-10"
              >
                <X size={20} />
              </button>
              
              <DicomUploader onUploadComplete={handleUploadComplete} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏛️ CLINICAL TIMELINE MODAL */}
      <AnimatePresence>
        {showTimeline && (
          <PatientTimeline 
            patientId="76A22DC2" 
            onClose={() => setShowTimeline(false)} 
          />
        )}
      </AnimatePresence>

      {/* 🏛️ CLINICAL PERIODONTAL CHART MODAL */}
      <AnimatePresence>
        {showPerio && (
          <PerioChart 
            patientId="76A22DC2" 
            onClose={() => setShowPerio(false)} 
          />
        )}
      </AnimatePresence>

      {/* 🏛️ CLINICAL CEPHALOMETRIC ANALYSIS MODAL */}
      <AnimatePresence>
        {showCeph && (
          <CephAnalysis 
            file={uploadedFile} 
            onClose={() => setShowCeph(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const NavItem = ({ icon, active = false }: { icon: React.ReactNode, active?: boolean }) => (
  <div className={`cursor-pointer p-4 rounded-2xl transition-all ${active ? 'bg-(--primary) text-(--primary-foreground) shadow-lg shadow-(--primary)/20' : 'text-(--muted) hover:text-(--primary) hover:bg-(--background)'}`}>
    {icon}
  </div>
);

const DiagnosisItem = ({ label, location, confidence, severity, consensus }: { label: string, location: string, confidence: number, severity?: string, consensus?: string }) => {
  const borderStyle = consensus === 'Onaylı' ? 'border-emerald-500/40 bg-emerald-500/5' 
    : consensus === 'Muhtemel' ? 'border-amber-500/40 bg-amber-500/5' 
    : consensus === 'Belirsiz' ? 'border-dashed border-rose-500/40 bg-rose-500/5' 
    : 'border-(--border)';
  
  return (
  <div className={`p-4 bg-(--background) rounded-2xl border-2 ${borderStyle} hover:border-(--primary)/40 transition-all cursor-pointer group flex flex-col gap-2`}>
    <div className="flex justify-between items-center">
      <span className={`text-xs font-bold uppercase tracking-tight ${severity === 'Kritik' ? 'text-rose-500' : 'text-(--foreground)'}`}>{label}</span>
      <span className={`text-[10px] font-black ${confidence >= 90 ? 'text-emerald-500' : confidence >= 70 ? 'text-(--primary)' : 'text-rose-500'}`}>%{confidence}</span>
    </div>
    
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-(--muted) font-bold uppercase tracking-widest">{location}</span>
      <ChevronRight size={14} className="text-(--muted) group-hover:translate-x-1 transition-transform" />
    </div>
    
    {/* P3-1: Hekim Doğrulaması Uyarısı (Güvenlik Kalkanı) */}
    {confidence < 70 && confidence > 0 && (
        <div className="mt-1 flex items-center gap-1.5 px-2 py-1 bg-rose-500/10 rounded-md border border-rose-500/20 w-fit">
            <AlertCircle size={10} className="text-rose-500" />
            <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Hekim Doğrulaması Şart</span>
        </div>
    )}
  </div>
  );
};
