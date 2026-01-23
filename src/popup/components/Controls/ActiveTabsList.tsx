import {useEQStore} from '@/store';
import {useEffect, useState} from 'react';

interface TabInfo {
    id: number;
    title: string;
    favIconUrl?: string;
}

/**
 * ActiveTabsList component
 * Displays all tabs with EQ active and allows switching between them
 */
export function ActiveTabsList() {
    const activeTabs = useEQStore((state) => state.tabs.activeTabs);
    const [tabsInfo, setTabsInfo] = useState<TabInfo[]>([]);

    // Fetch tab info for all active tabs
    useEffect(() => {
        const fetchTabsInfo = async () => {
            if (activeTabs.length === 0) {
                setTabsInfo([]);
                return;
            }

            try {
                const tabs = await Promise.all(
                    activeTabs.map(async (tabId) => {
                        try {
                            const tab = await chrome.tabs.get(tabId);
                            return {
                                id: tab.id!,
                                title: tab.title || 'Unknown Tab',
                                favIconUrl: tab.favIconUrl,
                            };
                        } catch (err) {
                            // Tab might have been closed
                            console.warn(`Failed to get tab ${tabId}:`, err);
                            return null;
                        }
                    })
                );

                // Filter out null values (closed tabs)
                const validTabs = tabs.filter((tab) => tab !== null) as TabInfo[];
                setTabsInfo(validTabs);
            } catch (err) {
                console.error('Failed to fetch tabs info:', err);
            }
        };

        fetchTabsInfo();
    }, [activeTabs]);

    const handleStopTab = async (tabId: number) => {
        try {
            await chrome.runtime.sendMessage({
                type: 'disconnectTab',
                tabId,
            });
        } catch (err) {
            console.error('Failed to stop tab:', err);
        }
    };

    if (tabsInfo.length === 0) {
        return (
            <div className="ears__tabs-empty">
                No tabs active. Go to 'EQ' tab to activate the current tab.
            </div>
        );
    }

    return (
        <table className="ears__tabs-table">
            <tbody>
            {tabsInfo.map((tab) => (
                <tr key={tab.id}>
                    <td>
                        <button
                            onClick={() => handleStopTab(tab.id)}
                            className="ears__button ears__button--stop"
                        >
                            Stop EQing
                            {tab.favIconUrl && (
                                <img
                                    src={tab.favIconUrl}
                                    alt=""
                                    className="ears__tab-favicon"
                                />
                            )}
                        </button>
                    </td>
                    <td className="ears__tab-title">
                        {tab.title.length > 45
                            ? tab.title.substring(0, 45) + '...'
                            : tab.title}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
}
