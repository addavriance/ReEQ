import {StateCreator} from 'zustand';

export interface GainSlice {
    gain: {
        value: number;
        updateGain: (value: number) => void;
        resetGain: () => void;
    };
}

const DEFAULT_GAIN = 1.0;

export const createGainSlice: StateCreator<GainSlice> = (set) => ({
    gain: {
        value: DEFAULT_GAIN,

        updateGain: (value: number) => {
            set((state) => ({
                gain: {
                    ...state.gain,
                    value: value,
                },
            }));
        },

        resetGain: () => {
            set((state) => ({
                gain: {
                    ...state.gain,
                    value: DEFAULT_GAIN,
                },
            }));
        },
    },
});
