import {useTabSync} from '@/popup/hooks/useTabSync';

/**
 * EQ Toggle Button component
 * BUG FIX #2: Auto-syncs button state when switching tabs
 * Uses useTabSync hook to track current tab EQ status
 */
export function EQToggleButton() {
    const {isEQActive, currentTabId} = useTabSync();

    const handleToggle = async () => {
        if (!currentTabId) return;

        try {
            await chrome.runtime.sendMessage({
                type: 'eqTab',
                on: !isEQActive,
            });
        } catch (error) {
            console.error('Failed to toggle EQ:', error);
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={isEQActive ? 'ears__button ears__button--stop ears__button--eq' : 'ears__button ears__button--eq'}
        >
            {isEQActive ? 'Stop EQing This Tab' : 'EQ This Tab'}
        </button>
    );
}
