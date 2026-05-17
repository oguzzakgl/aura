"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'tr';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    dashboard: "Dashboard",
    calendar: "Calendar",
    appointments: "Appointments",
    patients: "Patients",
    services: "Services",
    aiSettings: "AI Settings",
    settings: "Settings",
    billing: "Billing",
    profile: "My Profile",
    signOut: "Sign Out",
    welcome: "Good morning, Dr. Demo",
    today: "Today",
    upcoming: "Upcoming",
    totalPatients: "Total Patients",
    cancellations: "Cancellations",
    completion: "Completion",
    noShows: "No-Shows",
    searchPlaceholder: "Search patients, appointments...",
    language: "Language",
    changeLanguage: "Change Application Language",
    saveChanges: "Save Changes",
  },
  tr: {
    dashboard: "Kontrol Paneli",
    calendar: "Takvim",
    appointments: "Randevular",
    patients: "Hastalar",
    services: "Hizmetler",
    aiSettings: "AI Ayarları",
    settings: "Ayarlar",
    billing: "Faturalandırma",
    profile: "Profilim",
    signOut: "Çıkış Yap",
    welcome: "Günaydın, Dr. Demo",
    today: "Bugün",
    upcoming: "Yaklaşan",
    totalPatients: "Toplam Hasta",
    cancellations: "İptaller",
    completion: "Tamamlanma",
    noShows: "Gelmeyenler",
    searchPlaceholder: "Hasta, randevu ara...",
    language: "Dil",
    changeLanguage: "Uygulama Dilini Değiştir",
    saveChanges: "Değişiklikleri Kaydet",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('app-language') as Language;
    if (savedLang) setLanguage(savedLang);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
