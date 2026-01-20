import {Filter} from './filter.types';
import {Preset} from './preset.types';

/**
 * MESSAGE FLOW ARCHITECTURE
 * =========================
 *
 * Popup → Background → Offscreen
 *
 * 1. User interacts with Popup
 * 2. Popup sends message to Background
 * 3. Background processes and may forward to Offscreen
 * 4. Offscreen responds to Background
 * 5. Background broadcasts updates to Popup
 *
 * IMPORTANT: Popup never communicates directly with Offscreen!
 */

// ============================================================================
// MESSAGE TYPE CONSTANTS
// ============================================================================

/**
 * Messages that Popup sends to Background
 */
export const POPUP_TO_BACKGROUND_TYPES = [
    'eqTab',
    'getCurrentTabStatus',
    'getWorkspaceStatus',
    'getFullRefresh',
    'modifyFilter',
    'modifyGain',
    'resetFilters',
    'resetFilter',
    'preset',
    'savePreset',
    'deletePreset',
    'importPresets',
    'exportPresets',
    'disconnectTab',
    'getFFT',
] as const;

/**
 * Messages that Background sends to Offscreen
 */
export const BACKGROUND_TO_OFFSCREEN_TYPES = [
    'captureStream',
    'updateFilter',
    'updateGain',
    'resetAllFilters',
    'resetFilter',
    'applyAllFilters',
    'getFFTInternal',
    'stopAudio',
] as const;

/**
 * Messages that Background broadcasts to Popup
 */
export const BACKGROUND_TO_POPUP_TYPES = [
    'sendWorkspaceStatus',
    'sendCurrentTabStatus',
    'sendPresets',
    'sendSampleRate',
    'downloadPresets',
] as const;

/**
 * Messages that Offscreen sends back to Background
 */
export const OFFSCREEN_TO_BACKGROUND_TYPES = [
    'fft',
] as const;

// ============================================================================
// UNION TYPES FROM CONSTANTS
// ============================================================================

/**
 * Extract union types from constant arrays
 */
export type PopupToBackgroundType = typeof POPUP_TO_BACKGROUND_TYPES[number];
export type BackgroundToOffscreenType = typeof BACKGROUND_TO_OFFSCREEN_TYPES[number];
export type BackgroundToPopupType = typeof BACKGROUND_TO_POPUP_TYPES[number];
export type OffscreenToBackgroundType = typeof OFFSCREEN_TO_BACKGROUND_TYPES[number];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Exhaustive check helper for TypeScript
 * Ensures all cases in switch are handled
 *
 * Usage:
 * default:
 *   assertNever(message.type);
 */
export function assertNever(value: never): never {
    throw new Error(`Unhandled case: ${value}`);
}

/**
 * Check if message is intended for Offscreen document
 */
export function isOffscreenMessage(type: string): type is BackgroundToOffscreenType {
    return (BACKGROUND_TO_OFFSCREEN_TYPES as readonly string[]).includes(type);
}

/**
 * Check if message is a broadcast from Background to Popup
 */
export function isBackgroundBroadcast(type: string): type is BackgroundToPopupType {
    return (BACKGROUND_TO_POPUP_TYPES as readonly string[]).includes(type);
}

/**
 * Check if message should be ignored by Popup (internal messages)
 */
export function shouldPopupIgnore(type: string): boolean {
    return isOffscreenMessage(type) ||
           (OFFSCREEN_TO_BACKGROUND_TYPES as readonly string[]).includes(type);
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Messages from Popup to Background
 */
export type PopupToBackgroundMessage =
    | { type: 'eqTab'; on: boolean }
    | { type: 'getCurrentTabStatus' }
    | { type: 'getWorkspaceStatus' }
    | { type: 'getFullRefresh' }
    | { type: 'modifyFilter'; index: number; frequency: number; gain: number; q: number }
    | { type: 'modifyGain'; gain: number }
    | { type: 'resetFilters' }
    | { type: 'resetFilter'; index: number }
    | { type: 'preset'; preset: string }
    | { type: 'savePreset'; preset: string }
    | { type: 'deletePreset'; preset: string }
    | { type: 'importPresets'; presets: Record<string, Preset> }
    | { type: 'exportPresets' }
    | { type: 'disconnectTab'; tabId: number }
    | { type: 'getFFT' };

/**
 * Messages from Background to Offscreen
 */
export type BackgroundToOffscreenMessage =
    | { type: 'captureStream'; tabId: number; streamId: string; filters: Filter[]; gain: number }
    | { type: 'updateFilter'; index: number; frequency: number; gain: number; q: number }
    | { type: 'updateGain'; gain: number }
    | { type: 'resetAllFilters' }
    | { type: 'resetFilter'; index: number }
    | { type: 'applyAllFilters'; filters: Filter[] }
    | { type: 'getFFTInternal'; tabId: number }
    | { type: 'stopAudio'; tabId: number };

/**
 * Messages from Background to Popup (broadcasts)
 */
export type BackgroundToPopupMessage =
    | { type: 'sendWorkspaceStatus'; eqFilters: Filter[]; streams: chrome.tabs.Tab[]; gain: number }
    | { type: 'sendCurrentTabStatus'; streaming: boolean }
    | { type: 'sendPresets'; presets: Record<string, Preset> }
    | { type: 'sendSampleRate'; Fs: number }
    | { type: 'downloadPresets'; presets: Record<string, Preset> };

/**
 * Messages from Offscreen to Background (responses)
 */
export type OffscreenToBackgroundMessage =
    | { type: 'fft'; fft: number[] };

/**
 * All message types combined
 */
export type ChromeMessage =
    | PopupToBackgroundMessage
    | BackgroundToOffscreenMessage
    | BackgroundToPopupMessage
    | OffscreenToBackgroundMessage;
