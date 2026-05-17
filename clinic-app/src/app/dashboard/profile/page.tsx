"use client";

import React from 'react';
import { UserCircle, Mail, Phone, MapPin, Camera, Shield, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-12 p-6">
      {/* 🏛️ PROFILE HEADER (Chief Surgeon) */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-10 pb-12 border-b border-(--border)">
        <div className="relative group">
          <div className="w-40 h-40 bg-(--surface) rounded-[3rem] flex items-center justify-center text-(--muted) border-4 border-(--border) shadow-2xl transition-all group-hover:border-(--primary)/30">
            <UserCircle size={80} className="opacity-40" />
          </div>
          <button className="absolute -bottom-2 -right-2 w-12 h-12 bg-(--primary) text-(--primary-foreground) rounded-2xl flex items-center justify-center shadow-xl border-4 border-(--surface) hover:scale-110 transition-all active:scale-95">
            <Camera size={20} />
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left mb-2">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-4xl font-bold text-(--foreground) tracking-tighter">Cerrah Oğuz</h1>
            <Shield size={24} className="text-emerald-500" />
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-(--muted) italic">
            <span className="flex items-center gap-2 bg-(--primary)/5 px-3 py-1 rounded-full border border-(--primary)/10 text-(--primary)">
               <Activity size={14} /> Başhekim • Aura Core
            </span>
            <span>•</span>
            <span>Kıdemli Dental Diagnostik Uzmanı</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* 📋 CONTACT & SYSTEM INFO */}
        <div className="md:col-span-2 space-y-10">
          <div className="space-y-6">
            <h3 className="text-xs font-black text-(--muted) uppercase tracking-[0.3em] px-1">Klinik Kimlik Bilgileri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ProfileItem icon={<Mail size={20} />} label="KURUMSAL E-POSTA" value="oguz@aura.clinical" />
              <ProfileItem icon={<Phone size={20} />} label="KLİNİK HATTI" value="+90 (555) AURA-00" />
              <ProfileItem icon={<MapPin size={20} />} label="LOKASYON" value="Istanbul Clinical Hub" />
              <ProfileItem icon={<Zap size={20} />} label="ERİŞİM SEVİYESİ" value="Level 7 - Titanium" color="text-amber-500" />
            </div>
          </div>
        </div>

        {/* 🧬 SYSTEM STATUS CARD */}
        <div className="aura-card p-8 bg-(--surface) border border-(--border) flex flex-col items-center text-center">
           <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 border border-emerald-500/20">
              <Zap size={32} />
           </div>
           <h4 className="font-bold text-(--foreground) text-lg mb-2 tracking-tight">AI Senkronizasyonu</h4>
           <p className="text-xs text-(--muted) mb-8 italic">Aura AI Core ile %100 senkronize çalışıyorsunuz.</p>
           <div className="w-full h-2 bg-(--background) rounded-full overflow-hidden mb-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '98%' }}
                className="h-full bg-emerald-500"
              />
           </div>
           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">%98 Kararlılık</span>
        </div>
      </div>
    </div>
  );
}

const ProfileItem = ({ icon, label, value, color = "text-(--muted)" }: { icon: React.ReactNode, label: string, value: string, color?: string }) => (
  <div className="flex items-center gap-6 p-6 bg-(--surface) rounded-3xl border border-(--border) group hover:border-(--primary)/30 transition-all shadow-sm">
    <div className={`w-14 h-14 bg-(--background) ${color} rounded-2xl flex items-center justify-center border border-(--border) group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-(--muted) uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className="text-sm font-bold text-(--foreground) tracking-tight">{value}</p>
    </div>
  </div>
);
