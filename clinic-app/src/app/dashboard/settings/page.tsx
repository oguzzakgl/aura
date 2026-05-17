"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { Settings, Globe, Bell, Shield, Save, Check, Mail, Lock, Smartphone, Eye, EyeOff, Moon, Sun, Palette, Zap } from 'lucide-react';

type TabType = 'language' | 'appearance' | 'notifications' | 'security';

export default function SettingsPage() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('language');
  const [showPassword, setShowPassword] = useState(false);

  const tabs = [
    { id: 'language', icon: Globe, label: t('language') },
    { id: 'appearance', icon: Palette, label: 'Görünüm' },
    { id: 'notifications', icon: Bell, label: 'Bildirimler' },
    { id: 'security', icon: Shield, label: 'Güvenlik' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* 🏛️ HEADER */}
      <div>
        <div className="flex items-center gap-3 mb-1 text-(--primary)">
          <Settings size={24} />
          <h1 className="text-3xl font-semibold text-(--foreground) tracking-tight">{t('settings')}</h1>
        </div>
        <p className="text-sm text-(--muted) font-medium italic">Klinik tercihlerinizi ve uygulama ayarlarını yönetin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 🧭 SIDE TABS (Minimalist) */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-semibold text-sm transition-all ${
                activeTab === tab.id 
                  ? 'bg-(--primary) text-(--primary-foreground) shadow-lg shadow-(--primary)/20' 
                  : 'text-(--muted) hover:bg-(--surface-hover) hover:text-(--foreground)'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* 🏛️ SETTINGS CONTENT (Theme-Aware Surface) */}
        <div className="md:col-span-2">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="aura-card p-8 bg-(--surface) border border-(--border)"
          >
            {/* 🌍 LANGUAGE TAB */}
            {activeTab === 'language' && (
              <div className="space-y-8">
                <SectionHeader icon={<Globe size={20} />} title={t('language')} desc={t('changeLanguage')} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'en', label: 'English (US)', flag: '🇺🇸' },
                    { id: 'tr', label: 'Türkçe (TR)', flag: '🇹🇷' },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setLanguage(lang.id as 'en' | 'tr')}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        language === lang.id 
                          ? 'border-(--primary) bg-(--primary)/5' 
                          : 'border-(--border) bg-(--background)/50 hover:border-(--primary)/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{lang.flag}</span>
                        <span className={`text-sm font-semibold ${language === lang.id ? 'text-(--primary)' : 'text-(--foreground)'}`}>
                          {lang.label}
                        </span>
                      </div>
                      {language === lang.id && <Check size={16} className="text-(--primary)" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🎨 APPEARANCE TAB (Minimalist Clinical Modes) */}
            {activeTab === 'appearance' && (
              <div className="space-y-8">
                <SectionHeader icon={<Palette size={20} />} title="Görünüm" desc="Aura klinik arayüz temasını seçin" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Light', desc: 'Klasik Klinik', icon: Sun, color: 'text-orange-500' },
                    { id: 'midnight', label: 'Midnight', desc: 'Gece Mavisi', icon: Moon, color: 'text-indigo-400' },
                    { id: 'dark', label: 'Pure Dark', desc: 'AMOLED Siyah', icon: Zap, color: 'text-emerald-500' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id as any)}
                      className={`flex flex-col gap-4 p-5 rounded-3xl border-2 transition-all text-left ${
                        theme === item.id 
                          ? 'border-(--primary) bg-(--primary)/5 shadow-lg scale-[1.02]' 
                          : 'border-(--border) bg-(--background)/50 hover:border-(--primary)/30'
                      }`}
                    >
                      <div className={`w-10 h-10 bg-(--background) rounded-xl flex items-center justify-center shadow-sm border border-(--border)`}>
                        <item.icon size={20} className={item.color} />
                      </div>
                      <div className="space-y-0.5">
                        <span className={`font-bold text-sm ${theme === item.id ? 'text-(--primary)' : 'text-(--foreground)'}`}>
                          {item.label}
                        </span>
                        <p className="text-[10px] text-(--muted) font-medium uppercase tracking-tighter">{item.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 🔔 NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <SectionHeader icon={<Bell size={20} />} title="Bildirimler" desc="Güncellemeleri nasıl alacağınızı yapılandırın" />
                <div className="space-y-4">
                  {[
                    { title: 'E-posta Bildirimleri', desc: 'Günlük ajanda ve hasta güncellemelerini e-posta ile alın.', icon: Mail },
                    { title: 'SMS Uyarıları', desc: 'Acil değişiklikler ve randevu hatırlatıcıları.', icon: Smartphone },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-(--border) bg-(--background)/30">
                      <div className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-(--surface) rounded-xl flex items-center justify-center text-(--muted) border border-(--border)">
                          <item.icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-(--foreground)">{item.title}</p>
                          <p className="text-[10px] text-(--muted) max-w-[200px]">{item.desc}</p>
                        </div>
                      </div>
                      <Toggle checked={i === 0} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🛡️ SECURITY TAB */}
            {activeTab === 'security' && (
              <div className="space-y-8">
                <SectionHeader icon={<Shield size={20} />} title="Güvenlik" desc="Klinik verilerinizi koruyun" />
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-(--muted) uppercase tracking-widest px-1">Mevcut Şifre</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted)" size={18} />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-4 bg-(--background)/50 border border-(--border) rounded-2xl text-sm focus:border-(--primary) transition-all outline-none"
                      />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--foreground)"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-5 items-start">
                    <Shield className="text-amber-500 shrink-0" size={24} />
                    <div>
                      <p className="text-sm font-bold text-amber-500">İki Faktörlü Doğrulama (2FA)</p>
                      <p className="text-xs text-(--muted) mb-4 mt-1">Hesabınıza ekstra bir güvenlik katmanı ekleyin.</p>
                      <button className="bg-amber-500 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors">Etkinleştir</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 💾 SAVE ACTION */}
            <div className="mt-12 pt-8 border-t border-(--border) flex justify-end">
              <button className="bg-(--primary) text-(--primary-foreground) px-10 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-xl shadow-(--primary)/20 hover:scale-105 active:scale-95 transition-all">
                <Save size={20} /> {t('saveChanges')}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const SectionHeader = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex items-center gap-4 pb-6 border-b border-(--border)">
    <div className="w-12 h-12 bg-(--primary)/10 rounded-2xl flex items-center justify-center text-(--primary)">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-bold text-(--foreground) tracking-tight">{title}</h3>
      <p className="text-xs text-(--muted) italic">{desc}</p>
    </div>
  </div>
);

const Toggle = ({ checked }: { checked: boolean }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" className="sr-only peer" defaultChecked={checked} />
    <div className="w-11 h-6 bg-(--secondary) peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--primary)"></div>
  </label>
);
