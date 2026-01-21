import {useEffect} from 'react';
import {useEQStore} from '@/store';

/**
 * Hook for syncing with current tab state
 * BUG FIX #2: Auto-syncs EQ button state when tab changes
 */
export function useTabSync() {
    const activeTabs = useEQStore((state) => state.tabs.activeTabs);
    const currentTabId = useEQStore((state) => state.tabs.currentTabId);
    const setCurrentTabId = useEQStore((state) => state.tabs.setCurrentTabId);

    /**
     * Listen for tab changes
     */
    useEffect(() => {
        // Listen for tab activation
        const handleTabActivated = (activeInfo: { tabId: number }) => {
            setCurrentTabId(activeInfo.tabId);
        };

        // Listen for tab updates
        const handleTabUpdated = (tabId: number) => {
            // Update current tab if it's the active tab
            chrome.tabs.query({active: true, currentWindow: true}, ([activeTab]) => {
                if (activeTab && activeTab.id === tabId) {
                    setCurrentTabId(tabId);
                }
            });
        };

        chrome.tabs.onActivated.addListener(handleTabActivated);
        chrome.tabs.onUpdated.addListener(handleTabUpdated);

        // Get initial current tab
        chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
            if (tab && tab.id) {
                setCurrentTabId(tab.id);
            }
        });

        return () => {
            chrome.tabs.onActivated.removeListener(handleTabActivated);
            chrome.tabs.onUpdated.removeListener(handleTabUpdated);
        };
    }, [setCurrentTabId]);

    /**
     * Check if current tab has EQ active
     */
    const isEQActive = currentTabId !== null && activeTabs.includes(currentTabId);

    return {
        isEQActive,
        currentTabId,
    };
}
