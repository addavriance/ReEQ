import {Filter} from './filter.types';
import {Preset} from './preset.types';

/**
 * Message types for chrome.runtime messaging
 */
export enum MessageType {
    // Filter messages
    UPDATE_FILTER = 'UPDATE_FILTER',
    RESET_FILTER = 'RESET_FILTER',
    RESET_ALL_FILTERS = 'RESET_ALL_FILTERS',
    GET_FILTERS = 'GET_FILTERS',

    // Gain messages
    UPDATE_GAIN = 'UPDATE_GAIN',
    GET_GAIN = 'GET_GAIN',

    // Preset messages
    SAVE_PRESET = 'SAVE_PRESET',
    LOAD_PRESET = 'LOAD_PRESET',
    DELETE_PRESET = 'DELETE_PRESET',
    GET_PRESETS = 'GET_PRESETS',
    IMPORT_PRESETS = 'IMPORT_PRESETS',
    EXPORT_PRESETS = 'EXPORT_PRESETS',

    // Tab messages
    EQ_TAB = 'EQ_TAB',
    STOP_EQ_TAB = 'STOP_EQ_TAB',
    GET_ACTIVE_TABS = 'GET_ACTIVE_TABS',
    IS_TAB_ACTIVE = 'IS_TAB_ACTIVE',

    // FFT messages
    GET_FFT_DATA = 'GET_FFT_DATA',
    TOGGLE_VISUALIZER = 'TOGGLE_VISUALIZER',

    // Offscreen messages
    CREATE_OFFSCREEN = 'CREATE_OFFSCREEN',
    CLOSE_OFFSCREEN = 'CLOSE_OFFSCREEN',
}

/**
 * Base message structure
 */
export interface BaseMessage {
    type: MessageType;
}

/**
 * Filter update message
 */
export interface UpdateFilterMessage extends BaseMessage {
    type: MessageType.UPDATE_FILTER;
    tabId: number;
    filterIndex: number;
    updates: Partial<Filter>;
}

/**
 * Reset filter message
 */
export interface ResetFilterMessage extends BaseMessage {
    type: MessageType.RESET_FILTER;
    tabId: number;
    filterIndex: number;
}

/**
 * Reset all filters message
 */
export interface ResetAllFiltersMessage extends BaseMessage {
    type: MessageType.RESET_ALL_FILTERS;
    tabId: number;
}

/**
 * Get filters message
 */
export interface GetFiltersMessage extends BaseMessage {
    type: MessageType.GET_FILTERS;
    tabId: number;
}

/**
 * Update gain message
 */
export interface UpdateGainMessage extends BaseMessage {
    type: MessageType.UPDATE_GAIN;
    tabId: number;
    gain: number;
}

/**
 * Get gain message
 */
export interface GetGainMessage extends BaseMessage {
    type: MessageType.GET_GAIN;
    tabId: number;
}

/**
 * Save preset message
 */
export interface SavePresetMessage extends BaseMessage {
    type: MessageType.SAVE_PRESET;
    preset: Preset;
}

/**
 * Load preset message
 */
export interface LoadPresetMessage extends BaseMessage {
    type: MessageType.LOAD_PRESET;
    tabId: number;
    presetName: string;
}

/**
 * Delete preset message
 */
export interface DeletePresetMessage extends BaseMessage {
    type: MessageType.DELETE_PRESET;
    presetName: string;
}

/**
 * Get presets message
 */
export interface GetPresetsMessage extends BaseMessage {
    type: MessageType.GET_PRESETS;
}

/**
 * Import presets message
 */
export interface ImportPresetsMessage extends BaseMessage {
    type: MessageType.IMPORT_PRESETS;
    presets: Record<string, Preset>;
}

/**
 * Export presets message
 */
export interface ExportPresetsMessage extends BaseMessage {
    type: MessageType.EXPORT_PRESETS;
}

/**
 * EQ tab message
 */
export interface EQTabMessage extends BaseMessage {
    type: MessageType.EQ_TAB;
    tabId: number;
}

/**
 * Stop EQ tab message
 */
export interface StopEQTabMessage extends BaseMessage {
    type: MessageType.STOP_EQ_TAB;
    tabId: number;
}

/**
 * Get active tabs message
 */
export interface GetActiveTabsMessage extends BaseMessage {
    type: MessageType.GET_ACTIVE_TABS;
}

/**
 * Is tab active message
 */
export interface IsTabActiveMessage extends BaseMessage {
    type: MessageType.IS_TAB_ACTIVE;
    tabId: number;
}

/**
 * Get FFT data message
 */
export interface GetFFTDataMessage extends BaseMessage {
    type: MessageType.GET_FFT_DATA;
    tabId: number;
}

/**
 * Toggle visualizer message
 */
export interface ToggleVisualizerMessage extends BaseMessage {
    type: MessageType.TOGGLE_VISUALIZER;
    enabled: boolean;
}

/**
 * Union type of all messages
 */
export type ChromeMessage =
    | UpdateFilterMessage
    | ResetFilterMessage
    | ResetAllFiltersMessage
    | GetFiltersMessage
    | UpdateGainMessage
    | GetGainMessage
    | SavePresetMessage
    | LoadPresetMessage
    | DeletePresetMessage
    | GetPresetsMessage
    | ImportPresetsMessage
    | ExportPresetsMessage
    | EQTabMessage
    | StopEQTabMessage
    | GetActiveTabsMessage
    | IsTabActiveMessage
    | GetFFTDataMessage
    | ToggleVisualizerMessage;

/**
 * Message response structure
 */
export interface MessageResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}
