'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import DiagnosticCanvas from '@/components/diagnostics/DiagnosticCanvas';
import { AuraConsole } from '@/components/diagnostics/AuraConsole';
import { useAuraStream } from '@/hooks/useAuraStream';
import { useAuraStore, DiagnosticStatus } from '@/lib/store/auraStore';
import { Play, RotateCcw } from 'lucide-react';
import { ISQGauge } from '@/components/diagnostics/ISQGauge';
import { ShieldCheck, Zap, Hash } from 'lucide-react';

export default function AuraWarRoom() {
    const sessionId = "AURA-SESSION-SINGULARITY";
    const { status: streamStatus, connect, progress, latestResult } = useAuraStream(sessionId);
    const { setStatus, addLog, setActivePulse, reset } = useAuraStore();

    // Sync Stream to Store
    useEffect(() => {
        if (streamStatus === 'connected') {
            setStatus(DiagnosticStatus.SCANNING);
            addLog("AURA NEURAL LINK: SINGULARITY ACTIVE", "LINK_SYNC_v5.5");
        } else if (streamStatus === 'Complete') {
            setStatus(DiagnosticStatus.COMPLETED);
            addLog("MASTER SEAL APPLIED TO BLOCKCHAIN", latestResult?.seal || "SEAL_v5.5");
        }
    }, [streamStatus, setStatus, addLog, latestResult]);

    const handleInitiate = () => {
        reset();
        addLog("IGNITING PARALLEL SURGICAL PIPELINE...", "SINGULARITY_START");
        connect();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)] gap-6 p-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-2xl backdrop-blur-md">
                <div className="flex flex-col">
                    <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                        Aura Singularity HUD <Zap size={16} className="text-emerald-400 fill-emerald-400" />
                    </h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Surgical Grade OS v5.5.0</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => { reset(); window.location.reload(); }}
                        className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button 
                        onClick={handleInitiate}
                        disabled={streamStatus === 'SCANNING'}
                        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <Play size={18} fill="currentColor" />
                        Ignite Singularity Scan
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex gap-6 min-h-0">
                {/* 3D Battlefield */}
                <div className="flex-[2_2_0%] bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden relative shadow-2xl">
                    <DiagnosticCanvas />
                    
                    {/* Floating HUD Results */}
                    {latestResult && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-8 right-8 w-64 flex flex-col gap-4 pointer-events-none"
                        >
                            <ISQGauge 
                                value={latestResult.stability.predicted_isq} 
                                classification={latestResult.stability.misch_classification} 
                            />
                            
                            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Fusion Precision</span>
                                    <span className="text-xs text-emerald-400 font-black">{latestResult.surgical_precision_mm}mm</span>
                                </div>
                                {latestResult.surgical_precision_mm < 0.2 && (
                                    <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                        <ShieldCheck size={14} /> Surgical Ready
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Progress Bar Overlay */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-2xl">
                        <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold mb-2">
                            <span>Diagnostic Engine</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-500" 
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Command Center Console */}
                <div className="flex-1 min-w-[350px]">
                    <AuraConsole />
                </div>
            </div>
        </div>
    );
}
