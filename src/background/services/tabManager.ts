/**
 * Active streams/tabs being processed
 */
interface ActiveStream {
    tab: chrome.tabs.Tab;
}

/**
 * Storage key for active tab IDs (shared with Zustand store)
 */
const ACTIVE_TABS_KEY = 'eq_active_tabs';

/**
 * Global active streams storage
 */
const activeStreams: Record<number, ActiveStream> = {};

/**
 * Save active tab IDs to storage
 */
async function saveActiveTabIds(): Promise<void> {
    const tabIds = Object.keys(activeStreams).map((id) => parseInt(id, 10));
    await chrome.storage.local.set({[ACTIVE_TABS_KEY]: tabIds});
}

/**
 * Load active tab IDs from storage and restore tabs
 */
export async function loadActiveTabIds(): Promise<void> {
    const result = await chrome.storage.local.get(ACTIVE_TABS_KEY);
    const tabIds = result[ACTIVE_TABS_KEY] as number[] || [];

    console.log('Loading active tabs from storage:', tabIds);

    // Restore tabs from storage
    for (const tabId of tabIds) {
        try {
            const tab = await chrome.tabs.get(tabId);
            if (tab) {
                activeStreams[tabId] = {tab};
                console.log('Restored active tab:', tabId);
            }
        } catch (err) {
            // Tab no longer exists, remove from storage
            console.log('Tab no longer exists:', tabId);
        }
    }

    // Save cleaned up list
    await saveActiveTabIds();
}

/**
 * Offscreen document ready flag
 */
let offscreenReady = false;

/**
 * Setup offscreen document for audio processing
 */
export async function setupOffscreen(): Promise<void> {
    if (offscreenReady) return;

    const existingContexts = await chrome.runtime.getContexts({});
    const offscreenDocument = existingContexts.find(
        (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
    );

    if (!offscreenDocument) {
        await chrome.offscreen.createDocument({
            url: 'src/offscreen/offscreen.html',
            reasons: ['USER_MEDIA' as chrome.offscreen.Reason],
            justification: 'Audio processing',
        });
    }

    offscreenReady = true;
}

/**
 * Add a tab to active streams
 */
export async function addActiveTab(tab: chrome.tabs.Tab): Promise<void> {
    if (tab.id) {
        activeStreams[tab.id] = {tab};
        await saveActiveTabIds();
        console.log('Added active tab to storage:', tab.id);
    }
}

/**
 * Remove a tab from active streams
 */
export async function removeActiveTab(tabId: number): Promise<void> {
    delete activeStreams[tabId];
    await saveActiveTabIds();
    console.log('Removed active tab from storage:', tabId);
}

/**
 * Check if a tab is active
 */
export function isTabActive(tabId: number): boolean {
    return tabId in activeStreams;
}

/**
 * Get all active tabs
 */
export function getActiveTabs(): chrome.tabs.Tab[] {
    return Object.values(activeStreams).map((stream) => stream.tab);
}

/**
 * Get all active tab IDs
 */
export function getActiveTabIds(): number[] {
    return Object.keys(activeStreams).map((id) => parseInt(id, 10));
}

/**
 * Clear all active tabs
 */
export async function clearActiveTabs(): Promise<void> {
    for (const tabId in activeStreams) {
        delete activeStreams[tabId];
    }
    await saveActiveTabIds();
}
