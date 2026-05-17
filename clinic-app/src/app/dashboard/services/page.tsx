"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, Plus, Edit2, Trash2, 
  Clock, DollarSign, Syringe, Microscope, Dna 
} from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

const services = [
  { id: 1, title: 'General Consultation', duration: '30 minutes', price: '$50', active: true, icon: Stethoscope },
  { id: 2, title: 'Follow Up Visit', duration: '15 minutes', price: '$30', active: true, icon: Syringe },
  { id: 3, title: 'Root Canal', duration: '45 minutes', price: '$150', active: true, icon: Microscope },
  { id: 4, title: 'Gum Surgery', duration: '50 minutes', price: '$200', active: true, icon: Dna },
];

export default function ServicesPage() {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-12 p-4">
      {/* 🏛️ HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2 text-(--primary)">
            <Stethoscope size={28} />
            <h1 className="text-3xl font-semibold text-(--foreground) tracking-tight">{t('services')}</h1>
          </div>
          <p className="text-sm text-(--muted) font-medium italic">
            {language === 'tr' ? `${services.length} aktif hizmet mühürlendi` : `${services.length} active services in inventory`}
          </p>
        </div>
        
        <button className="bg-(--primary) text-(--primary-foreground) px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-xl shadow-(--primary)/20 hover:scale-105 active:scale-95 transition-all">
          <Plus size={20} /> {language === 'tr' ? 'Yeni Hizmet Tanımla' : 'Add New Service'}
        </button>
      </div>

      {/* 🗂️ SERVICE GRID (Extended Spacing) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {services.map((service, i) => (
          <motion.div 
            key={service.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="aura-card p-8 bg-(--surface) border border-(--border) group transition-all"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="w-14 h-14 bg-(--background) border border-(--border) rounded-2xl flex items-center justify-center text-(--primary) shadow-sm group-hover:border-(--primary)/30 transition-all">
                <service.icon size={26} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Aktif</span>
              </div>
            </div>

            <h3 className="font-bold text-(--foreground) text-xl mb-6 tracking-tight leading-snug">{service.title}</h3>
            
            <div className="space-y-5 mb-10">
              <ServiceDetail label={language === 'tr' ? 'Süre' : 'Duration'} value={service.duration} icon={<Clock size={14} />} />
              <ServiceDetail label={language === 'tr' ? 'Birim Ücret' : 'Base Price'} value={service.price} icon={<DollarSign size={14} />} highlight />
            </div>

            <div className="pt-8 border-t border-(--border) flex items-center justify-between">
              <button className="flex items-center gap-2 text-(--muted) hover:text-(--primary) transition-colors text-[10px] font-bold uppercase tracking-widest">
                <Edit2 size={14} /> {language === 'tr' ? 'Düzenle' : 'Edit'}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-4 bg-(--primary) rounded-full relative cursor-pointer shadow-sm">
                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                </div>
                <button className="p-2 text-(--muted) hover:text-red-500 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const ServiceDetail = ({ label, value, icon, highlight = false }: { label: string, value: string, icon: React.ReactNode, highlight?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-(--muted)">{label}</span>
    <span className={`text-sm font-bold flex items-center gap-2 ${highlight ? 'text-(--primary)' : 'text-(--foreground)'}`}>
      <span className="opacity-40">{icon}</span> {value}
    </span>
  </div>
);
