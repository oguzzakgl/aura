"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, MoreVertical, Plus, 
  Bot, Calendar, Clock, RefreshCcw, ChevronDown, 
  SearchX, Activity
} from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

const initialAppointments = [
  { id: 1, patient: 'Hacer Erkan', phone: '111111111111', service: 'Kanal Tedavisi', duration: '45 dk', date: '14 Mayıs 2026', time: '14:30 - 15:15', source: 'Aura AI', status: 'Onaylı' },
  { id: 2, patient: 'Sample User', phone: '111111111111', service: 'Genel Muayene', duration: '15 dk', date: '14 Mayıs 2026', time: '16:30 - 16:45', source: 'Aura AI', status: 'Tamamlandı' },
  { id: 3, patient: 'Cerrah Oğuz', phone: '111111111111', service: 'İmplant Operasyonu', duration: '60 dk', date: '15 Mayıs 2026', time: '10:00 - 11:00', source: 'Manual', status: 'Onaylı' },
  { id: 4, patient: 'Ayşe Yılmaz', phone: '111111111111', service: 'Dolgu', duration: '30 dk', date: '15 Mayıs 2026', time: '11:30 - 12:00', source: 'Aura AI', status: 'İptal' },
  { id: 5, patient: 'Mehmet Demir', phone: '999999999999', service: 'Diş Beyazlatma', duration: '30 dk', date: '16 Mayıs 2026', time: '09:00 - 09:30', source: 'Aura AI', status: 'Randevulu' },
];

const statusStyles: Record<string, string> = {
  'Tamamlandı': 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
  'Onaylı': 'bg-(--primary)/10 text-(--primary) border border-(--primary)/20',
  'İptal': 'bg-red-500/10 text-red-500 border border-red-500/20',
  'Gelmedi': 'bg-orange-500/10 text-orange-500 border border-orange-500/20',
  'Randevulu': 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
};

export default function AppointmentsPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState(language === 'tr' ? 'Tümü' : 'All');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = language === 'tr' 
    ? ['Tümü', 'Randevulu', 'Onaylı', 'Tamamlandı', 'İptal']
    : ['All', 'Booked', 'Confirmed', 'Completed', 'Cancelled'];

  // 🏥 FILTER LOGIC
  const filteredAppointments = useMemo(() => {
    return initialAppointments.filter(app => {
      // Tab Filter
      const matchesTab = activeTab === 'Tümü' || activeTab === 'All' || app.status === activeTab;
      
      // Search Filter (Name or Service)
      const matchesSearch = app.patient.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            app.service.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchTerm]);

  return (
    <div className="space-y-12 p-4">
      {/* 🏛️ HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2 text-(--primary)">
            <Calendar size={28} />
            <h1 className="text-3xl font-semibold text-(--foreground) tracking-tight">{t('appointments')}</h1>
          </div>
          <p className="text-sm text-(--muted) font-medium italic">Klinik vaka trafiği: {filteredAppointments.length} kayıt listeleniyor</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={() => {setActiveTab('Tümü'); setSearchTerm('');}} className="p-4 bg-(--surface) border border-(--border) rounded-2xl text-(--muted) hover:text-(--primary) transition-all shadow-sm">
            <RefreshCcw size={20} />
          </button>
          <button className="bg-(--primary) text-(--primary-foreground) px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-xl shadow-(--primary)/20 hover:scale-105 active:scale-95 transition-all">
            <Plus size={20} /> {language === 'tr' ? 'Yeni Randevu' : 'New Session'}
          </button>
        </div>
      </div>

      {/* 🔍 TABS & FILTERS */}
      <div className="bg-(--surface) p-4 rounded-3xl border border-(--border) shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 transition-colors">
        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-(--primary) text-(--primary-foreground) shadow-lg shadow-(--primary)/20' 
                  : 'text-(--muted) hover:bg-(--background) hover:text-(--foreground)'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted) group-focus-within:text-(--primary) transition-colors" size={18} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'tr' ? 'Hasta veya hizmet ara...' : 'Search clinical records...'} 
              className="w-full pl-12 pr-6 py-3.5 bg-(--background) border border-transparent rounded-2xl text-xs outline-none focus:border-(--primary)/30 transition-all text-(--foreground)"
            />
          </div>
          <button className="flex items-center gap-3 px-6 py-3.5 bg-(--background) border border-(--border) rounded-2xl text-xs font-bold text-(--foreground) hover:border-(--primary) transition-all">
            <Filter size={16} /> {language === 'tr' ? 'Gelişmiş' : 'Advanced'} <ChevronDown size={14} className="opacity-40" />
          </button>
        </div>
      </div>

      {/* 📊 CLINICAL LOG TABLE */}
      <div className="aura-card bg-(--surface) border border-(--border) overflow-hidden transition-colors shadow-2xl">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-(--muted) uppercase tracking-[0.2em] border-b border-(--border)">
                <th className="px-10 py-6">{language === 'tr' ? 'Hasta Portföyü' : 'Patient Case'}</th>
                <th className="px-10 py-6">{language === 'tr' ? 'Klinik Hizmet' : 'Service Type'}</th>
                <th className="px-10 py-6">{language === 'tr' ? 'Zaman Dilimi' : 'Timeline'}</th>
                <th className="px-10 py-6">{language === 'tr' ? 'Kanal' : 'Channel'}</th>
                <th className="px-10 py-6 text-right">{language === 'tr' ? 'Durum' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              <AnimatePresence mode="popLayout">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((app, i) => (
                    <motion.tr 
                      key={app.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-(--background)/30 transition-colors group"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-black/5 ${
                            i % 3 === 0 ? 'bg-blue-500' : i % 3 === 1 ? 'bg-teal-500' : 'bg-indigo-500'
                          }`}>
                            {app.patient[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-(--foreground) tracking-tight">{app.patient}</p>
                            <p className="text-[10px] text-(--muted) font-medium mt-1 uppercase tracking-tighter">{app.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-sm font-semibold text-(--foreground)">{app.service}</p>
                        <p className="text-[10px] text-(--muted) font-medium mt-1 italic">{app.duration}</p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="text-sm font-bold text-(--foreground)">{app.date}</p>
                        <div className="flex items-center gap-2 text-[10px] text-(--muted) font-medium mt-1 uppercase">
                          <Clock size={12} className="opacity-40" /> {app.time}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-(--background) text-(--primary) text-[10px] font-black border border-(--border) uppercase tracking-widest">
                          <Bot size={14} /> {app.source}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-5">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusStyles[app.status] || 'bg-(--background) text-(--muted)'}`}>
                            {app.status}
                          </span>
                          <button className="p-2 text-(--muted) hover:text-(--foreground) transition-colors">
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-10 py-24 text-center">
                      <div className="flex flex-col items-center gap-4 text-(--muted)">
                        <SearchX size={48} className="opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-widest italic">Aradığınız vaka bulunamadı cerrahım.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
