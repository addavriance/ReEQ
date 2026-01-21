import {Filter} from '@/types/filter.types';
import {FilterChain} from './FilterChain';
import {FFTAnalyzer} from './FFTAnalyzer';

/**
 * Main audio engine for processing tab audio
 * Manages AudioContext, stream capture, and audio processing chain
 */
export class AudioEngine {
    private audioContext: AudioContext | null = null;
    private sourceNode: MediaStreamAudioSourceNode | null = null;
    private currentStream: MediaStream | null = null;
    private filterChain: FilterChain | null = null;
    private fftAnalyzer: FFTAnalyzer | null = null;

    /**
     * Setup audio processing for a captured stream
     */
    async setupAudio(stream: MediaStream, filters: Filter[], gain: number): Promise<void> {
        // Clean up existing stream
        this.stopCurrentStream();

        // Close existing audio context
        if (this.audioContext) {
            await this.audioContext.close();
        }

        // Create new audio context
        this.audioContext = new AudioContext({latencyHint: 'playback'});
        this.currentStream = stream;

        // Create nodes
        this.sourceNode = this.audioContext.createMediaStreamSource(stream);
        this.filterChain = new FilterChain(this.audioContext, filters, gain);
        this.fftAnalyzer = new FFTAnalyzer(this.audioContext);

        // Connect audio graph
        this.sourceNode.connect(this.filterChain.getInputNode());
        this.filterChain.getOutputNode().connect(this.audioContext.destination);
        this.fftAnalyzer.connect(this.filterChain.getOutputNode());

        console.log('Ears audio ready');
    }

    /**
     * Update a specific filter
     */
    updateFilter(index: number, filter: Partial<Filter>): void {
        if (!this.filterChain) return;
        this.filterChain.updateFilter(index, filter);
    }

    /**
     * Update overall gain
     */
    updateGain(gain: number): void {
        if (!this.filterChain) return;
        this.filterChain.updateGain(gain);
    }

    /**
     * Reset all filters to 0 gain
     */
    resetAllFilters(): void {
        if (!this.filterChain) return;
        this.filterChain.resetAllFilters();
    }

    /**
     * Reset a specific filter to 0 gain
     */
    resetFilter(index: number): void {
        if (!this.filterChain) return;
        this.filterChain.resetFilter(index);
    }

    /**
     * Apply multiple filter updates at once
     */
    applyAllFilters(filters: Filter[]): void {
        if (!this.filterChain) return;
        this.filterChain.applyAllFilters(filters);
    }

    /**
     * Get FFT data for visualization
     */
    getFFTData(): Float32Array {
        if (!this.fftAnalyzer || !this.audioContext) {
            return new Float32Array(0);
        }
        return this.fftAnalyzer.getFFTData();
    }

    /**
     * Stop audio processing and clean up resources
     */
    async stopAudio(): Promise<void> {
        this.stopCurrentStream();

        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }

        this.sourceNode = null;
        this.filterChain = null;
        this.fftAnalyzer = null;
    }

    /**
     * Stop the current media stream
     */
    private stopCurrentStream(): void {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach((track) => track.stop());
            this.currentStream = null;
        }
    }

    /**
     * Check if audio engine is active
     */
    isActive(): boolean {
        return this.audioContext !== null && this.audioContext.state === 'running';
    }

    /**
     * Get audio context state
     */
    getState(): AudioContextState | null {
        return this.audioContext?.state || null;
    }
}
