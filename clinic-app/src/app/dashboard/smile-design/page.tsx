"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Upload, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';

export default function SmileDesignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [treatments, setTreatments] = useState<string>('Zirkonyum kaplama, Diş beyazlatma');
  const [loading, setLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResultImage(null);
    }
  };

  const handleSimulate = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('treatments', treatments);

      // Backend API Çağrısı
      const response = await fetch('http://localhost:8001/simulate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Yapay zeka motoru ile bağlantı kurulamadı. Lütfen Core terminalinin açık olduğundan emin olun.');
      }

      const data = await response.json();
      setResultImage(data.generated_image_url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8 bg-slate-50/50">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* BAŞLIK */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-brand-primary shadow-sm border border-slate-100">
              <Sparkles size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gülüş Tasarımı Simülatörü</h1>
              <p className="text-slate-500 text-sm font-medium mt-1">Generative AI ile hastalarınızın tedavi sonrası görünümlerini saniyeler içinde simüle edin.</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest">Generative Engine Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SOL PANEL: GİRİŞ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-8"
          >
            <div>
              <label className="block text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">Hasta Fotoğrafı Yükle</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="mx-auto max-h-48 object-contain rounded-xl shadow-md" />
                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm">Değiştir</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-brand-primary transition-colors py-8">
                    <Upload size={36} className="mb-4" />
                    <span className="font-bold text-sm">Ağız İçi Fotoğraf Seç veya Sürükle</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-900 mb-3 uppercase tracking-wider">Uygulanacak Tedaviler</label>
              <input 
                type="text" 
                value={treatments}
                onChange={(e) => setTreatments(e.target.value)}
                placeholder="Örn: Zirkonyum, Beyazlatma, İmplant..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all font-medium text-slate-700 shadow-inner"
              />
              <p className="text-[11px] text-slate-400 font-medium mt-2 flex items-center gap-1">
                <Sparkles size={12} /> Prompt Engineering arka planda bu terimleri otomatik zenginleştirir.
              </p>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={!file || loading}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 disabled:hover:bg-slate-900 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Neural Engine İşliyor...' : 'Simülasyonu Başlat'}
            </button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold leading-relaxed">
                {error}
              </div>
            )}
          </motion.div>

          {/* SAĞ PANEL: ÇIKTI */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col relative overflow-hidden"
          >
            <label className="flex text-sm font-black text-slate-900 mb-4 uppercase tracking-wider justify-between items-center">
              <span>Tedavi Sonrası (After)</span>
              {resultImage && <span className="text-[10px] bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md">Simulated Result</span>}
            </label>
            
            <div className="flex-1 border-2 border-slate-100 bg-slate-50 rounded-2xl flex items-center justify-center relative overflow-hidden min-h-[400px]">
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    key="loading"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-brand-primary"
                  >
                    <div className="relative">
                      <Loader2 className="animate-spin w-12 h-12 mb-4" />
                      <div className="absolute inset-0 bg-brand-primary/20 blur-xl rounded-full"></div>
                    </div>
                    <span className="text-sm font-bold tracking-widest uppercase animate-pulse">Üretiliyor...</span>
                  </motion.div>
                ) : resultImage ? (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img src={resultImage} alt="Simulated Result" className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-slate-900 font-bold text-[10px] px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <CheckCircle size={12} className="text-emerald-500" /> Tamamlandı
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="placeholder"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex flex-col items-center text-slate-300"
                  >
                    <ImageIcon size={64} className="mb-4 opacity-50" />
                    <span className="text-sm font-bold text-slate-400">Sonuç burada görüntülenecektir</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {resultImage && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 w-full bg-slate-100 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-200 transition-all shadow-sm"
              >
                Hastaya Gönder (SMS / QR)
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
