import {
    Filter,
    DEFAULT_FILTER_TYPES,
    DEFAULT_FILTER_FREQUENCIES,
    DEFAULT_FILTER_Q,
    FILTER_COUNT
} from '@/types/filter.types';

/**
 * Storage format for filters (legacy compatibility)
 */
interface StoredFilterData {
    f: number; // frequency
    g: number; // gain
    q: number; // q value
}

/**
 * Initialize filters in storage if they don't exist
 */
export async function initializeFilters(): Promise<void> {
    console.log('Initializing filters...');
    const data = await chrome.storage.local.get(null);
    console.log('Current storage data:', data);

    const updates: Record<string, any> = {};

    for (let i = 0; i < FILTER_COUNT; i++) {
        const key = `filter${i}`;
        if (!data[key]) {
            updates[key] = {
                f: DEFAULT_FILTER_FREQUENCIES[i],
                g: 0,
                q: DEFAULT_FILTER_Q,
            };
        }
    }

    if (!data.GAIN) {
        updates.GAIN = 1;
    }

    if (Object.keys(updates).length > 0) {
        console.log('Initializing missing filters:', updates);
        await chrome.storage.local.set(updates);
    }

    console.log('Filters initialized');
}

/**
 * Get a stored filter by index
 */
export async function getStoredFilter(index: number): Promise<StoredFilterData | null> {
    const result = await chrome.storage.local.get(`filter${index}`);
    const data = result[`filter${index}`];
    return data as StoredFilterData | null;
}

/**
 * Save a filter to storage
 */
export async function saveFilter(
    index: number,
    frequency: number,
    gain: number,
    q: number
): Promise<void> {
    // Clamp values to valid ranges
    // Filter gain is in dB
    const clampedFreq = Math.max(5, Math.min(20000, frequency));
    const clampedGain = Math.max(-30, Math.min(30, gain)); // -30 dB to +30 dB
    const clampedQ = Math.max(0.2, Math.min(11, q));

    await chrome.storage.local.set({
        [`filter${index}`]: {
            f: clampedFreq,
            g: clampedGain,
            q: clampedQ,
        },
    });
}

/**
 * Get all filters as Filter objects
 */
export async function getAllFilters(): Promise<Filter[]> {
    const filters: Filter[] = [];

    for (let i = 0; i < FILTER_COUNT; i++) {
        const stored = await getStoredFilter(i);
        if (stored) {
            filters.push({
                frequency: stored.f,
                gain: stored.g,
                q: stored.q,
                type: DEFAULT_FILTER_TYPES[i],
            });
        }
    }

    return filters;
}

/**
 * Get stored gain value
 */
export async function getStoredGain(): Promise<number> {
    const result = await chrome.storage.local.get('GAIN');
    return (result.GAIN as number) || 1;
}

/**
 * Save gain value (linear gain, not dB)
 * Valid range:
 * - MIN: 0.001 (= -30 dB)
 * - MAX: 1000 (= +30 dB)
 */
export async function saveGain(gain: number): Promise<void> {
    // Clamp linear gain to valid range (-30 dB to +30 dB)
    // -30 dB = 10^(-30/10) = 0.001
    // +30 dB = 10^(30/10) = 1000
    const clampedGain = Math.max(0.001, Math.min(1000, gain));
    await chrome.storage.local.set({GAIN: clampedGain});
}
