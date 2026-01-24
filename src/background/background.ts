import {
    initializeFilters,
    getAllFilters,
    getStoredFilter,
    saveFilter,
    getStoredGain,
    saveGain,
} from './services/filterStorage';
import {
    getPresets,
    savePreset,
    deletePreset,
    importPresets,
} from './services/presetStorage';
import {
    setupOffscreen,
    addActiveTab,
    removeActiveTab,
    isTabActive,
    getActiveTabs,
    loadActiveTabIds,
} from './services/tabManager';
import {FILTER_COUNT, DEFAULT_FILTER_FREQUENCIES, DEFAULT_FILTER_Q} from '@/types/filter.types';
import {assertNever, type PopupToBackgroundMessage} from '@/types/messages.types';

/**
 * Get workspace status with all filters, gain, and active tabs
 */
async function getWorkspaceStatus() {
    const filters = await getAllFilters();
    const gain = await getStoredGain();
    const activeTabs = getActiveTabs();

    return {
        type: 'sendWorkspaceStatus',
        eqFilters: filters,
        streams: activeTabs,
        gain,
    };
}

/**
 * Message handler for background service worker
 * Handles messages from Popup
 */
chrome.runtime.onMessage.addListener((message: any, _sender, sendResponse) => {
    (async () => {
        try {
            // Type-safe message handling
            const typedMessage = message as PopupToBackgroundMessage;

            switch (typedMessage.type) {
                case 'eqTab': {
                    if (message.on) {
                        // Start EQ on current tab
                        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

                        if (tab && tab.id && !tab.url?.startsWith('chrome')) {
                            // Check if this tab is already active
                            if (isTabActive(tab.id)) {
                                console.log('Tab already active, skipping');
                                sendResponse({success: true, alreadyActive: true});
                                break;
                            }

                            // Setup offscreen document
                            await setupOffscreen();

                            // Get media stream ID
                            const streamId = await new Promise<string>((resolve, reject) => {
                                chrome.tabCapture.getMediaStreamId({targetTabId: tab.id!}, (id) => {
                                    if (chrome.runtime.lastError) {
                                        reject(chrome.runtime.lastError);
                                    } else {
                                        resolve(id);
                                    }
                                });
                            });

                            // Add to active tabs
                            await addActiveTab(tab);

                            // Get current filters and gain
                            const filters = await getAllFilters();
                            const gain = await getStoredGain();

                            // Send to offscreen document
                            await chrome.runtime.sendMessage({
                                type: 'captureStream',
                                tabId: tab.id,
                                streamId,
                                filters,
                                gain,
                            });

                            // Notify popup about tab status change
                            const status = await getWorkspaceStatus();
                            chrome.runtime.sendMessage(status).catch(() => {
                            });

                            sendResponse({success: true});
                        }
                    } else {
                        // Stop EQ on current tab
                        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
                        if (tab && tab.id && isTabActive(tab.id)) {
                            await removeActiveTab(tab.id);
                            await chrome.runtime.sendMessage({type: 'stopAudio', tabId: tab.id});

                            // Notify popup about tab status change
                            const status = await getWorkspaceStatus();
                            chrome.runtime.sendMessage(status).catch(() => {
                            });
                        }
                        sendResponse({success: true});
                    }
                    break;
                }

                case 'getCurrentTabStatus': {
                    const [currentTab] = await chrome.tabs.query({active: true, currentWindow: true});
                    sendResponse({
                        type: 'sendCurrentTabStatus',
                        streaming: currentTab && currentTab.id ? isTabActive(currentTab.id) : false,
                    });
                    break;
                }

                case 'getWorkspaceStatus': {
                    sendResponse(await getWorkspaceStatus());
                    break;
                }

                case 'getFullRefresh': {
                    console.log('getFullRefresh requested');
                    const status = await getWorkspaceStatus();
                    console.log('Sending workspace status:', status);

                    chrome.runtime.sendMessage(status).catch((e) => console.error('Error sending status:', e));

                    setTimeout(() => {
                        chrome.runtime.sendMessage({type: 'sendSampleRate', Fs: 44100}).catch(() => {
                        });
                        getPresets().then((p) =>
                            chrome.runtime.sendMessage({type: 'sendPresets', presets: p}).catch(() => {
                            })
                        );
                    }, 50);

                    sendResponse({success: true});
                    break;
                }

                case 'modifyFilter': {
                    const {index, frequency, gain, q} = message;
                    if (index >= 0 && index < FILTER_COUNT) {
                        await saveFilter(index, frequency, gain, q);
                        try {
                            await chrome.runtime.sendMessage({type: 'updateFilter', index, frequency, gain, q});
                        } catch (e) {
                            console.warn('Failed to send filter update to offscreen:', e);
                        }
                    }
                    sendResponse({success: true});
                    break;
                }

                case 'modifyGain': {
                    await saveGain(message.gain);
                    try {
                        await chrome.runtime.sendMessage({type: 'updateGain', gain: message.gain});
                    } catch (e) {
                        console.warn('Failed to send gain update to offscreen:', e);
                    }
                    sendResponse({success: true});
                    break;
                }

                case 'resetFilters': {
                    console.log('Resetting all filters');
                    for (let i = 0; i < FILTER_COUNT; i++) {
                        await saveFilter(i, DEFAULT_FILTER_FREQUENCIES[i], 0, DEFAULT_FILTER_Q);
                    }
                    try {
                        await chrome.runtime.sendMessage({type: 'resetAllFilters'});
                    } catch (e) {
                        console.warn('Failed to send reset to offscreen:', e);
                    }

                    // Send updated workspace status to popup
                    const resetStatus = await getWorkspaceStatus();
                    chrome.runtime.sendMessage(resetStatus).catch(() => {
                    });

                    sendResponse({success: true});
                    break;
                }

                case 'resetFilter': {
                    if (message.index >= 0 && message.index < FILTER_COUNT) {
                        await saveFilter(
                            message.index,
                            DEFAULT_FILTER_FREQUENCIES[message.index],
                            0,
                            DEFAULT_FILTER_Q
                        );
                        try {
                            await chrome.runtime.sendMessage({type: 'resetFilter', index: message.index});
                        } catch (e) {
                            console.warn('Failed to send filter reset to offscreen:', e);
                        }
                    }

                    const resetStatus = await getWorkspaceStatus();
                    chrome.runtime.sendMessage(resetStatus).catch(() => {
                    });

                    sendResponse({success: true});
                    break;
                }

                case 'preset': {
                    console.log('Applying preset:', message.preset);

                    if (message.preset === 'bassBoost') {
                        // Bass Boost preset
                        for (let i = 0; i < FILTER_COUNT; i++) {
                            await saveFilter(i, DEFAULT_FILTER_FREQUENCIES[i], 0, DEFAULT_FILTER_Q);
                        }
                        await saveFilter(0, 340, 5, DEFAULT_FILTER_Q);
                    } else {
                        // Load saved preset
                        const allPresets = await getPresets();
                        const preset = allPresets[message.preset];
                        console.log('Found preset:', preset);

                        if (preset && preset.frequencies && preset.gains && preset.qs) {
                            for (let i = 0; i < Math.min(FILTER_COUNT, preset.frequencies.length); i++) {
                                await saveFilter(i, preset.frequencies[i], preset.gains[i], preset.qs[i]);
                            }
                        } else {
                            console.error('Preset not found or invalid:', message.preset);
                        }
                    }

                    const updatedStatus = await getWorkspaceStatus();
                    try {
                        await chrome.runtime.sendMessage({
                            type: 'applyAllFilters',
                            filters: updatedStatus.eqFilters,
                        });
                    } catch (e) {
                        console.warn('Failed to apply filters to offscreen:', e);
                    }

                    // Send updated workspace status to popup
                    chrome.runtime.sendMessage(updatedStatus).catch(() => {
                    });

                    sendResponse({success: true});
                    break;
                }

                case 'savePreset': {
                    const frequencies = [];
                    const gains = [];
                    const qs = [];

                    for (let i = 0; i < FILTER_COUNT; i++) {
                        const filter = await getStoredFilter(i);
                        if (filter) {
                            frequencies.push(filter.f);
                            gains.push(filter.g);
                            qs.push(filter.q);
                        }
                    }

                    await savePreset(message.preset, {name: message.preset, frequencies, gains, qs});
                    sendResponse({type: 'sendPresets', presets: await getPresets()});
                    break;
                }

                case 'deletePreset': {
                    await deletePreset(message.preset);
                    sendResponse({type: 'sendPresets', presets: await getPresets()});
                    break;
                }

                case 'importPresets': {
                    await importPresets(message.presets);
                    sendResponse({type: 'sendPresets', presets: await getPresets()});
                    break;
                }

                case 'exportPresets': {
                    const presets = await getPresets();
                    sendResponse({presets});
                    break;
                }

                case 'disconnectTab': {
                    const tabId = message.tabId;
                    if (tabId && isTabActive(tabId)) {
                        await removeActiveTab(tabId);
                        console.log('Disabling tab due disconnect:', tabId);
                        try {
                            await chrome.runtime.sendMessage({type: 'stopAudio', tabId});
                        } catch (e) {
                            console.warn('Failed to stop audio:', e);
                        }

                        // Notify popup about tab status change
                        const status = await getWorkspaceStatus();
                        chrome.runtime.sendMessage(status).catch(() => {
                        });
                    }
                    sendResponse({success: true});
                    break;
                }

                case 'getFFT': {
                    try {
                        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

                        if (!tab || !tab.id) {
                            sendResponse({type: 'fft', fft: []});
                            break;
                        }

                        const contexts = await chrome.runtime.getContexts({
                            contextTypes: ['OFFSCREEN_DOCUMENT' as chrome.runtime.ContextType]
                        });

                        if (contexts.length === 0) {
                            console.warn('No offscreen document found');
                            sendResponse({type: 'fft', fft: []});
                            break;
                        }

                        const resp = await chrome.runtime.sendMessage({
                            type: 'getFFTInternal',
                            tabId: tab.id
                        });

                        sendResponse(resp || {type: 'fft', fft: []});
                    } catch (e) {
                        console.error('Failed to get FFT:', e);
                        sendResponse({type: 'fft', fft: []});
                    }
                    break;
                }

                default:
                    assertNever(typedMessage);
                    sendResponse({success: true});
            }
        } catch (error) {
            console.error('Background error:', JSON.stringify(error));
            sendResponse({error: (error as Error).message});
        }
    })();

    // Return true to indicate async response
    return true;
});

/**
 * Initialize filters on installation
 */
chrome.runtime.onInstalled.addListener(() => {
    initializeFilters();
});

/**
 * Initialize filters on startup
 */
initializeFilters();

/**
 * Load active tabs from storage on startup
 */
loadActiveTabIds().then(() => {
    console.log('Active tabs restored from storage');
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    if (isTabActive(tabId)) {
        console.log('Tab closed, removing from active tabs:', tabId);
        await removeActiveTab(tabId);

        try {
            await chrome.runtime.sendMessage({type: 'stopAudio', tabId});
        } catch (e) {
            console.warn('Failed to stop audio for closed tab:', e);
        }

        const status = await getWorkspaceStatus();
        chrome.runtime.sendMessage(status).catch(() => {});
    }
});

console.log('ReEQ background service worker loaded');
