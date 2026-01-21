import {StateCreator} from 'zustand';
import {Filter, createDefaultFilter, FILTER_COUNT} from '@/types/filter.types';

export interface FilterSlice {
    filters: {
        items: Filter[];
        updateFilter: (index: number, updates: Partial<Filter>) => void;
        resetFilter: (index: number) => void;
        resetAllFilters: () => void;
        setFilters: (filters: Filter[]) => void;
    };
}

/**
 * Create default filters array
 */
function createDefaultFilters(): Filter[] {
    return Array.from({length: FILTER_COUNT}, (_, i) => createDefaultFilter(i));
}

export const createFilterSlice: StateCreator<FilterSlice> = (set) => ({
    filters: {
        items: createDefaultFilters(),

        updateFilter: (index: number, updates: Partial<Filter>) => {
            set((state) => {
                const newFilters = [...state.filters.items];
                newFilters[index] = {...newFilters[index], ...updates};
                return {
                    filters: {
                        ...state.filters,
                        items: newFilters,
                    },
                };
            });
        },

        resetFilter: (index: number) => {
            set((state) => {
                const newFilters = [...state.filters.items];
                newFilters[index] = createDefaultFilter(index);
                return {
                    filters: {
                        ...state.filters,
                        items: newFilters,
                    },
                };
            });
        },

        resetAllFilters: () => {
            set((state) => ({
                filters: {
                    ...state.filters,
                    items: createDefaultFilters(),
                },
            }));
        },

        setFilters: (filters: Filter[]) => {
            set((state) => ({
                filters: {
                    ...state.filters,
                    items: filters,
                },
            }));
        },
    },
});
