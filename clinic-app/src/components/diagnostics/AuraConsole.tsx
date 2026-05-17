'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceWatcher } from '@/lib/diagnostics/PerformanceWatcher';
import { ShieldAlert, Terminal, Activity, Lock, Battery, Zap } from 'lucide-react';
import { useAuraStore, DiagnosticStatus } from '@/lib/store/auraStore';

export const AuraConsole: React.FC = () => {
    const { status, auditLogs, setStatus, addLog } = useAuraStore();
    const { fps, isLowPerformance, batteryLevel } = usePerformanceWatcher();

    const handleKillSwitch = () => {
        setStatus(DiagnosticStatus.ABORTED);
        addLog("DOCTOR OVERRIDE - PROCESS ABORTED", "FATAL_HALT_77");
        console.warn("[Aura Console] EMERGENCY KILL SWITCH ACTIVATED.");
    };

    return (
        <div className="w-full h-full bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 font-mono overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${status === DiagnosticStatus.SCANNING ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                        <h3 className="text-slate-200 text-sm font-bold tracking-widest uppercase">Aura Command Center</h3>
                    </div>
                    <span className="text-[9px] text-slate-600 uppercase font-black">v6.1.0 TITANIUM_CORE_READY</span>
                </div>
                
                {/* Performance HUD */}
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <Zap size={10} className={fps > 30 ? 'text-emerald-500' : 'text-amber-500 animate-pulse'} />
                            <span className="text-[10px] text-slate-400 font-bold">{fps} FPS</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Battery size={10} className={batteryLevel > 0.2 ? 'text-slate-500' : 'text-red-500 animate-bounce'} />
                            <span className="text-[10px] text-slate-500">{Math.round(batteryLevel * 100)}%</span>
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded border text-[8px] font-black uppercase
                        ${isLowPerformance ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'}`}>
                        {isLowPerformance ? 'Low Power' : 'Titanium'}
                    </div>
                </div>
            </div>

            {/* Terminal Feed */}
            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {auditLogs.map((log) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 text-xs"
                        >
                            <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                            <span className="text-emerald-400 font-bold">»</span>
                            <span className="text-slate-300 flex-1">{log.message}</span>
                            <span className="text-[10px] text-slate-700 bg-slate-900/50 px-1 border border-slate-800 rounded">
                                {log.hash.substring(0, 8)}...
                            </span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="pt-4 border-t border-slate-800 flex gap-4">
                <button 
                    onClick={handleKillSwitch}
                    className="flex-1 bg-red-950/30 hover:bg-red-600/20 border border-red-900/50 text-red-500 py-3 rounded-xl flex items-center justify-center gap-2 transition-all group"
                >
                    <ShieldAlert size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider">Kill Switch</span>
                </button>
            </div>
        </div>
    );
};
