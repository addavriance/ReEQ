/**
 * Represents a saved EQ preset
 */
export interface Preset {
    name: string;
    frequencies: number[];  // Array of 11 frequencies
    gains: number[];        // Array of 11 gains
    qs: number[];          // Array of 11 Q values
}

/**
 * Storage structure for presets
 */
export interface PresetStorage {
    presets: Record<string, Preset>;
}

/**
 * Validates preset structure
 */
export function validatePreset(preset: Partial<Preset>): boolean {
    if (!preset.name || preset.name.trim() === '') return false;
    if (!preset.frequencies || preset.frequencies.length !== 11) return false;
    if (!preset.gains || preset.gains.length !== 11) return false;
    if (!preset.qs || preset.qs.length !== 11) return false;

    // Validate ranges
    for (let i = 0; i < 11; i++) {
        if (preset.frequencies[i] < 5 || preset.frequencies[i] > 20000) return false;
        if (preset.gains[i] < -30 || preset.gains[i] > 30) return false;
        if (preset.qs[i] < 0.2 || preset.qs[i] > 11) return false;
    }

    return true;
}

/**
 * Bass Boost preset (built-in)
 */
export const BASS_BOOST_PRESET: Preset = {
    name: 'Bass Boost',
    frequencies: [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000],
    gains: [12, 8, 4, 0, 0, 0, 0, 0, 0, 0, 0],
    qs: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
};
