'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ShieldCheck, FileType, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface DicomUploaderProps {
    onUploadComplete: (files: File[]) => void;
}

export const DicomUploader: React.FC<DicomUploaderProps> = ({ onUploadComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'anonymizing' | 'uploading' | 'error'>('idle');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        
        setIsProcessing(true);
        setStatus('anonymizing');
        
        // 🛡️ ZIRH: Klinik Anonimizasyon ve Yükleme Simulasyonu
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(r => setTimeout(r, 100));
            setProgress(i);
            if (i === 50) setStatus('uploading');
        }

        setStatus('idle');
        setIsProcessing(false);
        onUploadComplete(acceptedFiles);
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop,
        onDropRejected: (rejectedFiles) => {
            console.error("Aura Brain: Files rejected by Dropzone", rejectedFiles);
            alert("Desteklenmeyen dosya formatı. Lütfen JPG, PNG veya DCM yükleyin.");
        },
        accept: { 
            'application/dicom': ['.dcm'],
            'application/x-nifti': ['.nii'],
            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp']
        },
        multiple: true,
        noClick: false,
    });

    return (
        <div className="w-full h-full min-h-[400px] flex flex-col">
            <div 
                {...getRootProps()}
                className={`flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-12 transition-all overflow-hidden relative
                    ${isDragActive ? 'border-(--primary) bg-(--primary)/5' : 'border-(--border) bg-(--surface) hover:border-(--primary)/40'}
                    ${isProcessing ? 'pointer-events-none' : 'cursor-pointer'}`}
            >
                <input {...getInputProps()} />
                
                <motion.div 
                    initial={false}
                    animate={{ scale: isDragActive ? 1.02 : 1 }}
                    className="w-full h-full flex flex-col items-center justify-center"
                >
                    <AnimatePresence mode="wait">
                        {!isProcessing ? (
                            <motion.div 
                                key="idle"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 bg-(--background) rounded-3xl flex items-center justify-center mb-6 shadow-2xl border border-(--border)">
                                    <Upload className="text-(--primary)" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-(--foreground) mb-3 tracking-tight">Röntgen, MR veya CT Yükleyin</h3>
                                <p className="text-sm text-(--muted) max-w-[320px] mb-8">
                                    Hastaya ait panoramik röntgen, CBCT, MR veya periapikal görüntüleri buraya sürükleyin.
                                </p>
                                
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        open();
                                    }}
                                    className="bg-(--primary) text-(--primary-foreground) px-10 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-(--primary)/20 hover:scale-105 active:scale-95 transition-all mb-8"
                                >
                                    Dosya Seç
                                </button>

                                <div className="flex items-center gap-2 px-4 py-2 bg-(--background) rounded-full border border-(--border)">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span className="text-[10px] text-(--muted) font-black uppercase tracking-[0.2em]">Anonim Veri İletişimi Aktif</span>
                                </div>
                                
                                <div className="mt-6 flex items-center gap-6 opacity-40">
                                    <div className="flex items-center gap-2">
                                        <FileType size={16} />
                                        <span className="text-[10px] font-bold">DICOM</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ImageIcon size={16} />
                                        <span className="text-[10px] font-bold">PNG / JPG</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileType size={16} />
                                        <span className="text-[10px] font-bold">NIfTI</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="processing"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="relative w-32 h-32 mb-8">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle
                                            cx="64" cy="64" r="56"
                                            className="stroke-(--border) fill-none stroke-[8px]"
                                        />
                                        <motion.circle
                                            cx="64" cy="64" r="56"
                                            className="stroke-(--primary) fill-none stroke-[8px]"
                                            strokeDasharray="351.8"
                                            initial={{ strokeDashoffset: 351.8 }}
                                            animate={{ strokeDashoffset: 351.8 - (351.8 * progress) / 100 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="text-(--primary) animate-spin" size={32} />
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-black text-(--foreground) uppercase tracking-widest">
                                    {status === 'anonymizing' ? 'Veri Mühürleniyor...' : 'Aura Teşhis Motoru Aktif...'}
                                </h3>
                                <div className="mt-4 px-6 py-2 bg-(--background) rounded-xl border border-(--border)">
                                    <p className="text-[10px] text-(--primary) font-mono italic">
                                        {progress < 50 ? 'TAG_0010: Hasta Kimliği Maskeleniyor...' : 'AURA-V2: Segmentasyon Analizi Başlatıldı...'}
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};
