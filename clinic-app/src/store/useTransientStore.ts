import { create } from 'zustand';

interface TransientState {
  implantPosition: { x: number; y: number; z: number; angle: number };
  canvasPointer: { x: number; y: number };
  
  setImplantPosition: (pos: Partial<TransientState['implantPosition']>) => void;
  setCanvasPointer: (pos: { x: number; y: number }) => void;
}

/**
 * P2-1: OOM / UI Donma Koruması.
 * Yüksek frekanslı güncellemeler (mouse hareketleri, 3D koordinatlar) için
 * React re-render döngüsünü tetiklemeyen (sub/pub) bağımsız store.
 */
export const useTransientStore = create<TransientState>((set) => ({
  implantPosition: { x: 0, y: 0, z: 0, angle: 0 },
  canvasPointer: { x: 0, y: 0 },
  
  setImplantPosition: (pos) => set((state) => ({ 
      implantPosition: { ...state.implantPosition, ...pos } 
  })),
  setCanvasPointer: (pos) => set({ canvasPointer: pos }),
}));
