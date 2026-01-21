import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    MAX_FREQUENCY,
    MIN_GAIN,
    MAX_GAIN,
} from './constants';

/**
 * 4th root transform for frequency
 * Creates perceptually uniform frequency distribution on the scale
 */
export function frequencyToX(freq: number, canvasWidth: number = CANVAS_WIDTH): number {
    return Math.pow(freq / MAX_FREQUENCY, 0.25) * canvasWidth;
}

/**
 * Inverse 4th root transform for frequency
 */
export function xToFrequency(x: number, canvasWidth: number = CANVAS_WIDTH): number {
    return Math.pow(x / canvasWidth, 4) * MAX_FREQUENCY;
}

/**
 * Convert gain (dB) to Y coordinate
 * Linear scale from MIN_GAIN to MAX_GAIN
 */
export function gainToY(db: number, canvasHeight: number = CANVAS_HEIGHT): number {
    const range = MAX_GAIN - MIN_GAIN;
    return canvasHeight * (1 - (db - MIN_GAIN) / range);
}

/**
 * Convert Y coordinate to gain (dB)
 * Linear scale from MIN_GAIN to MAX_GAIN
 */
export function yToGain(y: number, canvasHeight: number = CANVAS_HEIGHT): number {
    const range = MAX_GAIN - MIN_GAIN;
    return (1 - y / canvasHeight) * range + MIN_GAIN;
}

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Clamp frequency to valid range
 */
export function clampFrequency(freq: number): number {
    return clamp(freq, 5, 20000);
}

/**
 * Clamp gain (in dB) to valid range
 * Used for filter gain in EQ canvas
 */
export function clampGain(gain: number): number {
    return clamp(gain, MIN_GAIN, MAX_GAIN); // -30 to +30 dB
}

/**
 * Clamp Q to valid range
 */
export function clampQ(q: number): number {
    return clamp(q, 0.2, 11);
}
