import {Preset} from '@/types/preset.types';

/**
 * Get all presets from both local and sync storage
 */
export async function getPresets(): Promise<Record<string, Preset>> {
    const local = await chrome.storage.local.get('PRESETS');
    const sync = await chrome.storage.sync.get(null);

    const presets: Record<string, Preset> = (local.PRESETS as Record<string, Preset>) || {};

    // Merge sync storage presets
    for (const key in sync) {
        if (key.startsWith('PRESETS.')) {
            const presetName = key.slice(8);
            presets[presetName] = sync[key] as Preset;
        }
    }

    return presets;
}

/**
 * Save a preset to storage
 */
export async function savePreset(name: string, preset: Preset): Promise<void> {
    // Save to local storage
    const presets: Record<string, Preset> = (await chrome.storage.local.get('PRESETS')).PRESETS as Record<string, Preset> || {};
    presets[name] = preset;
    await chrome.storage.local.set({PRESETS: presets});

    // Try to save to sync storage (best effort)
    try {
        await chrome.storage.sync.set({[`PRESETS.${name}`]: preset});
    } catch (e) {
        console.warn('Failed to sync preset to sync storage:', e);
    }
}

/**
 * Delete a preset from storage
 */
export async function deletePreset(name: string): Promise<void> {
    // Delete from local storage
    const presets: Record<string, Preset> = (await chrome.storage.local.get('PRESETS')).PRESETS as Record<string, Preset> || {};
    delete presets[name];
    await chrome.storage.local.set({PRESETS: presets});

    // Try to delete from sync storage (best effort)
    try {
        await chrome.storage.sync.remove(`PRESETS.${name}`);
    } catch (e) {
        console.warn('Failed to remove preset from sync storage:', e);
    }
}

/**
 * Import multiple presets
 */
export async function importPresets(presets: Record<string, Preset>): Promise<void> {
    for (const name in presets) {
        await savePreset(name, presets[name]);
    }
}

/**
 * Export all presets
 */
export async function exportPresets(): Promise<Record<string, Preset>> {
    return await getPresets();
}
