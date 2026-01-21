/**
 * Represents an active EQ tab
 */
export interface EQTab {
    id: number;
    title: string;
    url?: string;
    favIconUrl?: string;
}

/**
 * Storage structure for active tabs
 */
export interface TabStorage {
    activeTabs: number[];
}
