"use client";

import React from 'react';
import { CreditCard, Zap, Download, Clock, CheckCircle2, ShieldCheck, TrendingUp, Box, AlertTriangle, Layers, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 p-6">
      {/* 🏛️ HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2 text-(--primary)">
            <CreditCard size={28} />
            <h1 className="text-3xl font-semibold text-(--foreground) tracking-tight">Finansal Yönetim</h1>
          </div>
          <p className="text-sm text-(--muted) font-medium italic">Abonelik planınızı ve ödeme geçmişinizi mühürleyin</p>
        </div>
        
        <button className="bg-(--surface) border border-(--border) text-(--foreground) px-6 py-3 rounded-2xl font-bold text-xs flex items-center gap-3 hover:border-(--primary) transition-all shadow-sm">
          <ShieldCheck size={18} className="text-(--primary)" /> Ödeme Yöntemi Ekle
        </button>
      </div>

      {/* ⚡ AURA ELITE PLAN CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-linear-to-br from-(--primary) to-(--primary)/80 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-(--primary)/20"
      >
        <Zap className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 rotate-12" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/20">Aura Elite Suite</span>
              <span className="text-xs font-bold text-white/60 italic">• 1 Haziran 2026 Yenileme</span>
            </div>
            <h2 className="text-5xl font-black mb-4 tracking-tighter">$299<span className="text-xl font-medium opacity-50">/ay</span></h2>
            <p className="text-sm text-white/80 font-medium leading-relaxed">Sınırsız AI teşhis, akıllı randevu asistanı ve 7/24 öncelikli cerrahi destek paketi aktif.</p>
          </div>
          
          <div className="bg-black/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
             <div className="flex items-center gap-3 mb-4 text-emerald-300">
                <CheckCircle2 size={18} />
                <span className="text-xs font-bold uppercase tracking-widest text-white">Aktif Özellikler</span>
             </div>
             <div className="space-y-3">
                {['Titanium Security', '99.9% AI Accuracy', 'Global CDN'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-white/70">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> {item}
                  </div>
                ))}
             </div>
          </div>
        </div>
      </motion.div>

      {/* 📊 USP ÖZELLİĞİ: AI ENVANTER & FİNANSAL ZEKASI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 📦 AI Envanter & Malzeme Sarfiyat Analitiği */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aura-card bg-(--surface) border border-(--border) p-8 rounded-[2.5rem] shadow-xl flex flex-col gap-6"
        >
          <div className="flex items-center justify-between border-b border-(--border) pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center border border-indigo-500/20">
                <Box size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-(--foreground) uppercase tracking-widest">Envanter & Sarfiyat Analitiği</h4>
                <p className="text-[9px] text-(--muted) italic font-medium">Her gece otomatik koşan CRON analitiği</p>
              </div>
            </div>
            <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2.5 py-1 rounded-md border border-emerald-500/20 uppercase tracking-widest">
              ÖNBELLEK AKTİF
            </span>
          </div>

          <div className="space-y-4">
            {[
              { name: 'Cerrahi İmplant Vidası', stock: 12, rate: '2.4 adet/hafta', status: 'Kritik Stok', color: 'text-red-500 bg-red-500/10 border-red-500/20' },
              { name: 'Kompozit Dolgu Seti', stock: 45, rate: '8.1 adet/hafta', status: 'Yeterli', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
              { name: 'Lokal Anestezi Ampulü', stock: 180, rate: '32 adet/hafta', status: 'Yeterli', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' }
            ].map((material, idx) => (
              <div key={idx} className="p-4 bg-(--background)/50 border border-(--border) rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-(--foreground)">{material.name}</p>
                  <p className="text-[9px] text-(--muted) font-bold uppercase tracking-wider mt-0.5">Tüketim: {material.rate}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-(--foreground)">{material.stock} adet</span>
                  <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${material.color}`}>
                    {material.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Tedarik Önerisi Paneli */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 relative overflow-hidden flex items-start gap-3">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5 animate-pulse" size={16} />
            <div>
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">AURA SUPPLY AI TAVSİYESİ</p>
              <p className="text-[10px] text-amber-300 leading-relaxed font-bold">
                Cerrahi İmplant Vidası stoku kritik eşik altındadır. Gelecek hafta planlanan 6 implant operasyonu göz önüne alınarak 15 adet ek tedarik siparişi verilmesi önerilir.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 📈 Hekim Finansal Zekası & Ciro Öngörüsü */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="aura-card bg-(--surface) border border-(--border) p-8 rounded-[2.5rem] shadow-xl flex flex-col gap-6"
        >
          <div className="flex items-center justify-between border-b border-(--border) pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center border border-purple-500/20">
                <TrendingUp size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black text-(--foreground) uppercase tracking-widest">Nöral Finansal Öngörü</h4>
                <p className="text-[9px] text-(--muted) italic font-medium">Büyüme ve gelir ciro tahmin modeli</p>
              </div>
            </div>
            <span className="bg-purple-500/10 text-purple-500 text-[8px] font-black px-2.5 py-1 rounded-md border border-purple-500/20 uppercase tracking-widest">
              AI CONFIDENCE: 96.4%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-(--background)/50 border border-(--border) rounded-2xl text-center">
              <p className="text-[9px] font-black text-(--muted) uppercase tracking-wider mb-1">GELECEK AY CİRO TAHMİNİ</p>
              <p className="text-2xl font-black text-(--foreground) tracking-tighter">$14,500.00</p>
            </div>
            
            <div className="p-5 bg-(--background)/50 border border-(--border) rounded-2xl text-center">
              <p className="text-[9px] font-black text-(--muted) uppercase tracking-wider mb-1">PROJEKSİYON BÜYÜME</p>
              <p className="text-2xl font-black text-emerald-500 tracking-tighter">+12.4%</p>
            </div>
          </div>

          {/* Minimalist Ciro Öngörü Grafiği */}
          <div className="flex-1 bg-(--background)/30 border border-(--border) rounded-2xl p-4 flex flex-col justify-between min-h-[140px]">
            <div className="flex justify-between items-center text-[8px] font-black text-(--muted) uppercase tracking-widest mb-2">
              <span>Şubat - Haziran 2026 Gelir Trendi (AI Forecast)</span>
            </div>
            
            {/* SVG Grafik */}
            <div className="w-full h-20 relative flex items-end">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5856D6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#5856D6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Alan Çizgisi */}
                <path d="M 0 30 Q 25 15 50 18 T 100 4 L 100 30 Z" fill="url(#chartGrad)" />
                {/* Trend Çizgisi */}
                <path d="M 0 30 Q 25 15 50 18 T 100 4" fill="none" stroke="#5856D6" strokeWidth="1.5" />
                {/* Tahmin Noktası */}
                <circle cx="100" cy="4" r="1.5" fill="#FFD60A" className="animate-ping origin-center" />
                <circle cx="100" cy="4" r="1" fill="#FF3B30" />
              </svg>
            </div>

            <div className="flex justify-between text-[8px] font-black text-(--muted) uppercase mt-2">
              <span>ŞUB</span>
              <span>MAR</span>
              <span>NİS</span>
              <span>MAY (Aktif)</span>
              <span className="text-purple-400">HAZ (AI Tahmin)</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 📊 INVOICE HISTORY */}
      <div className="space-y-6">
        <h3 className="text-xs font-black text-(--muted) uppercase tracking-[0.3em] px-1 flex items-center gap-3">
          <Clock size={16} /> ÖDEME KAYITLARI (AUDIT TRAIL)
        </h3>
        <div className="aura-card bg-(--surface) border border-(--border) overflow-hidden transition-colors">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-(--background)/50 text-[10px] font-black text-(--muted) uppercase tracking-[0.2em] border-b border-(--border)">
                <th className="px-10 py-6">Fatura Tarihi</th>
                <th className="px-10 py-6">Tutar (USD)</th>
                <th className="px-10 py-6">Durum</th>
                <th className="px-10 py-6 text-right">Eylem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              {[1, 2, 3].map((_, i) => (
                <tr key={i} className="hover:bg-(--background)/30 transition-all group">
                  <td className="px-10 py-8 text-sm font-bold text-(--foreground)">1 Mayıs 2026</td>
                  <td className="px-10 py-8">
                     <span className="text-lg font-black text-(--foreground) tracking-tighter">$299.00</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-4 py-1.5 rounded-xl border border-emerald-500/20 uppercase tracking-widest">
                      ÖDENDİ
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="p-3 bg-(--background) border border-(--border) rounded-xl text-(--primary) hover:scale-110 transition-all shadow-sm">
                      <Download size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
