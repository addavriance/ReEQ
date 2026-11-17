/**
 * Work around Chromium's tabCapture fullscreen limitation.
 *
 * While a tab is being captured with chrome.tabCapture, some Chromium-based
 * browsers keep the browser chrome visible even though the page's element has
 * entered the Fullscreen API. CaptureInfo.fullscreen reports that transition.
 * We mirror it by switching the browser window to its native fullscreen state
 * and restore the previous window state when the page exits fullscreen.
 */

type RestorableWindowState = 'normal' | 'maximized';

interface FullscreenRestoreRecord {
    previousState: RestorableWindowState;
    tabIds: number[];
}

const STORAGE_KEY = 'reeq_fullscreen_restore_v1';

type FullscreenRestoreMap = Record<string, FullscreenRestoreRecord>;

// Keep enter/exit transitions ordered if a user toggles fullscreen quickly.
let transitionQueue: Promise<void> = Promise.resolve();

function enqueueTransition(task: () => Promise<void>): Promise<void> {
    transitionQueue = transitionQueue.then(task).catch((error) => {
        console.warn('Fullscreen workaround transition failed:', error);
    });
    return transitionQueue;
}

async function readRestoreMap(): Promise<FullscreenRestoreMap> {
    const stored = await chrome.storage.session.get(STORAGE_KEY);
    return (stored[STORAGE_KEY] as FullscreenRestoreMap | undefined) ?? {};
}

async function writeRestoreMap(records: FullscreenRestoreMap): Promise<void> {
    await chrome.storage.session.set({ [STORAGE_KEY]: records });
}

/**
 * Make the browser window fullscreen while a captured tab is in page fullscreen.
 * The original window state is stored in session storage so it survives
 * service-worker suspension/restart.
 */
async function enterBrowserFullscreen(tabId: number): Promise<void> {
    const tab = await chrome.tabs.get(tabId);
    const windowId = tab.windowId;
    const key = String(windowId);
    const records = await readRestoreMap();
    const existingRecord = records[key];

    if (existingRecord) {
        if (!existingRecord.tabIds.includes(tabId)) {
            existingRecord.tabIds.push(tabId);
            await writeRestoreMap(records);
        }
        return;
    }

    const browserWindow = await chrome.windows.get(windowId);

    // Do not undo a fullscreen state the user enabled independently (for
    // example with F11). Only restore states that this workaround changes.
    if (browserWindow.state === 'fullscreen') {
        return;
    }

    const previousState: RestorableWindowState =
        browserWindow.state === 'maximized' ? 'maximized' : 'normal';

    records[key] = {
        previousState,
        tabIds: [tabId],
    };
    await writeRestoreMap(records);

    try {
        await chrome.windows.update(windowId, { state: 'fullscreen' });
    } catch (error) {
        // Do not leave stale restore data if the browser refuses the update.
        delete records[key];
        await writeRestoreMap(records);
        throw error;
    }
}

/**
 * Remove a tab from the workaround and restore the original window state when
 * no remaining captured tab in that window is in page fullscreen.
 */
async function removeTabFromFullscreen(tabId: number): Promise<void> {
    const records = await readRestoreMap();

    for (const [key, record] of Object.entries(records)) {
        if (!record.tabIds.includes(tabId)) {
            continue;
        }

        record.tabIds = record.tabIds.filter((id) => id !== tabId);
        const windowId = Number(key);

        if (record.tabIds.length > 0) {
            await writeRestoreMap(records);
            return;
        }

        delete records[key];
        // Persist removal before changing the window. If the service worker is
        // suspended during the update, it will not try to restore twice.
        await writeRestoreMap(records);

        try {
            const browserWindow = await chrome.windows.get(windowId);
            // Restore only if the window is still fullscreen. If the user
            // changed the window state manually, leave that choice untouched.
            if (browserWindow.state === 'fullscreen') {
                await chrome.windows.update(windowId, {
                    state: record.previousState,
                });
            }
        } catch (error) {
            // The window may already have been closed.
            console.debug('Could not restore browser window state:', error);
        }

        return;
    }
}

/** Register the tabCapture fullscreen listener in the service worker. */
export function registerFullscreenWorkaround(): void {
    chrome.tabCapture.onStatusChanged.addListener((captureInfo) => {
        if (captureInfo.status === 'active' && captureInfo.fullscreen) {
            void enqueueTransition(() => enterBrowserFullscreen(captureInfo.tabId));
        } else {
            // This also cleans up when capture stops or errors while fullscreen.
            void enqueueTransition(() => removeTabFromFullscreen(captureInfo.tabId));
        }
    });
}

/** Release any forced fullscreen state if a captured tab is closed. */
export function releaseFullscreenForTab(tabId: number): Promise<void> {
    return enqueueTransition(() => removeTabFromFullscreen(tabId));
}
