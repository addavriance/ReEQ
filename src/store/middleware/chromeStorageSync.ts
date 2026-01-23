import {StateCreator} from 'zustand';
import type {EQStore} from '../index';

/**
 * Storage keys for chrome.storage.local
 */
const STORAGE_KEYS = {
    FILTERS: 'eq_filters',
    GAIN: 'eq_gain',
    PRESETS: 'eq_presets',
    ACTIVE_TABS: 'eq_active_tabs',
    VISUALIZER_ENABLED: 'eq_visualizer_enabled',
};

/**
 * Debounce timeout for storage writes
 */
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_DELAY = 300; // ms

/**
 * Middleware for syncing Zustand store with chrome.storage.local
 */
export const chromeStorageMiddleware = <T extends EQStore>(
    config: StateCreator<T>
): StateCreator<T> => {
    return (set, get, api) => {
        // Load initial state from chrome.storage
        loadFromStorage(set as any);

        // Create wrapped set function that saves to storage
        const wrappedSet: typeof set = (partial: any, replace?: any) => {
            set(partial, replace);

            // Debounce storage writes
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }

            debounceTimeout = setTimeout(() => {
                saveToStorage(get());
            }, DEBOUNCE_DELAY);
        };

        return config(wrappedSet, get, api);
    };
};

/**
 * Load state from chrome.storage.local
 */
async function loadFromStorage(set: (partial: Partial<EQStore> | ((state: EQStore) => Partial<EQStore>)) => void) {
    try {
        const result = await chrome.storage.local.get(Object.values(STORAGE_KEYS));

        // Use a callback to update state while preserving methods
        set((state: any) => {
            const updates: any = {};

            // Load filters
            if (result[STORAGE_KEYS.FILTERS]) {
                updates.filters = {
                    ...state.filters,
                    items: result[STORAGE_KEYS.FILTERS],
                };
            }

            // Load gain
            if (result[STORAGE_KEYS.GAIN] !== undefined) {
                updates.gain = {
                    ...state.gain,
                    value: result[STORAGE_KEYS.GAIN],
                };
            }

            // Load presets
            if (result[STORAGE_KEYS.PRESETS]) {
                updates.presets = {
                    ...state.presets,
                    items: result[STORAGE_KEYS.PRESETS],
                };
            }

            // Load active tabs
            if (result[STORAGE_KEYS.ACTIVE_TABS]) {
                updates.tabs = {
                    ...state.tabs,
                    activeTabs: result[STORAGE_KEYS.ACTIVE_TABS],
                };
            }

            // Load visualizer state
            if (result[STORAGE_KEYS.VISUALIZER_ENABLED] !== undefined) {
                updates.ui = {
                    ...state.ui,
                    isVisualizerEnabled: result[STORAGE_KEYS.VISUALIZER_ENABLED],
                };
            }

            return updates;
        });
    } catch (error) {
        console.error('Failed to load from chrome.storage:', error);
    }
}

/**
 * Save state to chrome.storage.local
 */
async function saveToStorage(state: EQStore) {
    try {
        await chrome.storage.local.set({
            [STORAGE_KEYS.FILTERS]: state.filters.items,
            [STORAGE_KEYS.GAIN]: state.gain.value,
            [STORAGE_KEYS.PRESETS]: state.presets.items,
            [STORAGE_KEYS.VISUALIZER_ENABLED]: state.ui.isVisualizerEnabled,
        });
    } catch (error) {
        console.error('Failed to save to chrome.storage:', error);
    }
}

/**
 * Clear all storage
 */
export async function clearStorage() {
    try {
        await chrome.storage.local.remove(Object.values(STORAGE_KEYS));
    } catch (error) {
        console.error('Failed to clear chrome.storage:', error);
    }
}
