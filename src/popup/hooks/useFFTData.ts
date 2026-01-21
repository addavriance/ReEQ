import {useEffect, useState, useRef} from 'react';
import {FFT_UPDATE_RATE} from '@/popup/utils/constants';

/**
 * Hook for fetching FFT data from background/offscreen
 * Polls at FFT_UPDATE_RATE (30fps)
 */
export function useFFTData(enabled: boolean) {
    const [fftData, setFFTData] = useState<number[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!enabled) {
            setFFTData([]);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Fetch FFT data at regular intervals
        const fetchFFT = async () => {
            try {
                const response = await chrome.runtime.sendMessage({type: 'getFFT'});
                if (response && response.fft && Array.isArray(response.fft)) {
                    setFFTData(response.fft);
                }
            } catch (error) {
                // Ignore errors (e.g., when no audio is playing)
            }
        };

        // Initial fetch
        fetchFFT();

        // Setup interval
        intervalRef.current = setInterval(fetchFFT, 1000 / FFT_UPDATE_RATE);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled]);

    return fftData;
}
