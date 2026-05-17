import React from 'react';
import { Check, X, ShieldCheck, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Finding {
  toothId: number;
  type: string;
  confidence: number;
  findings: string;
}

export const DiagnosticValidation = ({ 
  findings, 
  onApprove, 
  onReject 
}: { 
  findings: Finding[], 
  onApprove: (toothId: number) => void, 
  onReject: (toothId: number) => void 
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <ShieldCheck className="text-(--color-brand-primary)" size={20} />
          Human-in-the-Loop Validation
        </h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">AI Findings pending clinical approval</p>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto p-4 space-y-3 no-scrollbar">
        <AnimatePresence>
          {findings.map((f) => (
            <motion.div 
              key={f.toothId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center font-bold">
                  {f.toothId}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{f.type}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-teal-50 dark:bg-teal-900/20 text-teal-600 rounded-md font-bold">
                      {(f.confidence * 100).toFixed(0)}% Conf.
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{f.findings}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onReject(f.toothId)}
                  className="p-2 bg-rose-50 dark:bg-rose-900/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
                <button 
                  onClick={() => onApprove(f.toothId)}
                  className="p-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                >
                  <Check size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
