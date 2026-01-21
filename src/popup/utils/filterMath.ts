import {Filter} from '@/types/filter.types';
import {SAMPLE_RATE} from "@/popup/utils/constants.ts";

/**
 * Biquad filter coefficients
 */
export interface BiquadCoefficients {
    b0: number;
    b1: number;
    b2: number;
    a0: number;
    a1: number;
    a2: number;
}

/**
 * Calculate biquad filter coefficients for a given filter
 * CRITICAL: This math must not be changed - it directly affects audio quality
 * Ported from popup.js:328-389
 */
export function calculateFilterCoefficients(filter: Filter): BiquadCoefficients {
    const {frequency, gain, q, type} = filter;

    // Calculate intermediate values
    const w0 = 2 * Math.PI * frequency / SAMPLE_RATE;
    const alpha = Math.sin(w0) / (2 * q);
    const A = Math.pow(10, Math.abs(gain) / 40);

    let b0: number, b1: number, b2: number, a0: number, a1: number, a2: number;

    // Calculate coefficients based on filter type
    if (type === 'peaking') {
        if (gain >= 0) {
            b0 = 1 + alpha * A;
            b1 = -2 * Math.cos(w0);
            b2 = 1 - alpha * A;
            a0 = 1 + alpha / A;
            a1 = -2 * Math.cos(w0);
            a2 = 1 - alpha / A;
        } else {
            b0 = 1 + alpha / A;
            b1 = -2 * Math.cos(w0);
            b2 = 1 - alpha / A;
            a0 = 1 + alpha * A;
            a1 = -2 * Math.cos(w0);
            a2 = 1 - alpha * A;
        }
    } else if (type === 'highshelf') {
        const sqrtA = Math.sqrt(A);
        if (gain >= 0) {
            b0 = A * ((A + 1) + (A - 1) * Math.cos(w0) + 2 * sqrtA * alpha);
            b1 = -2 * A * ((A - 1) + (A + 1) * Math.cos(w0));
            b2 = A * ((A + 1) + (A - 1) * Math.cos(w0) - 2 * sqrtA * alpha);
            a0 = (A + 1) - (A - 1) * Math.cos(w0) + 2 * sqrtA * alpha;
            a1 = 2 * ((A - 1) - (A + 1) * Math.cos(w0));
            a2 = (A + 1) - (A - 1) * Math.cos(w0) - 2 * sqrtA * alpha;
        } else {
            b0 = (A + 1) - (A - 1) * Math.cos(w0) + 2 * sqrtA * alpha;
            b1 = 2 * ((A - 1) - (A + 1) * Math.cos(w0));
            b2 = (A + 1) - (A - 1) * Math.cos(w0) - 2 * sqrtA * alpha;
            a0 = A * ((A + 1) + (A - 1) * Math.cos(w0) + 2 * sqrtA * alpha);
            a1 = -2 * A * ((A - 1) + (A + 1) * Math.cos(w0));
            a2 = A * ((A + 1) + (A - 1) * Math.cos(w0) - 2 * sqrtA * alpha);
        }
    } else if (type === 'lowshelf') {
        const sqrtA = Math.sqrt(A);
        if (gain >= 0) {
            b0 = A * ((A + 1) - (A - 1) * Math.cos(w0) + 2 * sqrtA * alpha);
            b1 = 2 * A * ((A - 1) - (A + 1) * Math.cos(w0));
            b2 = A * ((A + 1) - (A - 1) * Math.cos(w0) - 2 * sqrtA * alpha);
            a0 = (A + 1) + (A - 1) * Math.cos(w0) + 2 * sqrtA * alpha;
            a1 = -2 * ((A - 1) + (A + 1) * Math.cos(w0));
            a2 = (A + 1) + (A - 1) * Math.cos(w0) - 2 * sqrtA * alpha;
        } else {
            b0 = (A + 1) + (A - 1) * Math.cos(w0) + 2 * sqrtA * alpha;
            b1 = -2 * ((A - 1) + (A + 1) * Math.cos(w0));
            b2 = (A + 1) + (A - 1) * Math.cos(w0) - 2 * sqrtA * alpha;
            a0 = A * ((A + 1) - (A - 1) * Math.cos(w0) + 2 * sqrtA * alpha);
            a1 = 2 * A * ((A - 1) - (A + 1) * Math.cos(w0));
            a2 = A * ((A + 1) - (A - 1) * Math.cos(w0) - 2 * sqrtA * alpha);
        }
    } else {
        // Should never reach here, but provide safe defaults
        b0 = 1;
        b1 = 0;
        b2 = 0;
        a0 = 1;
        a1 = 0;
        a2 = 0;
    }

    return {b0, b1, b2, a0, a1, a2};
}

/**
 * Calculate frequency response magnitude at a specific frequency
 * CRITICAL: This math must not be changed - it's used to draw filter curves
 * Ported from popup.js:392-407
 */
export function calculateFrequencyResponse(
    coefficients: BiquadCoefficients,
    frequency: number
): number {
    const {b0, b1, b2, a0, a1, a2} = coefficients;

    const w = 2 * Math.PI * frequency / SAMPLE_RATE;
    const phi = Math.pow(Math.sin(w / 2), 2);

    const numerator =
        Math.pow(b0 + b1 + b2, 2) -
        4 * (b0 * b1 + 4 * b0 * b2 + b1 * b2) * phi +
        16 * b0 * b2 * phi * phi;

    const denominator =
        Math.pow(a0 + a1 + a2, 2) -
        4 * (a0 * a1 + 4 * a0 * a2 + a1 * a2) * phi +
        16 * a0 * a2 * phi * phi;

    const magnitude = 10 * Math.log10(numerator / denominator);

    return magnitude;
}

/**
 * Calculate filter curve points for drawing
 * Returns an array of [x, y] coordinates
 */
export function calculateFilterCurve(
    filter: Filter,
    canvasWidth: number,
    xToFrequency: (x: number) => number,
    gainToY: (gain: number) => number,
    canvasHeight: number,
    step: number = 2
): number[] {
    const coefficients = calculateFilterCoefficients(filter);
    const points: number[] = [];

    for (let x = 0; x < canvasWidth; x += step) {
        const freq = xToFrequency(x);
        const magnitude = calculateFrequencyResponse(coefficients, freq);
        const y = gainToY(magnitude);

        // Only add points that are finite and have noticeable magnitude
        if (isFinite(y) && Math.abs(y - canvasHeight / 2) > 1) {
            points.push(x, y);
        }
    }

    return points;
}

/**
 * Convert linear gain to dB
 */
export function linearGainToDB(linear: number): number {
    return 10 * Math.log10(linear);
}

/**
 * Convert dB to linear gain
 */
export function dbToLinearGain(db: number): number {
    return Math.pow(10, db / 10);
}
