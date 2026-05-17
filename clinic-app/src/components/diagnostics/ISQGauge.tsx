'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ISQGaugeProps {
    value: number; // 0-100
    classification: string; // D1, D2, D3, D4
}

export const ISQGauge: React.FC<ISQGaugeProps> = ({ value, classification }) => {
    const isCritical = classification === 'D4';
    
    return (
        <div className="flex flex-col items-center gap-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
            <div className="relative w-32 h-16 overflow-hidden">
                {/* Semi-circle Gauge */}
                <div className="absolute top-0 left-0 w-32 h-32 border-12 border-slate-800 rounded-full" />
                <motion.div 
                    initial={{ rotate: -90 }}
                    animate={{ rotate: -90 + (value * 1.8) }}
                    transition={{ type: 'spring', damping: 20 }}
                    className={`absolute top-0 left-0 w-32 h-32 border-12 rounded-full border-t-transparent border-l-transparent ${isCritical ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-emerald-500'}`}
                    style={{ transformOrigin: 'center' }}
                />
            </div>
            
            <div className="flex flex-col items-center">
                <span className={`text-2xl font-black ${isCritical ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                    {value} ISQ
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Bone Density: {classification}
                </span>
            </div>

            {isCritical && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-[8px] text-red-500 font-black uppercase mt-1"
                >
                    CRITICAL RESORPTION RISK
                </motion.div>
            )}
        </div>
    );
};
