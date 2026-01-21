import {StateCreator} from 'zustand';

export interface UISlice {
    ui: {
        isVisualizerEnabled: boolean;
        activeFilterIndex: number | null;
        isDragging: boolean;
        toggleVisualizer: () => void;
        setActiveFilterIndex: (index: number | null) => void;
        setIsDragging: (isDragging: boolean) => void;
    };
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
    ui: {
        isVisualizerEnabled: true,
        activeFilterIndex: null,
        isDragging: false,

        toggleVisualizer: () => {
            set((state) => ({
                ui: {
                    ...state.ui,
                    isVisualizerEnabled: !state.ui.isVisualizerEnabled,
                },
            }));
        },

        setActiveFilterIndex: (index: number | null) => {
            set((state) => ({
                ui: {
                    ...state.ui,
                    activeFilterIndex: index,
                },
            }));
        },

        setIsDragging: (isDragging: boolean) => {
            set((state) => ({
                ui: {
                    ...state.ui,
                    isDragging,
                },
            }));
        },
    },
});
