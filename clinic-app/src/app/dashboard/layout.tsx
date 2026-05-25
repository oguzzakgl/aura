"use client";

import React from 'react';
import { 
  LayoutDashboard, Calendar, Users, Settings, LogOut, 
  ChevronLeft, Bell, Search, Stethoscope, Clock, 
  CreditCard, UserCircle, Bot, Sparkles 
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const sidebarItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/dashboard' },
    { icon: Bot, label: 'Aura AI', href: '/dashboard/ai-assistant' },
    { icon: Sparkles, label: 'Smile Design', href: '/dashboard/smile-design' },
    { icon: Calendar, label: t('calendar'), href: '/dashboard/calendar' },
    { icon: Clock, label: t('appointments'), href: '/dashboard/appointments' },
    { icon: Users, label: t('patients'), href: '/dashboard/patients' },
    { icon: Stethoscope, label: t('services'), href: '/dashboard/services' },
  ];

  const configItems = [
    { icon: Bot, label: t('aiSettings'), href: '/dashboard/ai-settings' },
    { icon: UserCircle, label: t('profile'), href: '/dashboard/profile' },
    { icon: CreditCard, label: t('billing'), href: '/dashboard/billing' },
    { icon: Settings, label: t('settings'), href: '/dashboard/settings' },
  ];

  return (
    <div className="flex h-screen bg-(--background) text-(--foreground) transition-colors duration-500 overflow-hidden">
      {/* 🧭 SIDEBAR (Theme-Aware) */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 88 : 260 }}
        className="bg-(--surface) border-r border-(--border) flex flex-col relative z-50 shadow-2xl transition-colors"
      >
        {/* COLLAPSE TOGGLE */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-10 w-6 h-6 bg-(--surface) border border-(--border) rounded-full flex items-center justify-center text-(--muted) hover:text-(--primary) shadow-md z-50 transition-all"
          style={{ transform: isSidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <ChevronLeft size={12} />
        </button>

        {/* LOGO AREA */}
        <div className={`p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4'}`}>
          <div className="w-11 h-11 bg-(--primary) rounded-2xl flex items-center justify-center text-(--primary-foreground) shadow-lg shadow-(--primary)/20 shrink-0">
            <Stethoscope size={24} />
          </div>
          {!isSidebarCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-2xl tracking-tighter text-(--foreground)"
            >
              Aura
            </motion.span>
          )}
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 py-8 space-y-10 overflow-y-auto no-scrollbar">
          <div className="space-y-2">
            {!isSidebarCollapsed && <p className="text-[10px] font-bold text-(--muted) uppercase tracking-widest px-3 mb-4 italic">Klinik Operasyonlar</p>}
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <NavItem key={item.href} item={item} collapsed={isSidebarCollapsed} active={pathname === item.href} />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {!isSidebarCollapsed && <p className="text-[10px] font-bold text-(--muted) uppercase tracking-widest px-3 mb-4 italic">Yönetim</p>}
            <div className="space-y-1">
              {configItems.map((item) => (
                <NavItem key={item.href} item={item} collapsed={isSidebarCollapsed} active={pathname === item.href} />
              ))}
            </div>
          </div>
        </nav>

        {/* USER & SIGN OUT */}
        <div className="p-4 mt-auto border-t border-(--border)">
          {!isSidebarCollapsed && (
            <div className="bg-(--primary)/5 rounded-2xl p-4 mb-4 border border-(--primary)/10">
              <div className="flex items-center gap-2 text-(--primary) mb-1">
                <Bot size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest">AI Core Active</span>
              </div>
              <p className="text-[9px] text-(--muted) font-bold uppercase tracking-tighter">Cerrahi Güvenlik Aktif</p>
            </div>
          )}
          
          <button className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-4'} px-4 py-3 w-full rounded-2xl text-(--muted) hover:bg-red-500/10 hover:text-red-500 transition-all font-bold text-sm`}>
            <LogOut size={20} />
            {!isSidebarCollapsed && <span>{t('signOut')}</span>}
          </button>
        </div>
      </motion.aside>

      {/* 🏗️ MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* 🔍 TOPBAR (Theme-Aware) */}
        <header className="h-20 bg-(--surface) border-b border-(--border) flex items-center justify-between px-8 shrink-0 transition-colors">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--muted) group-focus-within:text-(--primary) transition-colors" size={18} />
              <input 
                type="text" 
                placeholder={t('searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 bg-(--background) border border-transparent rounded-2xl text-sm focus:border-(--primary)/30 transition-all outline-none text-(--foreground)"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-(--background) text-(--muted) transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-(--surface)"></span>
            </button>
            <div className="h-8 w-px bg-(--border) mx-2"></div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-(--foreground) leading-none">Cerrah Oğuz</p>
                <p className="text-[10px] text-(--muted) mt-1 font-medium">Başhekim • Aura Core</p>
              </div>
              <div className="w-11 h-11 bg-(--primary) rounded-2xl flex items-center justify-center text-(--primary-foreground) font-bold shadow-lg shadow-(--primary)/20">
                O
              </div>
            </div>
          </div>
        </header>

        {/* 📄 DYNAMIC PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-(--background)">
          {children}
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ item, collapsed, active }: { item: any, collapsed: boolean, active: boolean }) => (
  <Link 
    href={item.href}
    className={`flex items-center ${collapsed ? 'justify-center' : 'gap-4'} px-4 py-3.5 rounded-2xl transition-all group relative ${
      active 
        ? 'bg-(--primary) text-(--primary-foreground) shadow-xl shadow-(--primary)/20' 
        : 'text-(--muted) hover:bg-(--surface-hover) hover:text-(--foreground)'
    }`}
  >
    <item.icon size={22} className="shrink-0" />
    {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
    {active && !collapsed && <div className="w-1.5 h-1.5 bg-(--primary-foreground) rounded-full ml-auto" />}
  </Link>
);
