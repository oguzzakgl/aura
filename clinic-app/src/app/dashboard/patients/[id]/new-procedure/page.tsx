"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Stethoscope, 
  DollarSign, 
  Calendar as CalendarIcon, 
  FileText,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function NewProcedurePage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* HEADER */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => router.back()}
          className="p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-(--color-brand-primary)/20 transition-all shadow-sm"
        >
          <ArrowLeft size={24} className="text-slate-500" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            {language === 'tr' ? 'Yeni Cerrahi İşlem' : 'New Surgical Procedure'}
          </h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
            {language === 'tr' ? 'Hasta ID' : 'Patient ID'}: #{params.id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* MAIN FORM */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-10 shadow-xl shadow-slate-200/20">
            <div className="space-y-8">
              {/* PROCEDURE TYPE */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                  {language === 'tr' ? 'İşlem Türü' : 'Procedure Type'}
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <select className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none appearance-none transition-all">
                    <option>{language === 'tr' ? 'Diş Çekimi' : 'Tooth Extraction'}</option>
                    <option>{language === 'tr' ? 'İmplant Yerleşimi' : 'Implant Placement'}</option>
                    <option>{language === 'tr' ? 'Kanal Tedavisi' : 'Root Canal'}</option>
                    <option>{language === 'tr' ? 'Dolgu' : 'Filling'}</option>
                    <option>{language === 'tr' ? 'Ortodontik Müdahale' : 'Orthodontic Procedure'}</option>
                  </select>
                </div>
              </div>

              {/* DATE & COST */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                    {language === 'tr' ? 'Tarih' : 'Date'}
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="date" className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                    {language === 'tr' ? 'Ücret (₺)' : 'Cost (₺)'}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input type="number" placeholder="0.00" className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* NOTES */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                  {language === 'tr' ? 'Operasyon Notları' : 'Surgical Notes'}
                </label>
                <div className="relative">
                  <FileText className="absolute left-5 top-5 text-slate-400" size={20} />
                  <textarea 
                    rows={6}
                    placeholder={language === 'tr' ? 'Operasyon detaylarını buraya mühürleyin...' : 'Enter surgical details here...'}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-(--color-brand-primary)/20 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR / SUMMARY */}
        <div className="space-y-6">
          <div className="bg-(--color-brand-primary) rounded-[2.5rem] p-8 text-white shadow-xl shadow-teal-900/20">
            <h3 className="font-black text-lg uppercase tracking-tighter mb-6">
              {language === 'tr' ? 'İşlem Özeti' : 'Procedure Summary'}
            </h3>
            <div className="space-y-4 opacity-90">
              <div className="flex justify-between text-xs">
                <span>{language === 'tr' ? 'Analiz Durumu' : 'AI Status'}</span>
                <span className="font-bold">Titanium Ready</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>{language === 'tr' ? 'Güvenlik Protokolü' : 'Security'}</span>
                <span className="font-bold">SHA-256 Active</span>
              </div>
            </div>
            <button 
              onClick={() => {
                setIsSaving(true);
                setTimeout(() => {
                  router.back();
                }, 2000);
              }}
              disabled={isSaving}
              className="w-full mt-10 py-4 bg-white text-(--color-brand-primary) rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-(--color-brand-primary)/30 border-t-(--color-brand-primary) rounded-full animate-spin"></div>
              ) : (
                <><Save size={18} /> {language === 'tr' ? 'İşlemi Mühürle' : 'Seal Procedure'}</>
              )}
            </button>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/20 rounded-4xl p-6 border border-rose-100 dark:border-rose-900/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-rose-600 mt-1" size={20} />
              <div>
                <p className="text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-tighter mb-1">Cerrahi Uyarı</p>
                <p className="text-[10px] text-rose-700/70 dark:text-rose-400 font-medium">Bu işlem kaydedildikten sonra SHA-256 ile mühürlenecek ve yasal olarak değiştirilemez hale gelecektir.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
