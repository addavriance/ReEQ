/**
 * Filter types for the EQ
 */
export type FilterType = 'lowshelf' | 'peaking' | 'highshelf';

/**
 * Represents a single audio filter
 */
export interface Filter {
    frequency: number; // 5-20000 Hz
    gain: number;      // -30 to +30 dB
    q: number;         // 0.2-11 (quality factor)
    type: FilterType;
}

/**
 * Default filter configuration based on index
 */
export const DEFAULT_FILTER_TYPES: FilterType[] = [
    'lowshelf',  // Filter 0
    'peaking',   // Filter 1
    'peaking',   // Filter 2
    'peaking',   // Filter 3
    'peaking',   // Filter 4
    'peaking',   // Filter 5
    'peaking',   // Filter 6
    'peaking',   // Filter 7
    'peaking',   // Filter 8
    'peaking',   // Filter 9
    'highshelf', // Filter 10
];

/**
 * Default filter frequencies based on index (in Hz)
 */
export const DEFAULT_FILTER_FREQUENCIES = [
    20,    // Filter 0 (lowshelf)
    40,    // Filter 1
    80,   // Filter 2
    160,   // Filter 3
    320,   // Filter 4
    640,  // Filter 5
    1280,  // Filter 6
    2580,  // Filter 7
    5120,  // Filter 8
    10240, // Filter 9
    20480, // Filter 10 (highshelf)
];

/**
 * Default gain for all filters (0 dB = no change)
 */
export const DEFAULT_FILTER_GAIN = 0;

/**
 * Default Q value for all filters
 */
export const DEFAULT_FILTER_Q = 1;

/**
 * Total number of filters
 */
export const FILTER_COUNT = 11;

/**
 * Creates a default filter configuration
 */
export function createDefaultFilter(index: number): Filter {
    return {
        frequency: DEFAULT_FILTER_FREQUENCIES[index] || 1000,
        gain: DEFAULT_FILTER_GAIN,
        q: DEFAULT_FILTER_Q,
        type: DEFAULT_FILTER_TYPES[index] || 'peaking',
    };
}

/**
 * Validates filter values
 */
export function validateFilter(filter: Partial<Filter>): boolean {
    if (filter.frequency !== undefined) {
        if (filter.frequency < 5 || filter.frequency > 20000) return false;
    }
    if (filter.gain !== undefined) {
        if (filter.gain < -30 || filter.gain > 30) return false;
    }
    if (filter.q !== undefined) {
        if (filter.q < 0.2 || filter.q > 11) return false;
    }
    return true;
}
