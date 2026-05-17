import { useEffect, useState, useCallback } from 'react';

interface AuraEvent {
    type: string;
    session_id: string;
    data?: any;
    message?: string;
}

export const useAuraStream = (sessionId: string) => {
    const [status, setStatus] = useState<string>('idle');
    const [progress, setProgress] = useState<number>(0);
    const [latestResult, setLatestResult] = useState<any>(null);
    const [eventBuffer, setEventBuffer] = useState<AuraEvent[]>([]);

    const processEvent = useCallback((event: AuraEvent) => {
        console.log(`[Aura Sync] Step ${event.data?.step_index}: ${event.type}`);
        
        switch (event.type) {
            case 'PREPROCESSING':
                setStatus('Normalizing DICOM Volumetric Data...');
                setProgress(15);
                break;
            case 'AGENT_JURY':
                setStatus('Multi-Agent Consultation in Progress...');
                setProgress(30);
                break;
            case 'SURGICAL_ANALYSIS':
                setStatus('Running Biomechanics & ISQ Prediction...');
                setProgress(50);
                break;
            case 'DATA_FUSION':
                setStatus('Validating IOS/CBCT Registration...');
                setProgress(75);
                break;
            case 'FINAL_SEALING':
                setStatus('Sealing Evidence (SHA-256)...');
                setProgress(90);
                break;
            case 'COMPLETE':
                setStatus('Complete');
                setProgress(100);
                setLatestResult(event.data.result);
                break;
            case 'ERROR':
                setStatus('Critical Failure');
                break;
        }
    }, []);

    const connect = useCallback(() => {
        const ws = new WebSocket(`ws://localhost:8000/ws/diagnostics/${sessionId}`);

        ws.onmessage = (msg) => {
            const event: AuraEvent = JSON.parse(msg.data);
            processEvent(event);
        };

        ws.onopen = () => setStatus('connected');
        return () => ws.close();
    }, [sessionId, processEvent]);

    return { status, progress, latestResult, connect };
};
