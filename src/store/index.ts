import {create} from 'zustand';
import {FilterSlice, createFilterSlice} from './slices/filterSlice';
import {GainSlice, createGainSlice} from './slices/gainSlice';
import {PresetSlice, createPresetSlice} from './slices/presetSlice';
import {TabSlice, createTabSlice} from './slices/tabSlice';
import {UISlice, createUISlice} from './slices/uiSlice';
import {chromeStorageMiddleware} from './middleware/chromeStorageSync';

/**
 * Combined store type
 */
export type EQStore = FilterSlice & GainSlice & PresetSlice & TabSlice & UISlice;

/**
 * Create the main EQ store with all slices and middleware
 */
export const useEQStore = create<EQStore>()(
    chromeStorageMiddleware(
        (...args) => ({
            ...createFilterSlice(...args),
            ...createGainSlice(...args),
            ...createPresetSlice(...args),
            ...createTabSlice(...args),
            ...createUISlice(...args),
        })
    )
);

/**
 * Selectors for convenient access to store slices
 */
export const selectFilters = (state: EQStore) => state.filters;
export const selectGain = (state: EQStore) => state.gain;
export const selectPresets = (state: EQStore) => state.presets;
export const selectTabs = (state: EQStore) => state.tabs;
export const selectUI = (state: EQStore) => state.ui;
