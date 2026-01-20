import {useEffect} from 'react';
import {useEQStore} from '@/store';
import {
    shouldPopupIgnore,
    assertNever,
    type BackgroundToPopupMessage
} from '@/types/messages.types';

/**
 * Hook for handling Chrome runtime messages
 * Listens for updates from background script and updates store
 */
export function useChromeMessaging() {
    useEffect(() => {
        const handleMessage = (message: any) => {
            // Ignore internal messages between background and offscreen
            if (shouldPopupIgnore(message.type)) {
                return;
            }

            // Type-safe message handling
            const typedMessage = message as BackgroundToPopupMessage;

            switch (typedMessage.type) {
                case 'sendWorkspaceStatus': {
                    // Update filters
                    if (typedMessage.eqFilters && Array.isArray(typedMessage.eqFilters)) {
                        useEQStore.getState().filters.setFilters(typedMessage.eqFilters);
                    }

                    // Update gain
                    if (typedMessage.gain !== undefined) {
                        useEQStore.getState().gain.updateGain(typedMessage.gain);
                    }

                    // Update active tabs
                    if (typedMessage.streams && Array.isArray(typedMessage.streams)) {
                        const tabIds = typedMessage.streams.map((tab: any) => tab.id).filter(Boolean);
                        useEQStore.getState().tabs.setActiveTabs(tabIds);
                    }
                    break;
                }

                case 'sendPresets': {
                    if (typedMessage.presets) {
                        useEQStore.getState().presets.setPresets(typedMessage.presets);
                    }
                    break;
                }

                case 'sendCurrentTabStatus': {
                    // Handle tab status updates
                    break;
                }

                case 'sendSampleRate': {
                    // Sample rate update - currently not used in UI
                    break;
                }

                case 'downloadPresets': {
                    // Download presets - handled elsewhere
                    break;
                }

                default:
                    // Exhaustive check: if you get an error here, you forgot to handle a message type
                    assertNever(typedMessage);
            }
        };

        const handleStorageChange = (changes: {[key: string]: chrome.storage.StorageChange}) => {
            if (changes['eq_active_tabs']) {
                const newActiveTabs = changes['eq_active_tabs'].newValue as number[] || [];
                useEQStore.getState().tabs.setActiveTabs(newActiveTabs);
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);
        chrome.storage.onChanged.addListener(handleStorageChange);

        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
            chrome.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);
}

/**
 * Request full workspace refresh from background
 */
export async function requestWorkspaceRefresh() {
    try {
        await chrome.runtime.sendMessage({type: 'getFullRefresh'});
    } catch (error) {
        console.error('Failed to request workspace refresh:', error);
    }
}
