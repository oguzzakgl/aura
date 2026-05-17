"use client";

import React, { useState, useEffect, useRef } from "react";
import { Activity, ShieldAlert, Sparkles, X, Edit3, Check, Mic, MicOff, Volume2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PerioChartProps {
  patientId: string;
  onClose: () => void;
}

export const PerioChart = ({ patientId, onClose }: PerioChartProps) => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Düzenleme (Edit) modundaki diş
  const [editingTooth, setEditingTooth] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>(null);

  // 🎙️ Sesli Perio Asistanı State'leri
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [speechConfidence, setSpeechConfidence] = useState(0);
  const [assistantStatus, setAssistantStatus] = useState("Çevrimdışı");
  const [voiceGuideText, setVoiceGuideText] = useState("Sesli asistanı başlatmak için mikrofona tıklayın.");
  
  const recognitionRef = useRef<any>(null);

  const fetchChart = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/patients/${patientId}/perio`);
      if (!res.ok) throw new Error("Periodontal veri tablosu yüklenemedi.");
      const data = await res.json();
      setChartData(data);
    } catch (err: any) {
      setError(err.message || "Perio tablosu çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();
    
    // Web Speech API - SpeechRecognition Kurulumu
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "tr-TR"; // Türkçe Dil Desteği
      
      rec.onstart = () => {
        setIsListening(true);
        setAssistantStatus("Dinleniyor...");
        setVoiceGuideText("Diş numarasını ve ölçümü söyleyin. Örnek: 'Diş 16 Bukkal Mesial 5'");
        playAudioFeedback("Periodontal sesli asistan aktif. Sizi dinliyorum.");
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setAssistantStatus("Hata Oluştu");
      };

      rec.onend = () => {
        setIsListening(false);
        setAssistantStatus("Çevrimdışı");
      };

      rec.onresult = (event: any) => {
        const result = event.results[event.results.length - 1];
        const rawTranscript = result[0].transcript.trim().toLowerCase();
        const confidence = result[0].confidence;
        
        setTranscript(rawTranscript);
        setSpeechConfidence(Math.round(confidence * 100));

        // 🛡️ Antigravity %85 Güven Barajı Kontrolü
        if (confidence < 0.85) {
          playAudioFeedback("Anlaşılamadı, lütfen daha net ve tekrar söyleyin.");
          setVoiceGuideText("Güven skoru yetersiz. Lütfen tekrar edin.");
          return;
        }

        handleVoiceCommand(rawTranscript);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [patientId]);

  // Sesli Geri Bildirim (SpeechSynthesis)
  const playAudioFeedback = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "tr-TR";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Sesli Komut Regex ve Eşleştirme Motoru
  const handleVoiceCommand = async (command: string) => {
    // 🛡️ Zırhlı Dental Regex Parser
    const perioRegex = /^(diş)?\s*(1[1-8]|2[1-8]|3[1-8]|4[1-8])\s*(bukkal|lingual|palatinal)?\s*(mesial|distal|mid)?\s*([0-9])$/i;
    const bopRegex = /^(diş)?\s*(1[1-8]|2[1-8]|3[1-8]|4[1-8])\s*kanama\s*(evet|var|\+)/i;
    const confirmRegex = /^(onayla|kaydet|tamam)$/i;
    const retryRegex = /^(tekrarla|iptal|sil)$/i;

    // 1. Onay Komutu
    if (confirmRegex.test(command)) {
      if (editingTooth !== null && editForm) {
        await handleSaveEdit();
        playAudioFeedback("Ölçüm başarıyla kaydedildi.");
        setVoiceGuideText("Veri kaydedildi. Yeni komut bekliyorum.");
      } else {
        playAudioFeedback("Onaylanacak aktif bir veri girişi bulunmuyor.");
      }
      return;
    }

    // 2. Tekrarla / İptal Komutu
    if (retryRegex.test(command)) {
      setEditingTooth(null);
      setEditForm(null);
      playAudioFeedback("Son giriş iptal edildi, tekrar söyleyebilirsiniz.");
      setVoiceGuideText("Son veri girişi iptal edildi.");
      return;
    }

    // 3. Kanama (BOP) Giriş Komutu
    const bopMatch = command.match(bopRegex);
    if (bopMatch) {
      const toothId = parseInt(bopMatch[2]);
      const currentToothData = chartData?.teeth_data[toothId];
      if (currentToothData) {
        setEditingTooth(toothId);
        setEditForm({
          ...currentToothData,
          bleeding_on_probing: true
        });
        playAudioFeedback(`Diş ${toothId} için kanama pozitif olarak işaretlendi. Onaylıyor musunuz?`);
        setVoiceGuideText(`Diş #${toothId} Kanama (+) eklendi. 'Onayla' diyerek kaydedebilirsiniz.`);
      }
      return;
    }

    // 4. Standart Cep Derinliği / Ölçüm Komutu
    const match = command.match(perioRegex);
    if (match) {
      const toothId = parseInt(match[2]);
      let side = match[3] || "bukkal";
      if (side === "palatinal") side = "lingual"; // Palatinal'i lingual haritasına eşle
      const position = match[4] || "mesial";
      const value = parseInt(match[5]);

      const currentToothData = chartData?.teeth_data[toothId];
      if (currentToothData) {
        setEditingTooth(toothId);
        const updatedDepth = { ...currentToothData.pocket_depth };
        updatedDepth[side] = {
          ...updatedDepth[side],
          [position]: value
        };

        setEditForm({
          ...currentToothData,
          pocket_depth: updatedDepth
        });

        playAudioFeedback(`Diş ${toothId} ${side} ${position} değeri ${value} olarak ayarlandı. Onaylıyor musunuz?`);
        setVoiceGuideText(`Diş #${toothId} ${side} ${position} = ${value} mm. 'Onayla' diyerek kaydedin.`);
      }
    } else {
      playAudioFeedback("Anlaşılamadı. Lütfen 'Diş 16 Bukkal Mesial 5' şeklinde söyleyin.");
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Tarayıcınız Web Speech API'sini desteklemiyor. Google Chrome kullanmanızı öneririz.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleStartEdit = (toothId: number, data: any) => {
    setEditingTooth(toothId);
    setEditForm({ ...data });
  };

  const handleSaveEdit = async () => {
    if (editingTooth === null || !editForm) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/patients/${patientId}/perio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tooth_id: editingTooth,
          ...editForm
        })
      });
      if (res.ok) {
        const data = await res.json();
        setChartData(data);
        setEditingTooth(null);
        setEditForm(null);
      }
    } catch (err) {
      console.error("Failed to save periodontal data:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-8">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-6xl bg-zinc-950 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh] text-white"
      >
        {/* 👤 Üst Başlık Paneli */}
        <header className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">İnteraktif Periodontal Ölçüm Kartı (Periodontal Charting)</h3>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Hasta ID: #{patientId} • FDI Diş Numaralandırması</p>
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
            <span className="w-8 h-8 border-4 border-t-indigo-500 border-white/10 rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest animate-pulse">Periodontal harita yükleniyor...</p>
          </div>
        )}

        {error && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-rose-500 p-8 text-center">
            <ShieldAlert size={48} />
            <p className="text-xs font-black uppercase tracking-widest">{error}</p>
          </div>
        )}

        {chartData && !loading && !error && (
          <div className="flex-1 flex flex-col min-h-0 p-8 gap-6 overflow-hidden">
            
            {/* 🎙️ USP ÖZELLİĞİ: SESLİ PERİO ASİSTANI KONTROL PANELİ */}
            <div className="p-6 bg-zinc-900/45 border border-white/10 rounded-3xl grid grid-cols-12 gap-6 items-center shadow-lg relative overflow-hidden">
              
              {/* Mikrofon Butonu ve Glow Halka */}
              <div className="col-span-3 flex flex-col items-center justify-center gap-2 border-r border-white/5 pr-6">
                <div className="relative">
                  {isListening && (
                    <motion.span 
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 bg-rose-500/20 rounded-full blur-md"
                    />
                  )}
                  <button 
                    onClick={toggleListening}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md
                      ${isListening 
                        ? 'bg-rose-500 text-white shadow-rose-500/20 hover:scale-105' 
                        : 'bg-zinc-800 hover:bg-indigo-600 text-zinc-400 hover:text-white hover:scale-105'}`}
                  >
                    {isListening ? <Mic size={28} className="animate-pulse" /> : <MicOff size={28} />}
                  </button>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest mt-1 text-zinc-400">
                  {assistantStatus}
                </span>
              </div>

              {/* Asistan Canlı Rehber & Transkript */}
              <div className="col-span-6 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Volume2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">AURA PERİO REHBERİ</span>
                </div>
                <p className="text-xs font-bold text-white transition-all">
                  {voiceGuideText}
                </p>
                {transcript && (
                  <div className="mt-1 px-3 py-1.5 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider truncate">
                      Son Algılanan: <span className="text-emerald-400 italic">"{transcript}"</span>
                    </span>
                    <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                      Güven: %{speechConfidence}
                    </span>
                  </div>
                )}
              </div>

              {/* Sesli Komut Kılavuz Kartı */}
              <div className="col-span-3 bg-zinc-950/40 p-4 border border-white/5 rounded-2xl flex flex-col gap-1.5 h-full justify-center">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <HelpCircle size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Komut Sözlüğü</span>
                </div>
                <ul className="text-[8px] font-bold text-zinc-400 space-y-1">
                  <li>• "Diş 16 Bukkal Mesial 5" (Veri Girişi)</li>
                  <li>• "Diş 14 Kanama Evet" (BOP Girişi)</li>
                  <li>• "Onayla" / "Tekrarla" (Onay / Sil)</li>
                </ul>
              </div>

              {/* Background Accent glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />
            </div>

            {/* 📊 Üst Genel Göstergeler / Metrikler */}
            <div className="grid grid-cols-3 gap-6 shrink-0">
              <div className="p-5 bg-zinc-900/30 border border-white/5 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center text-lg font-black">%</div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Kanama İndeksi (BOP)</span>
                  <span className="text-xl font-black text-rose-500">{chartData.bleeding_index_pct}%</span>
                </div>
              </div>

              <div className="p-5 bg-zinc-900/30 border border-white/5 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center text-lg font-black">PD</div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Derin Cepli Bölgeler (≥4mm)</span>
                  <span className="text-xl font-black text-amber-500">{chartData.deep_pockets_count} Bölge</span>
                </div>
              </div>

              <div className="p-5 bg-zinc-900/30 border border-white/5 rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center text-lg font-black">AAP</div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">Periodontal Durum</span>
                  <span className="text-xl font-black text-emerald-500">Evre II (Kronik)</span>
                </div>
              </div>
            </div>

            {/* 🦷 Periodontal Detaylı Tablo */}
            <div className="flex-1 bg-zinc-900/10 border border-white/5 rounded-[32px] overflow-hidden flex flex-col min-h-0">
              <div className="flex-1 overflow-auto custom-scrollbar p-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                      <th className="pb-3 w-16">Diş</th>
                      <th className="pb-3">Bukkal Cep (Mesial-Mid-Distal)</th>
                      <th className="pb-3">Lingual Cep (Mesial-Mid-Distal)</th>
                      <th className="pb-3 w-20 text-center">BOP (Kanama)</th>
                      <th className="pb-3 w-20 text-center">Mobilite</th>
                      <th className="pb-3 w-20 text-center">Furkasyon</th>
                      <th className="pb-3 w-20 text-center">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[10px] font-bold">
                    {Object.entries(chartData.teeth_data).map(([toothStr, data]: [string, any]) => {
                      const toothId = parseInt(toothStr);
                      const isEditing = editingTooth === toothId;
                      
                      return (
                        <tr 
                          key={toothId} 
                          className={`transition-all hover:bg-white/5 
                            ${isEditing ? 'bg-indigo-500/5 border-l-2 border-indigo-500 pl-2' : ''}`}
                        >
                          {/* Diş Numarası */}
                          <td className="py-3.5 text-indigo-400 font-black text-xs">#{toothId}</td>
                          
                          {/* Bukkal Cep Derinlikleri */}
                          <td className="py-3.5">
                            {isEditing ? (
                              <div className="flex gap-2 w-32">
                                <input 
                                  type="number" 
                                  value={editForm.pocket_depth.buccal.mesial}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    pocket_depth: {
                                      ...editForm.pocket_depth,
                                      buccal: { ...editForm.pocket_depth.buccal, mesial: parseInt(e.target.value) }
                                    }
                                  })}
                                  className="w-8 bg-zinc-800 text-center rounded border border-white/10 py-0.5"
                                />
                                <input 
                                  type="number" 
                                  value={editForm.pocket_depth.buccal.mid}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    pocket_depth: {
                                      ...editForm.pocket_depth,
                                      buccal: { ...editForm.pocket_depth.buccal, mid: parseInt(e.target.value) }
                                    }
                                  })}
                                  className="w-8 bg-zinc-800 text-center rounded border border-white/10 py-0.5"
                                />
                                <input 
                                  type="number" 
                                  value={editForm.pocket_depth.buccal.distal}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    pocket_depth: {
                                      ...editForm.pocket_depth,
                                      buccal: { ...editForm.pocket_depth.buccal, distal: parseInt(e.target.value) }
                                    }
                                  })}
                                  className="w-8 bg-zinc-800 text-center rounded border border-white/10 py-0.5"
                                />
                              </div>
                            ) : (
                              <div className="flex gap-1.5 font-black">
                                <span className={data.pocket_depth.buccal.mesial >= 4 ? "text-rose-500" : "text-white"}>{data.pocket_depth.buccal.mesial}</span>
                                <span className="text-zinc-600">-</span>
                                <span className={data.pocket_depth.buccal.mid >= 4 ? "text-rose-500" : "text-white"}>{data.pocket_depth.buccal.mid}</span>
                                <span className="text-zinc-600">-</span>
                                <span className={data.pocket_depth.buccal.distal >= 4 ? "text-rose-500" : "text-white"}>{data.pocket_depth.buccal.distal}</span>
                              </div>
                            )}
                          </td>

                          {/* Lingual Cep Derinlikleri */}
                          <td className="py-3.5">
                            {isEditing ? (
                              <div className="flex gap-2 w-32">
                                <input 
                                  type="number" 
                                  value={editForm.pocket_depth.lingual.mesial}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    pocket_depth: {
                                      ...editForm.pocket_depth,
                                      lingual: { ...editForm.pocket_depth.lingual, mesial: parseInt(e.target.value) }
                                    }
                                  })}
                                  className="w-8 bg-zinc-800 text-center rounded border border-white/10 py-0.5"
                                />
                                <input 
                                  type="number" 
                                  value={editForm.pocket_depth.lingual.mid}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    pocket_depth: {
                                      ...editForm.pocket_depth,
                                      lingual: { ...editForm.pocket_depth.lingual, mid: parseInt(e.target.value) }
                                    }
                                  })}
                                  className="w-8 bg-zinc-800 text-center rounded border border-white/10 py-0.5"
                                />
                                <input 
                                  type="number" 
                                  value={editForm.pocket_depth.lingual.distal}
                                  onChange={(e) => setEditForm({
                                    ...editForm,
                                    pocket_depth: {
                                      ...editForm.pocket_depth,
                                      lingual: { ...editForm.pocket_depth.lingual, distal: parseInt(e.target.value) }
                                    }
                                  })}
                                  className="w-8 bg-zinc-800 text-center rounded border border-white/10 py-0.5"
                                />
                              </div>
                            ) : (
                              <div className="flex gap-1.5 font-black">
                                <span className={data.pocket_depth.lingual.mesial >= 4 ? "text-rose-500" : "text-white"}>{data.pocket_depth.lingual.mesial}</span>
                                <span className="text-zinc-600">-</span>
                                <span className={data.pocket_depth.lingual.mid >= 4 ? "text-rose-500" : "text-white"}>{data.pocket_depth.lingual.mid}</span>
                                <span className="text-zinc-600">-</span>
                                <span className={data.pocket_depth.lingual.distal >= 4 ? "text-rose-500" : "text-white"}>{data.pocket_depth.lingual.distal}</span>
                              </div>
                            )}
                          </td>

                          {/* Kanama BOP */}
                          <td className="py-3.5 text-center">
                            {isEditing ? (
                              <input 
                                type="checkbox" 
                                checked={editForm.bleeding_on_probing}
                                onChange={(e) => setEditForm({ ...editForm, bleeding_on_probing: e.target.checked })}
                                className="accent-rose-500"
                              />
                            ) : (
                              <span className={data.bleeding_on_probing ? "text-rose-500 font-black animate-pulse" : "text-zinc-500"}>
                                {data.bleeding_on_probing ? "KANAMA (+)" : "(-)"}
                              </span>
                            )}
                          </td>

                          {/* Mobilite */}
                          <td className="py-3.5 text-center">
                            {isEditing ? (
                              <select 
                                value={editForm.mobility}
                                onChange={(e) => setEditForm({ ...editForm, mobility: parseInt(e.target.value) })}
                                className="bg-zinc-800 border border-white/10 rounded px-1.5 py-0.5"
                              >
                                <option value="0">M0</option>
                                <option value="1">M1</option>
                                <option value="2">M2</option>
                                <option value="3">M3</option>
                              </select>
                            ) : (
                              <span className={data.mobility > 0 ? "text-amber-400 font-black" : "text-zinc-500"}>
                                {data.mobility > 0 ? `M${data.mobility}` : "-"}
                              </span>
                            )}
                          </td>

                          {/* Furkasyon */}
                          <td className="py-3.5 text-center">
                            {isEditing ? (
                              <select 
                                value={editForm.furkasyon || 0}
                                onChange={(e) => setEditForm({ ...editForm, furkasyon: parseInt(e.target.value) })}
                                className="bg-zinc-800 border border-white/10 rounded px-1.5 py-0.5"
                              >
                                <option value="0">F0</option>
                                <option value="1">FI</option>
                                <option value="2">FII</option>
                                <option value="3">FIII</option>
                              </select>
                            ) : (
                              <span className={data.furkasyon > 0 ? "text-indigo-400 font-black" : "text-zinc-500"}>
                                {data.furkasyon > 0 ? `F${data.furkasyon}` : "-"}
                              </span>
                            )}
                          </td>

                          {/* İşlem */}
                          <td className="py-3.5 text-center">
                            {isEditing ? (
                              <button 
                                onClick={handleSaveEdit}
                                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition-all"
                              >
                                <Check size={12} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleStartEdit(toothId, data)}
                                className="p-1.5 bg-zinc-800 hover:bg-indigo-500/20 text-zinc-400 hover:text-indigo-400 rounded-lg transition-all"
                              >
                                <Edit3 size={12} />
                              </button>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </motion.div>
    </div>
  );
};
