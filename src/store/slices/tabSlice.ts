import {StateCreator} from 'zustand';

export interface TabSlice {
    tabs: {
        activeTabs: number[];
        currentTabId: number | null;
        addTab: (tabId: number) => void;
        removeTab: (tabId: number) => void;
        setActiveTabs: (tabIds: number[]) => void;
        setCurrentTabId: (tabId: number | null) => void;
        isTabActive: (tabId: number) => boolean;
    };
}

export const createTabSlice: StateCreator<TabSlice> = (set, get) => ({
    tabs: {
        activeTabs: [],
        currentTabId: null,

        addTab: (tabId: number) => {
            set((state) => ({
                tabs: {
                    ...state.tabs,
                    activeTabs: state.tabs.activeTabs.includes(tabId)
                        ? state.tabs.activeTabs
                        : [...state.tabs.activeTabs, tabId],
                },
            }));
        },

        removeTab: (tabId: number) => {
            set((state) => ({
                tabs: {
                    ...state.tabs,
                    activeTabs: state.tabs.activeTabs.filter((id) => id !== tabId),
                },
            }));
        },

        setActiveTabs: (tabIds: number[]) => {
            set((state) => ({
                tabs: {
                    ...state.tabs,
                    activeTabs: tabIds,
                },
            }));
        },

        setCurrentTabId: (tabId: number | null) => {
            set((state) => ({
                tabs: {
                    ...state.tabs,
                    currentTabId: tabId,
                },
            }));
        },

        isTabActive: (tabId: number) => {
            return get().tabs.activeTabs.includes(tabId);
        },
    },
});
