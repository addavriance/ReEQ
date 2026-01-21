/**
 * Active streams/tabs being processed
 */
interface ActiveStream {
    tab: chrome.tabs.Tab;
}

/**
 * Global active streams storage
 */
const activeStreams: Record<number, ActiveStream> = {};

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
export function addActiveTab(tab: chrome.tabs.Tab): void {
    if (tab.id) {
        activeStreams[tab.id] = {tab};
    }
}

/**
 * Remove a tab from active streams
 */
export function removeActiveTab(tabId: number): void {
    delete activeStreams[tabId];
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
export function clearActiveTabs(): void {
    for (const tabId in activeStreams) {
        delete activeStreams[tabId];
    }
}
