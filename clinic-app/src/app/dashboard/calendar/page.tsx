"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  Plus, MoreHorizontal, Clock, User, Phone, Mail, X, 
  ExternalLink, Activity, CheckCircle2, Search, Stethoscope,
  Loader2
} from 'lucide-react';

const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8am to 6pm

export default function CalendarPage() {
  const { t, language } = useLanguage();
  const [view, setView] = useState('week');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [riskDetails, setRiskDetails] = useState<string | null>(null);
  const [loadingRisk, setLoadingRisk] = useState(false);

  // 🏛️ LIVE EVENTS STATE
  const [events, setEvents] = useState([
    { 
      id: 1, patientId: '76A22DC2', day: 5, start: 14.5, end: 15.5, 
      title: 'Hacer Erkan', service: 'Kanal Tedavisi',
      phone: '+90 555 123 45 67', email: 'hacer@example.com',
      status: 'Onaylı', color: 'bg-blue-500',
      has_systemic_risk: true
    },
    { 
      id: 2, patientId: '98B33ED4', day: 5, start: 15.75, end: 16.5, 
      title: 'Sample User', service: 'Genel Muayene',
      phone: '+90 555 987 65 43', email: 'sample@example.com',
      status: 'Tamamlandı', color: 'bg-teal-500',
      has_systemic_risk: false
    },
  ]);

  const days = [
    { name: 'PAZ', date: '2026-04-26', display: '4/26', fullDate: '26 Nisan' },
    { name: 'PTT', date: '2026-04-27', display: '4/27', fullDate: '27 Nisan' },
    { name: 'SAL', date: '2026-04-28', display: '4/28', fullDate: '28 Nisan' },
    { name: 'ÇAR', date: '2026-04-29', display: '4/29', fullDate: '29 Nisan' },
    { name: 'PER', date: '2026-04-30', display: '4/30', fullDate: '30 Nisan' },
    { name: 'CUM', date: '2026-05-01', display: '5/1', isToday: true, fullDate: '1 Mayıs' },
    { name: 'CMT', date: '2026-05-02', display: '5/2', fullDate: '2 Mayıs' },
  ];

  // 🏥 LAZY LOADING MEDICAL RISK FOR TITANIUM HUD
  useEffect(() => {
    if (selectedEvent) {
      if (selectedEvent.has_systemic_risk) {
        setLoadingRisk(true);
        setRiskDetails(null);
        const timer = setTimeout(() => {
          setRiskDetails(
            "⚠️ KRİTİK MEDİKAL RİSK UYARISI: Hastanın penisilin grubuna karşı akut alerji geçmişi ve aktif 160/95 mmHg Hipertansiyon riski mevcuttur. Lokal anestezi uygulanırken adrenalin barındırmayan solüsyonlar tercih edilmelidir."
          );
          setLoadingRisk(false);
        }, 600);
        return () => clearTimeout(timer);
      } else {
        setRiskDetails(null);
        setLoadingRisk(false);
      }
    } else {
      setRiskDetails(null);
      setLoadingRisk(false);
    }
  }, [selectedEvent]);

  // Form State
  const [formData, setFormData] = useState({
    patient: '',
    service: 'Genel Muayene',
    date: '2026-05-01', 
    time: '09:00',
    duration: '30'
  });

  // 🏥 OPEN MODAL PRE-FILLED
  const openAddModal = (dateStr?: string, hour?: number) => {
    setFormData({
      ...formData,
      date: dateStr || '2026-05-01',
      time: hour ? `${hour.toString().padStart(2, '0')}:00` : '09:00'
    });
    setIsAddingAppointment(true);
  };

  // 🏥 LOCKING LOGIC (DYNAMIC)
  const handleLockAppointment = () => {
    if (!formData.patient) return;

    // Match Date to Day Index
    const dayIndex = days.findIndex(d => d.date === formData.date);
    if (dayIndex === -1) return; // Outside current view scope

    // Convert time to float
    const [h, m] = formData.time.split(':').map(Number);
    const start = h + (m / 60);
    const end = start + (Number(formData.duration) / 60);

    const newEvent = {
      id: Date.now(),
      day: dayIndex,
      start,
      end,
      title: formData.patient,
      service: formData.service,
      phone: '+90 (555) 000-00-00',
      email: 'aura.patient@aura.ai',
      status: 'Onaylı',
      color: formData.service === 'Kanal Tedavisi' ? 'bg-blue-600' : 'bg-teal-500'
    };

    setEvents([...events, newEvent]);
    setIsAddingAppointment(false);
    setFormData({ ...formData, patient: '' }); 
  };

  const renderHeader = () => {
    if (view === 'day') {
      const today = days.find(d => d.isToday) || days[0];
      return (
        <div className="grid grid-cols-[100px_1fr] border-b border-(--border) bg-(--background)/50">
          <div className="p-6 flex items-center justify-center border-r border-(--border)">
            <Clock size={20} className="text-(--muted) opacity-40" />
          </div>
          <div className="p-6 text-center bg-(--primary)/5">
            <p className="text-[10px] font-black text-(--muted) uppercase tracking-[0.2em]">{today.name}</p>
            <p className="text-sm font-bold mt-1 text-(--primary)">{today.fullDate}</p>
          </div>
        </div>
      );
    }
    
    if (view === 'month') {
      return (
        <div className="grid grid-cols-7 border-b border-(--border) bg-(--background)/50">
          {['PAZ', 'PTT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT'].map((d, i) => (
            <div key={i} className="p-4 text-center border-r last:border-r-0 border-(--border)">
              <p className="text-[10px] font-black text-(--muted) uppercase tracking-widest">{d}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-[100px_1fr] border-b border-(--border) bg-(--background)/50">
        <div className="p-6 flex items-center justify-center border-r border-(--border)">
          <Clock size={20} className="text-(--muted) opacity-40" />
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => (
            <div key={i} className={`p-6 text-center border-r last:border-r-0 border-(--border) ${day.isToday ? 'bg-(--primary)/5' : ''}`}>
              <p className="text-[10px] font-black text-(--muted) uppercase tracking-[0.2em]">{day.name}</p>
              <p className={`text-sm font-bold mt-1 ${day.isToday ? 'text-(--primary)' : 'text-(--foreground)'}`}>{day.display}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGrid = () => {
    if (view === 'month') {
      return (
        <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto no-scrollbar">
          {Array.from({ length: 35 }).map((_, i) => {
            const dayNum = i - 6; 
            const isToday = dayNum === 5;
            return (
              <div key={i} className={`min-h-[120px] border-r border-b border-(--border) p-4 relative group hover:bg-(--primary)/5 transition-all ${isToday ? 'bg-(--primary)/5' : ''}`}>
                <span className={`text-xs font-bold ${isToday ? 'text-(--primary)' : 'text-(--muted)'}`}>{dayNum > 0 ? dayNum : ''}</span>
                <button 
                  onClick={() => openAddModal()}
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 bg-(--primary) text-white rounded-lg scale-75 group-hover:scale-100 shadow-lg"
                >
                  <Plus size={10} />
                </button>
              </div>
            );
          })}
        </div>
      );
    }

    if (view === 'day') {
      const todayIdx = days.findIndex(d => d.isToday);
      return (
        <div className="flex-1 overflow-y-auto relative no-scrollbar bg-(--background)/10">
          <div className="grid grid-cols-[100px_1fr] min-h-full">
            <div className="border-r border-(--border) bg-(--background)/30">
              {hours.map((hour) => (
                <div key={hour} className="h-28 border-b border-(--border) flex items-start justify-center pt-4">
                  <span className="text-[10px] font-black text-(--muted) uppercase tracking-tighter">{hour}:00</span>
                </div>
              ))}
            </div>
            <div className="relative bg-(--primary)/5">
              {hours.map((hour) => (
                <div key={hour} className="h-28 border-b border-(--border) relative group transition-all hover:bg-(--primary)/10">
                  <button onClick={() => openAddModal(days[todayIdx].date, hour)} className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <Plus size={20} className="text-(--primary) opacity-40" />
                  </button>
                </div>
              ))}
              {events.filter(e => e.day === todayIdx).map((event) => (
                <CalendarEvent key={event.id} event={event} hourHeight={112} onClick={() => setSelectedEvent(event)} />
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-y-auto relative no-scrollbar bg-(--background)/10">
        <div className="grid grid-cols-[100px_1fr] min-h-full">
          <div className="border-r border-(--border) bg-(--background)/30">
            {hours.map((hour) => (
              <div key={hour} className="h-24 border-b border-(--border) flex items-start justify-center pt-4">
                <span className="text-[10px] font-black text-(--muted) uppercase tracking-tighter">{hour}:00</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 relative">
            {days.map((day, i) => (
              <div key={i} className={`border-r last:border-r-0 border-(--border) relative ${day.isToday ? 'bg-(--primary)/5' : ''}`}>
                {hours.map((hour) => (
                  <div key={hour} className="group h-24 border-b border-(--border) relative transition-all hover:bg-(--primary)/5">
                     <button onClick={() => openAddModal(day.date, hour)} className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <Plus size={16} className="text-(--primary) opacity-40" />
                     </button>
                  </div>
                ))}
                {events.filter(e => e.day === i).map((event) => (
                  <CalendarEvent key={event.id} event={event} hourHeight={96} onClick={() => setSelectedEvent(event)} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-10 p-4">
      {/* 🏛️ HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-(--primary)">
            <CalendarIcon size={28} />
            <h1 className="text-3xl font-semibold text-(--foreground) tracking-tight">{t('calendar')}</h1>
          </div>
          <div className="px-4 py-1.5 bg-(--surface) text-(--foreground) rounded-2xl text-[10px] font-black uppercase tracking-widest border border-(--border) shadow-sm">
             Mayıs 2026
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-(--surface) border border-(--border) rounded-2xl p-1.5 shadow-sm">
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${
                  view === v 
                    ? 'bg-(--primary) text-(--primary-foreground) shadow-lg' 
                    : 'text-(--muted) hover:text-(--foreground)'
                }`}
              >
                {language === 'tr' ? (v === 'month' ? 'AY' : v === 'week' ? 'HAFTA' : 'GÜN') : v}
              </button>
            ))}
          </div>
          <button 
            onClick={() => openAddModal()}
            className="bg-(--primary) text-(--primary-foreground) px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-3 shadow-xl shadow-(--primary)/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={20} /> {language === 'tr' ? 'Randevu Mühürle' : 'Lock Session'}
          </button>
        </div>
      </div>

      {/* 🗓️ DYNAMIC CALENDAR GRID */}
      <div className="flex-1 aura-card bg-(--surface) border border-(--border) overflow-hidden flex flex-col transition-all shadow-2xl">
        {renderHeader()}
        {renderGrid()}
      </div>

      {/* 🧬 EVENT MODAL & LOCK MODAL */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedEvent(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-(--surface) rounded-[3rem] border border-(--border) shadow-2xl overflow-hidden">
               {/* Content already implemented in previous turn */}
               <div className="h-32 bg-(--primary) relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white,transparent)]" />
                <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="px-10 pb-10 -mt-12 relative">
                <div className="w-24 h-24 rounded-4xl bg-(--surface) p-2 shadow-2xl mb-6">
                  <div className={`w-full h-full rounded-3xl ${selectedEvent.color} flex items-center justify-center text-white text-4xl font-bold`}>
                    {selectedEvent.title[0]}
                  </div>
                </div>

                {/* 🏥 TITANIUM HUD: LAZY LOADED MEDİKAL RİSK UYARISI */}
                {selectedEvent.has_systemic_risk && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                    <div className="relative z-10 flex items-start gap-3 text-red-400">
                      <Activity size={18} className="shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-red-500">TITANIUM HUD: SİSTEMİK RİSK KARTELASI</p>
                        {loadingRisk ? (
                          <div className="flex items-center gap-2 py-1">
                            <Loader2 size={12} className="animate-spin text-red-500" />
                            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Tıbbi Anamnez Sorgulanıyor...</span>
                          </div>
                        ) : (
                          <p className="text-[10px] leading-relaxed font-bold text-red-300">{riskDetails}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mb-10">
                  <h3 className="text-3xl font-bold text-(--foreground) tracking-tight mb-2">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-(--primary)/10 text-(--primary) rounded-full text-[10px] font-black uppercase tracking-widest border border-(--primary)/20">
                      {selectedEvent.service}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <QuickContact icon={<Phone size={20} />} label="TELEFON" value={selectedEvent.phone} color="text-blue-500" />
                  <QuickContact icon={<Mail size={20} />} label="E-POSTA" value={selectedEvent.email} color="text-purple-500" />
                </div>

                <Link href={`/dashboard/patients/${selectedEvent.id}`} className="block">
                  <button className="w-full py-5 bg-(--primary) text-(--primary-foreground) font-bold rounded-2xl shadow-xl shadow-(--primary)/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                    <Activity size={20} /> VAKAYI İNCELE
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddingAppointment && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddingAppointment(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }} className="relative w-full max-w-xl bg-(--surface) rounded-[3rem] border border-(--border) shadow-2xl overflow-hidden">
               <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-(--primary)/10 text-(--primary) rounded-2xl flex items-center justify-center border border-(--primary)/20">
                       <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-(--foreground) tracking-tight">Randevu Mühürle</h2>
                      <p className="text-xs text-(--muted) italic font-medium">Klinik vaka koordinatlarını mühürleyin</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddingAppointment(false)} className="p-3 bg-(--background) text-(--muted) hover:text-red-500 rounded-2xl transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest ml-1">HASTA SEÇİMİ</label>
                    <div className="relative group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-(--muted) group-focus-within:text-(--primary) transition-colors" size={20} />
                      <input type="text" value={formData.patient} onChange={(e) => setFormData({...formData, patient: e.target.value})} placeholder="Hasta ismi veya protokol no..." className="w-full pl-14 pr-6 py-4 bg-(--background) border border-(--border) rounded-2xl text-sm focus:border-(--primary)/50 outline-none transition-all text-(--foreground)" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest ml-1">KLİNİK HİZMET</label>
                    <select value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} className="w-full px-6 py-4 bg-(--background) border border-(--border) rounded-2xl text-sm focus:border-(--primary)/50 outline-none transition-all text-(--foreground) appearance-none">
                        <option>Genel Muayene</option>
                        <option>Kanal Tedavisi</option>
                        <option>İmplant Operasyonu</option>
                        <option>Diş Beyazlatma</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest ml-1">SÜRE (DK)</label>
                    <select value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} className="w-full px-6 py-4 bg-(--background) border border-(--border) rounded-2xl text-sm focus:border-(--primary)/50 outline-none transition-all text-(--foreground) appearance-none">
                        <option value="15">15 dk</option>
                        <option value="30">30 dk</option>
                        <option value="45">45 dk</option>
                        <option value="60">60 dk</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest ml-1">TARİH</label>
                    <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full px-6 py-4 bg-(--background) border border-(--border) rounded-2xl text-sm focus:border-(--primary)/50 outline-none transition-all text-(--foreground)" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-(--muted) uppercase tracking-widest ml-1">SAAT</label>
                    <input type="time" value={formData.time} onChange={(e) => setFormData({...formData, time: e.target.value})} className="w-full px-6 py-4 bg-(--background) border border-(--border) rounded-2xl text-sm focus:border-(--primary)/50 outline-none transition-all text-(--foreground)" />
                  </div>
                </div>

                <button onClick={handleLockAppointment} disabled={!formData.patient} className="w-full py-5 bg-(--primary) text-(--primary-foreground) font-bold rounded-2xl shadow-2xl shadow-(--primary)/30 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all uppercase tracking-widest">
                  <CheckCircle2 size={22} className="inline mr-2" /> MÜHÜRLE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CalendarEvent = ({ event, hourHeight, onClick }: { event: any, hourHeight: number, onClick: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ scale: 1.02 }}
    onClick={onClick}
    className={`absolute left-2 right-2 p-3 rounded-2xl ${event.color} text-white shadow-xl shadow-black/20 z-10 cursor-pointer border border-white/20 flex flex-col justify-between overflow-hidden`}
    style={{ 
      top: `${(event.start - 8) * hourHeight}px`, 
      height: `${(event.end - event.start) * hourHeight}px` 
    }}
  >
    {/* 🏥 TITANIUM HUD: Kırmızı Medikal Risk Rozeti */}
    {event.has_systemic_risk && (
      <div className="absolute top-2.5 right-2.5 flex items-center justify-center bg-red-600/90 border border-white/30 w-5 h-5 rounded-full shadow-lg animate-pulse" title="KRİTİK MEDİKAL RİSK UYARISI">
        <Activity size={10} className="text-white" />
      </div>
    )}
    <div>
      <p className="text-xs font-bold leading-tight truncate pr-6">{event.title}</p>
      <p className="text-[9px] opacity-80 font-bold mt-1 uppercase tracking-tighter truncate">{event.service}</p>
    </div>
  </motion.div>
);

const QuickContact = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="flex items-center gap-5 p-5 bg-(--background)/50 rounded-3xl border border-(--border) group hover:border-(--primary)/30 transition-all">
    <div className={`w-12 h-12 bg-(--surface) ${color} rounded-2xl flex items-center justify-center shadow-sm border border-(--border)`}>
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-(--muted) uppercase tracking-[0.2em] mb-0.5">{label}</p>
      <p className="text-sm font-bold text-(--foreground) tracking-tight">{value}</p>
    </div>
  </div>
);
