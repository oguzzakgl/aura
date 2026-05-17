import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Finding {
  tooth_id: number;
  pathology: string;
  severity?: string;
  confidence?: number;
}

interface DiagnosticState {
  isScanning: boolean;
  isReconstructing: boolean;
  dynamicModelUrl: string | null;
  findings: Finding[];
  teethStatus: Record<number, string>;
  
  setScanning: (status: boolean) => void;
  startScan: () => void;
  stopScan: () => void;
  
  setReconstructing: (status: boolean) => void;
  setIsReconstructing: (status: boolean) => void;
  
  setDynamicModelUrl: (url: string | null) => void;
  
  setFindings: (findings: any) => void;
  applyFindings: (findings: any) => void;
  
  resetDiagnostic: () => void;
  resetStore: () => void;
}

export const useDiagnosticStore = create<DiagnosticState>()(
  persist(
    (set) => ({
      isScanning: false,
      isReconstructing: false,
      dynamicModelUrl: null,
      findings: [],
      teethStatus: {},
      
      setScanning: (status) => set({ isScanning: status }),
      startScan: () => set({ isScanning: true }),
      stopScan: () => set({ isScanning: false }),
      
      setReconstructing: (status) => set({ isReconstructing: status }),
      setIsReconstructing: (status) => set({ isReconstructing: status }),
      
      setDynamicModelUrl: (url) => set({ dynamicModelUrl: url }),
      
      setFindings: (findings) => {
        if (Array.isArray(findings)) {
          set({ findings });
        } else {
          const mapped = Object.entries(findings).map(([id, path]) => ({
            tooth_id: parseInt(id),
            pathology: path as string
          }));
          set({ findings: mapped, teethStatus: findings });
        }
      },
      
      applyFindings: (findings) => {
        if (Array.isArray(findings)) {
          set({ findings });
        } else {
          const mapped = Object.entries(findings).map(([id, path]) => ({
            tooth_id: parseInt(id),
            pathology: path as string
          }));
          set({ findings: mapped, teethStatus: findings });
        }
      },
      
      resetDiagnostic: () => set({ 
        isScanning: false, 
        isReconstructing: false, 
        dynamicModelUrl: null,
        findings: [],
        teethStatus: {}
      }),
      
      resetStore: () => set({ 
        isScanning: false, 
        isReconstructing: false, 
        dynamicModelUrl: null,
        findings: [],
        teethStatus: {}
      }),
    }),
    {
      name: 'aura-diagnostic-storage', // 🛡️ ZIRH: LocalStorage anahtarı
      storage: createJSONStorage(() => localStorage),
    }
  )
);
