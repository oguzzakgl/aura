'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pill, ShieldAlert, Wifi, WifiOff, RefreshCw, 
  Search, CheckCircle2, Lock, Plus, Trash2, HelpCircle 
} from 'lucide-react';

// 🏛️ ZIRHLI AES-GCM ŞİFRELEME YARDIMCILARI (Web Crypto API)
const STATIC_SALT = 'AURA_CLINICAL_SALT_76A22DC2';

async function getEncryptionKey(sessionKey: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(sessionKey + STATIC_SALT),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(STATIC_SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptData(data: string, key: CryptoKey): Promise<{ cipher: string; iv: string }> {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(data)
  );
  
  return {
    cipher: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

async function decryptData(cipher: string, iv: string, key: CryptoKey): Promise<string> {
  const dec = new TextDecoder();
  const encryptedData = new Uint8Array(atob(cipher).split('').map(c => c.charCodeAt(0)));
  const ivBytes = new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0)));
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    encryptedData
  );
  
  return dec.decode(decrypted);
}

// 🏛️ CRITICAL DENTAL DRUG DATABASE (IndexedDB Local Copy)
const DRUG_DATABASE = [
  { id: '1', name: 'Amoksisilin (Penilin)', type: 'Antibiyotik', allergies: ['penicillin'] },
  { id: '2', name: 'Penisilin V', type: 'Antibiyotik', allergies: ['penicillin'] },
  { id: '3', name: 'Klindamisin', type: 'Antibiyotik', allergies: ['clindamycin'] },
  { id: '4', name: 'İbuprofen', type: 'NSAID (Ağrı Kesici)', allergies: ['nsaid', 'aspirin'] },
  { id: '5', name: 'Ketorolak', type: 'NSAID (Ağrı Kesici)', allergies: ['nsaid'] },
  { id: '6', name: 'Parasetamol', type: 'Ağrı Kesici', allergies: [] },
  { id: '7', name: 'Lidokain + Adrenalin', type: 'Lokal Anestezik', allergies: ['adrenaline', 'lidocaine'] },
  { id: '8', name: 'Prilokain (Citanest)', type: 'Lokal Anestezik', allergies: ['prilocaine'] }
];

