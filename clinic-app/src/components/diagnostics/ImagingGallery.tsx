'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Download, ShieldCheck, Layers, FileText, Calendar } from 'lucide-react';

interface ImagingRecord {
    id: string;
    type: 'CT' | 'MRI' | 'X-RAY';
    date: string;
    thumbnailUrl: string;
    isSealed: boolean;
    clinicalTags: string[];
}

export const ImagingGallery: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<ImagingRecord | null>(null);

    // Mock Data - In production, this comes from AuraVault/Backend
    const records: ImagingRecord[] = [
        { 
            id: 'IMG-001', type: 'CT', date: 'May 10, 2026', 
            thumbnailUrl: '/api/previews/ct-1.png', isSealed: true, 
            clinicalTags: ['Hounsfield-Ready', 'Bone-Threshold: 500'] 
        },
        { 
            id: 'IMG-002', type: 'X-RAY', date: 'April 05, 2025', 
            thumbnailUrl: '/api/previews/xray-1.png', isSealed: true, 
            clinicalTags: ['Anonymized', 'Manual-Review'] 
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {records.map((record) => (
                    <motion.div 
                        key={record.id}
                        whileHover={{ y: -5 }}
                        className="group bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all shadow-xl"
                    >
                        <div className="relative aspect-square bg-slate-950 flex items-center justify-center overflow-hidden">
                            {/* Placeholder for LOD Preview */}
                            <div className="absolute inset-0 bg-linear-to-t from-slate-950 to-transparent opacity-60 z-10" />
                            <div className="w-full h-full flex items-center justify-center text-slate-800">
                                <Layers size={64} className="group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            
                            {/* Actions Overlay */}
                            <div className="absolute inset-0 z-20 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 backdrop-blur-sm bg-slate-950/40 transition-all">
                                <button 
                                    onClick={() => setSelectedImage(record)}
                                    className="p-3 bg-white text-slate-950 rounded-2xl hover:scale-110 transition-transform shadow-2xl"
                                >
                                    <Eye size={20} />
                                </button>
                                <button className="p-3 bg-emerald-500 text-white rounded-2xl hover:scale-110 transition-transform shadow-2xl">
                                    <Download size={20} />
                                </button>
                            </div>

                            {record.isSealed && (
                                <div className="absolute top-4 left-4 z-30 flex items-center gap-2 px-3 py-1 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 rounded-full">
                                    <ShieldCheck size={12} className="text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Sealed</span>
                                </div>
                            )}
                        </div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="px-2 py-1 bg-slate-800 rounded text-[10px] font-bold text-slate-400">{record.type}</span>
                                <span className="flex items-center gap-1 text-[10px] text-slate-500"><Calendar size={10} /> {record.date}</span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-200 mb-2">Scan #{record.id}</h4>
                            <div className="flex flex-wrap gap-2">
                                {record.clinicalTags.map(tag => (
                                    <span key={tag} className="text-[9px] text-slate-600 font-mono">#{tag}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-2xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-5xl aspect-video bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl"
                        >
                            <button 
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-8 right-8 z-50 p-4 bg-slate-800/50 hover:bg-slate-800 text-white rounded-2xl transition-all"
                            >
                                ×
                            </button>
                            <div className="w-full h-full flex flex-col">
                                <div className="flex-1 flex items-center justify-center bg-black">
                                    <Layers size={128} className="text-slate-800 animate-pulse" />
                                    <p className="absolute text-slate-500 font-mono text-[10px] tracking-widest uppercase">
                                        LOD Preview Engine: Rendering {selectedImage.type}...
                                    </p>
                                </div>
                                <div className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase">{selectedImage.type} Analysis</h3>
                                        <p className="text-xs text-slate-500 mt-1">Integrity verified via SHA-256 • Metadata Stripped</p>
                                    </div>
                                    <button className="px-8 py-4 bg-(--color-brand-primary) text-white rounded-2xl font-bold flex items-center gap-3">
                                        <ShieldCheck size={20} /> Import to Aura Studio
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
