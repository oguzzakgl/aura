"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, Search, Phone, Mail, 
  Filter, UserPlus, MoreHorizontal 
} from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';

const patients = [
  { id: 1, name: 'Oğuz', joined: 'Since May 2026', phone: '111111111111', email: 'oguz@example.com', color: 'bg-teal-500' },
  { id: 2, name: 'Ayşe Yılmaz', joined: 'Since May 2026', phone: '111111111111', email: 'ayse@example.com', color: 'bg-blue-500' },
  { id: 3, name: 'Mehmet Demir', joined: 'Since May 2026', phone: '999999999999', email: 'mehmet@example.com', color: 'bg-purple-500' },
  { id: 4, name: 'Demo User', joined: 'Since May 2026', phone: '999999999999', email: 'demo.patient@example.com', color: 'bg-orange-500' },
];

export default function PatientsPage() {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-12 p-4">
      {/* 🏛️ HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2 text-(--primary)">
            <Users size={28} />
            <h1 className="text-3xl font-semibold text-(--foreground) tracking-tight">{t('patients')}</h1>
          </div>
          <p className="text-sm text-(--muted) font-medium italic">
            {language === 'tr' ? `Toplam ${patients.length} kayıtlı hasta portföyü` : `Total ${patients.length} patients in clinical database`}
          </p>
        </div>
        
        <button className="bg-(--primary) text-(--primary-foreground) px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-xl shadow-(--primary)/20 hover:scale-105 active:scale-95 transition-all">
          <UserPlus size={20} /> {language === 'tr' ? 'Yeni Hasta Kaydı' : 'Add New Patient'}
        </button>
      </div>

      {/* 🔍 SEARCH & FILTER (Theme-Aware) */}
      <div className="bg-(--surface) p-6 rounded-3xl border border-(--border) shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-(--muted) group-focus-within:text-(--primary) transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={language === 'tr' ? 'İsim, telefon veya e-posta ile ara...' : 'Search clinical records...'} 
            className="w-full pl-14 pr-6 py-4 bg-(--background) border border-transparent rounded-2xl text-sm outline-none focus:border-(--primary)/30 transition-all text-(--foreground)"
          />
        </div>
        <button className="px-6 py-4 bg-(--background) border border-(--border) rounded-2xl text-sm font-bold text-(--foreground) hover:border-(--primary) transition-all flex items-center gap-3">
          <Filter size={18} /> {language === 'tr' ? 'Filtrele' : 'Filters'}
        </button>
      </div>

      {/* 🗂️ PATIENT GRID (Extended Spacing) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {patients.map((patient, i) => (
          <motion.div 
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="aura-card p-8 bg-(--surface) border border-(--border) group relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-(--muted) hover:text-(--primary) transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className={`w-24 h-24 ${patient.color} rounded-4xl flex items-center justify-center text-white text-4xl font-bold mb-6 shadow-2xl shadow-black/10`}>
                {patient.name[0]}
              </div>
              <h3 className="font-bold text-(--foreground) text-xl mb-1 tracking-tight">{patient.name}</h3>
              <p className="text-[10px] font-bold text-(--muted) uppercase tracking-[0.2em] mb-8">{patient.joined}</p>
              
              <div className="w-full space-y-4">
                <ContactInfo icon={<Phone size={14} />} value={patient.phone} />
                <ContactInfo icon={<Mail size={14} />} value={patient.email} />
              </div>

              <div className="mt-10 pt-8 border-t border-(--border) w-full">
                <Link href={`/dashboard/patients/${patient.id}`} className="block">
                  <button className="w-full py-4 rounded-2xl bg-(--background) border border-(--border) hover:border-(--primary) hover:text-(--primary) text-(--muted) text-xs font-bold transition-all uppercase tracking-widest">
                    {language === 'tr' ? 'Profili İncele' : 'View Case'}
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

const ContactInfo = ({ icon, value }: { icon: React.ReactNode, value: string }) => (
  <div className="flex items-center gap-4 text-(--muted) group/item transition-colors hover:text-(--foreground)">
    <div className="w-10 h-10 bg-(--background) rounded-xl flex items-center justify-center border border-(--border) group-hover/item:border-(--primary)/30">
      {icon}
    </div>
    <span className="text-xs font-semibold truncate">{value}</span>
  </div>
);
