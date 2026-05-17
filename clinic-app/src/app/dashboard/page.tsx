"use client";

import React from 'react';
import { 
  Calendar, Users, DollarSign, Sparkles, 
  ArrowUpRight, Plus, Activity, ChevronRight 
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { t, language } = useLanguage();

  const stats = [
    { title: language === 'tr' ? 'Toplam Randevu' : 'Total Appointments', value: '1,284', change: '+12%', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: language === 'tr' ? 'Yeni Hastalar' : 'New Patients', value: '154', change: '+18%', icon: Users, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { title: language === 'tr' ? 'Tahmini Gelir' : 'Estimated Revenue', value: '$45,200', change: '+7%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: language === 'tr' ? 'AI Başarı Oranı' : 'AI Accuracy', value: '98%', change: '+2%', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  const recentActivity = [
    { id: 1, user: 'Hacer Erkan', action: language === 'tr' ? 'randevu mühürlendi' : 'appointment locked', time: '2 dk önce', type: 'appointment' },
    { id: 2, user: 'Aura AI', action: language === 'tr' ? 'teşhis raporu hazır' : 'diagnostic report ready', time: '15 dk önce', type: 'ai' },
    { id: 3, user: 'Cerrah Oğuz', action: language === 'tr' ? 'vaka güncellendi' : 'case updated', time: '1 sa önce', type: 'profile' },
  ];

  return (
    <div className="space-y-12 p-4">
      {/* 🏛️ HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2 text-(--primary)">
            <Activity size={28} />
            <h1 className="text-3xl font-semibold text-(--foreground) tracking-tight">{t('dashboard')}</h1>
          </div>
          <p className="text-sm text-(--muted) font-medium italic">{t('welcome')}</p>
        </div>
        <button className="bg-(--primary) text-(--primary-foreground) px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-xl shadow-(--primary)/20 hover:scale-105 active:scale-95 transition-all">
          <Plus size={20} /> {language === 'tr' ? 'Yeni Randevu Oluştur' : 'New Clinical Session'}
        </button>
      </div>

      {/* 📊 STATS GRID (Breathable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="aura-card p-8 bg-(--surface) border border-(--border) group relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-8">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-current/10`}>
                <stat.icon size={24} />
              </div>
              <span className="flex items-center gap-1 text-emerald-500 text-[10px] font-black bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
                <ArrowUpRight size={12} /> {stat.change}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-(--muted) uppercase tracking-[0.2em] mb-2">{stat.title}</p>
              <h3 className="text-3xl font-bold text-(--foreground) tracking-tighter">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* 📉 CLINICAL ANALYTICS (Theme-Aware) */}
        <div className="lg:col-span-2 aura-card p-10 bg-(--surface) border border-(--border)">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-bold text-(--foreground) tracking-tight">{language === 'tr' ? 'Klinik Trafiği' : 'Patient Load Dynamics'}</h3>
              <p className="text-xs text-(--muted) mt-1 italic">Haftalık yoğunluk ve randevu analizi</p>
            </div>
            <select className="bg-(--background) border border-(--border) rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-3 outline-none focus:border-(--primary) transition-all text-(--muted)">
              <option>{language === 'tr' ? 'Son 7 Gün' : 'Last 7 Days'}</option>
              <option>{language === 'tr' ? 'Son 30 Gün' : 'Last 30 Days'}</option>
            </select>
          </div>
          <div className="h-72 w-full bg-(--background)/30 rounded-3xl flex items-center justify-center border border-dashed border-(--border) group hover:border-(--primary)/30 transition-all">
            <div className="flex flex-col items-center gap-4 text-(--muted)">
               <Activity size={32} className="opacity-20 group-hover:scale-110 transition-transform" />
               <p className="text-xs font-bold uppercase tracking-[0.2em]">{language === 'tr' ? 'Veri Görselleştirme Hazırlanıyor' : 'Analytics Engine Warming Up'}</p>
            </div>
          </div>
        </div>

        {/* ⚡ RECENT ACTIVITY (Clean Hierarchy) */}
        <div className="aura-card p-10 bg-(--surface) border border-(--border)">
          <h3 className="text-xl font-bold text-(--foreground) tracking-tight mb-10">{language === 'tr' ? 'Canlı Akış' : 'Live Audit Trail'}</h3>
          <div className="space-y-8">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-5 group cursor-pointer">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-current/10 transition-all group-hover:scale-110 ${
                  activity.type === 'appointment' ? 'bg-blue-500/10 text-blue-500' : 
                  activity.type === 'ai' ? 'bg-purple-500/10 text-purple-500' : 'bg-teal-500/10 text-teal-500'
                }`}>
                  {activity.type === 'appointment' ? <Calendar size={20} /> : 
                   activity.type === 'ai' ? <Sparkles size={20} /> : <Users size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-(--foreground) leading-snug">
                    <span className="font-bold">{activity.user}</span> <span className="text-(--muted)">{activity.action}</span>
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] font-bold text-(--muted) uppercase tracking-tighter">{activity.time}</p>
                    <ChevronRight size={12} className="text-(--muted) opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