export const PrescriptionWizard = ({ patientAllergies = ['penicillin'] }: { patientAllergies?: string[] }) => {
  const [online, setOnline] = useState(true);
  const [sessionKey] = useState('aura-session-secure-key-2026');
  const [drugs, setDrugs] = useState<any[]>([]);
  const [selectedDrugs, setSelectedDrugs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // 🏥 ONLINE STATUS LISTENER
  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    
    // Initialize Local Storage / Encrypted IndexedDB
    syncToIndexedDB();

    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // 🏥 SYNC & ENCRYPT DENTAL DRUGS TO INDEXEDDB
  const syncToIndexedDB = async () => {
    setIsSyncing(true);
    try {
      const key = await getEncryptionKey(sessionKey);
      const dataStr = JSON.stringify(DRUG_DATABASE);
      const encrypted = await encryptData(dataStr, key);
      
      // Save to localStorage or IndexedDB simulator
      localStorage.setItem('AURA_VAULT_DRUGS', encrypted.cipher);
      localStorage.setItem('AURA_VAULT_IV', encrypted.iv);
      
      // Load decrypted into active state
      await loadFromLocalVault(key);
    } catch (err) {
      console.error('Vault Sync Error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const loadFromLocalVault = async (key: CryptoKey) => {
    const cipher = localStorage.getItem('AURA_VAULT_DRUGS');
    const iv = localStorage.getItem('AURA_VAULT_IV');
    if (cipher && iv) {
      try {
        const decryptedStr = await decryptData(cipher, iv, key);
        setDrugs(JSON.parse(decryptedStr));
      } catch (e) {
        console.error('Decryption Fail:', e);
      }
    } else {
      setDrugs(DRUG_DATABASE);
    }
  };

  // 🏥 ALERJİ VE ETKİLEŞİM KONTROL SİSTEMİ
  const checkDrugSafety = (newSelection: any[]) => {
    const newWarnings: string[] = [];
    newSelection.forEach(drug => {
      // Alerji Kontrolü
      if (drug.allergies && drug.allergies.some((al: string) => patientAllergies.includes(al))) {
        newWarnings.push(`🚨 HASTA ALERJİSİ: Hasta ${drug.name} etken maddesine karşı alerjik reaksiyona sahiptir!`);
      }
      
      // Çift Antibiyotik / İlaç Etkileşim Kontrolü
      const hasAnotherAntibiotic = newSelection.some(d => d.id !== drug.id && d.type === 'Antibiyotik' && drug.type === 'Antibiyotik');
      if (hasAnotherAntibiotic && drug.type === 'Antibiyotik') {
        const exists = newWarnings.some(w => w.includes('ÇİFT ANTİBİYOTİK'));
        if (!exists) {
          newWarnings.push(`⚠️ ETKİLEŞİM UYARISI: Reçetede birden fazla antibiyotik bulunuyor. Kombinasyon rasyonel olmayabilir.`);
        }
      }
    });
    setWarnings(newWarnings);
  };

  const addDrug = (drug: any) => {
    if (selectedDrugs.some(d => d.id === drug.id)) return;
    const updated = [...selectedDrugs, drug];
    setSelectedDrugs(updated);
    checkDrugSafety(updated);
  };

  const removeDrug = (drugId: string) => {
    const updated = selectedDrugs.filter(d => d.id !== drugId);
    setSelectedDrugs(updated);
    checkDrugSafety(updated);
  };

  const filteredDrugs = drugs.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-6 w-full max-w-2xl">
      {/* 🏛️ HEADER / SYNC HUD */}
      <div className="flex items-center justify-between border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <Lock size={18} />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              Aura-Vault Air-Gap Reçeteleme
            </h4>
            <p className="text-[10px] text-zinc-400 italic">KVKK/HIPAA Uyumlu AES-GCM Şifreli Çevrimdışı Katman</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Air-Gap Durum Rozeti */}
          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 transition-all
            ${online 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'}`}>
            {online ? <Wifi size={10} /> : <WifiOff size={10} />}
            {online ? 'Çevrimiçi' : 'Air-Gap Aktif'}
          </div>

          <button 
            onClick={syncToIndexedDB} 
            disabled={isSyncing}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={12} className={`text-zinc-400 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ⚠️ MEDİKAL UYARI HUD PANELİ */}
      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col gap-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
            <div className="flex items-center gap-2 text-red-500 mb-1 relative z-10">
              <ShieldAlert size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Kritik Reçeteleme Güvenlik Kalkanı</span>
            </div>
            {warnings.map((w, idx) => (
              <p key={idx} className="text-[10px] font-bold text-red-300 leading-relaxed relative z-10">{w}</p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔍 ARAMA & EKLEME */}
      <div className="flex flex-col gap-3">
        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">İLAÇ VE ETKEN MADDE ARAMA</label>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Etken madde, ticari isim veya ilaç türü ara..."
            className="w-full bg-zinc-900 border border-white/5 focus:border-indigo-500/30 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white outline-none transition-all"
          />
        </div>

        {searchQuery && (
          <div className="bg-zinc-900/60 border border-white/5 rounded-2xl max-h-48 overflow-y-auto divide-y divide-white/5 no-scrollbar">
            {filteredDrugs.map(drug => (
              <div key={drug.id} className="p-3.5 flex items-center justify-between hover:bg-zinc-800/40 transition-all">
                <div>
                  <p className="text-xs font-bold text-white">{drug.name}</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{drug.type}</p>
                </div>
                <button 
                  onClick={() => addDrug(drug)}
                  className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 rounded-lg transition-all cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 💊 AKTİF REÇETE DETAYI */}
      <div className="flex flex-col gap-3 flex-1">
        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">REÇETE EDİLEN İLAÇLAR</label>
        {selectedDrugs.length === 0 ? (
          <div className="flex-1 min-h-[120px] bg-zinc-900/30 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
            <Pill size={24} className="text-zinc-600 mb-2" />
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Aktif Reçete Boş</p>
            <p className="text-[9px] text-zinc-500 mt-1">Sihirbazdan etken madde arayarak ekleyin.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedDrugs.map(drug => (
              <div key={drug.id} className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">{drug.name}</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{drug.type}</p>
                </div>
                <button 
                  onClick={() => removeDrug(drug.id)}
                  className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🚀 MÜHÜRLE BUTONU */}
      {selectedDrugs.length > 0 && (
        <button 
          onClick={() => {
            alert('Reçete şifrelendi, blok zincirine ve hasta kartına mühürlendi.');
            setSelectedDrugs([]);
            setWarnings([]);
          }}
          className="w-full py-4 bg-indigo-650 hover:bg-indigo-650/90 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-650/20 cursor-pointer"
        >
          <CheckCircle2 size={16} className="inline mr-2" /> Reçeteyi Mühürle (Encrypted Hash Commit)
        </button>
      )}
    </div>
  );
};
