/**
 * FFT Analyzer for audio visualization
 * Provides frequency domain data for spectrum visualization
 */
export class FFTAnalyzer {
    private audioContext: AudioContext;
    private analyserNode: AnalyserNode;
    private fftData: Float32Array<ArrayBuffer>;

    constructor(audioContext: AudioContext, fftSize: number = 8192) {
        this.audioContext = audioContext;

        // Create analyzer node
        this.analyserNode = audioContext.createAnalyser();
        this.analyserNode.fftSize = fftSize;
        this.analyserNode.smoothingTimeConstant = 0.5;

        // Allocate buffer for FFT data
        this.fftData = new Float32Array(this.analyserNode.frequencyBinCount);
    }

    /**
     * Connect analyzer to an audio node
     */
    connect(source: AudioNode): void {
        source.connect(this.analyserNode);
    }

    /**
     * Disconnect analyzer
     */
    disconnect(): void {
        this.analyserNode.disconnect();
    }

    /**
     * Get current FFT data
     * Returns frequency domain data in dB
     */
    getFFTData(): Float32Array {
        this.analyserNode.getFloatFrequencyData(this.fftData);
        return Float32Array.from(this.fftData);
    }

    /**
     * Get FFT size
     */
    getFFTSize(): number {
        return this.analyserNode.fftSize;
    }

    /**
     * Get frequency bin count
     */
    getFrequencyBinCount(): number {
        return this.analyserNode.frequencyBinCount;
    }

    /**
     * Get frequency for a specific bin
     */
    getFrequencyForBin(bin: number): number {
        const nyquist = this.audioContext.sampleRate / 2;
        return (bin / this.analyserNode.frequencyBinCount) * nyquist;
    }

    /**
     * Update FFT size
     */
    setFFTSize(size: number): void {
        this.analyserNode.fftSize = size;
        this.fftData = new Float32Array(this.analyserNode.frequencyBinCount);
    }

    /**
     * Update smoothing time constant
     */
    setSmoothingTimeConstant(value: number): void {
        this.analyserNode.smoothingTimeConstant = Math.max(0, Math.min(1, value));
    }
}
