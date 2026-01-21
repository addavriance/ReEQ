import {StateCreator} from 'zustand';
import {Preset} from '@/types/preset.types';

export interface PresetSlice {
    presets: {
        items: Record<string, Preset>;
        addPreset: (preset: Preset) => void;
        deletePreset: (name: string) => void;
        setPresets: (presets: Record<string, Preset>) => void;
        getPreset: (name: string) => Preset | undefined;
    };
}

export const createPresetSlice: StateCreator<PresetSlice> = (set, get) => ({
    presets: {
        items: {},

        addPreset: (preset: Preset) => {
            set((state) => ({
                presets: {
                    ...state.presets,
                    items: {
                        ...state.presets.items,
                        [preset.name]: preset,
                    },
                },
            }));
        },

        deletePreset: (name: string) => {
            set((state) => {
                const newPresets = {...state.presets.items};
                delete newPresets[name];
                return {
                    presets: {
                        ...state.presets,
                        items: newPresets,
                    },
                };
            });
        },

        setPresets: (presets: Record<string, Preset>) => {
            set((state) => ({
                presets: {
                    ...state.presets,
                    items: presets,
                },
            }));
        },

        getPreset: (name: string) => {
            return get().presets.items[name];
        },
    },
});
