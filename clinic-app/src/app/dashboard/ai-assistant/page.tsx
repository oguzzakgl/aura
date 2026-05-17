"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Sparkles, 
  UserCircle,
  Clock,
  Stethoscope,
  Microscope,
  FileText,
  Search,
  MessageSquare
} from 'lucide-react';

// --- MOCK DATABASE (Doktorun Verileri) ---
const CLINIC_DATA = {
  patients: [
    { name: "Oğuz", id: "P001", age: 28, lastVisit: "2024-04-12", note: "Root canal treatment ongoing. Sensitive to cold.", insurance: "Premium Health" },
    { name: "Ayşe Yılmaz", id: "P002", age: 34, lastVisit: "2024-05-01", note: "General checkup completed. No cavities found.", insurance: "Standard Care" },
    { name: "Mehmet Demir", id: "P003", age: 45, lastVisit: "2024-03-20", note: "Needs gum surgery consultation.", insurance: "None" },
  ],
  appointments: [
    { patient: "Oğuz", time: "14:30", service: "Root Canal", status: "Confirmed" },
    { patient: "Ayşe Yılmaz", time: "16:00", service: "Teeth Whitening", status: "Pending" },
  ],
  clinicInfo: {
    name: "Aura Dental Clinic",
    totalPatients: 1250,
    dailyRevenue: "$4,500"
  }
};

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Aura Local Brain active. I have access to your clinic data. You can ask me about patients (e.g., "Who is Oğuz?") or today\'s schedule.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  // --- LOCAL AI LOGIC (No API Key Required) ---
  const processLocalQuery = (query: string): string => {
    const q = query.toLowerCase();
    
    // 1. Hasta Sorgulama (Who is X?)
    const foundPatient = CLINIC_DATA.patients.find(p => q.includes(p.name.toLowerCase()));
    if (foundPatient) {
      return `Patient profile found: **${foundPatient.name}** (ID: ${foundPatient.id}). They are ${foundPatient.age} years old. Last visit was on ${foundPatient.lastVisit}. Clinical Note: "${foundPatient.note}". They are using ${foundPatient.insurance} insurance.`;
    }

    // 2. Randevu Sorgulama (Schedule / Appointments)
    if (q.includes('schedule') || q.includes('randevu') || q.includes('appointment') || q.includes('bugün')) {
      const list = CLINIC_DATA.appointments.map(a => `- ${a.time}: ${a.patient} (${a.service})`).join('\n');
      return `Today's schedule includes ${CLINIC_DATA.appointments.length} appointments:\n${list}\n\nWould you like me to prepare the tools for the next patient?`;
    }

    // 3. Genel Klinik Bilgisi
    if (q.includes('clinic') || q.includes('klinik') || q.includes('performans')) {
      return `Aura Clinic status: Total ${CLINIC_DATA.clinicInfo.totalPatients} registered patients. Today's estimated revenue is ${CLINIC_DATA.clinicInfo.dailyRevenue}. Everything is running smoothly.`;
    }

    // 4. Default
    return "I couldn't find a direct match in the records, but I am searching. Can you provide a patient name or ask about the schedule? (Try: 'Who is Oğuz?' or 'Show me today's schedule')";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Aura Local Logic Processing
    setTimeout(() => {
      const response = processLocalQuery(userMessage.content);
      const aiResponse: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: new Date() };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative">
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2">Aura Local Brain</h3>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Offline / Secure Mode
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-tight">Zero-Cost AI</div>
        </div>

        {/* CHAT */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white'}`}>
                    {msg.role === 'user' ? <UserCircle size={18} /> : <Bot size={18} />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'}`}>
                    {msg.content}
                    <p className={`text-[9px] mt-2 font-medium ${msg.role === 'user' ? 'text-white/40' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center"><Bot size={18} /></div>
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div className="p-6">
          <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-brand-primary/20 transition-all">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about Oğuz, Ayşe, or the schedule..."
              className="flex-1 bg-transparent border-none px-4 py-3 text-sm focus:ring-0 outline-none font-medium text-slate-700"
            />
            <button onClick={handleSend} className="bg-slate-900 text-white p-3 rounded-xl hover:bg-slate-800 transition-all active:scale-90 shadow-md">
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 text-center font-medium">Try: "Who is Oğuz?" or "Show me today's schedule"</p>
        </div>
      </div>

      {/* SIDEBAR */}
      <div className="w-80 space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <FileText size={16} className="text-brand-primary" /> Connected Data
          </h4>
          <div className="space-y-2">
            {[
              { label: 'Total Patients', value: '1,250' },
              { label: 'Active Treatments', value: '45' },
              { label: 'Pending Bookings', value: '12' },
            ].map((item, i) => (
              <div key={i} className="flex justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                <span className="text-xs font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-teal-50 p-6 rounded-3xl border border-teal-100">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-primary mb-4 shadow-sm">
            <Sparkles size={20} />
          </div>
          <h4 className="text-brand-primary font-bold text-sm mb-2">Zero-Cost AI</h4>
          <p className="text-teal-700/70 text-[10px] leading-relaxed font-medium">
            This chatbot works entirely on your local clinic data. No API keys, no monthly costs, and 100% data privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
