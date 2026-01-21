import {useEffect} from 'react';
import {useEQStore} from '@/store';
import {Filter} from '@/types/filter.types';

/**
 * Hook for handling Chrome runtime messages
 * Listens for updates from background script and updates store
 */
export function useChromeMessaging() {
    useEffect(() => {
        const handleMessage = (message: any) => {
            switch (message.type) {
                case 'sendWorkspaceStatus': {
                    // Update filters
                    if (message.eqFilters && Array.isArray(message.eqFilters)) {
                        useEQStore.getState().filters.setFilters(message.eqFilters as Filter[]);
                    }

                    // Update gain
                    if (message.gain !== undefined) {
                        useEQStore.getState().gain.updateGain(message.gain);
                    }

                    // Update active tabs
                    if (message.streams && Array.isArray(message.streams)) {
                        const tabIds = message.streams.map((tab: any) => tab.id).filter(Boolean);
                        useEQStore.getState().tabs.setActiveTabs(tabIds);
                    }
                    break;
                }

                case 'sendPresets': {
                    if (message.presets) {
                        useEQStore.getState().presets.setPresets(message.presets);
                    }
                    break;
                }

                case 'sendCurrentTabStatus': {
                    // Handle tab status updates
                    break;
                }

                default:
                    break;
            }
        };

        chrome.runtime.onMessage.addListener(handleMessage);

        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
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
