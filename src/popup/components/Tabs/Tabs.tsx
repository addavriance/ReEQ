interface TabsProps {
    activeTab: 'eq' | 'guide' | 'tabs';
    onTabChange: (tab: 'eq' | 'guide' | 'tabs') => void;
}

/**
 * Tabs component for navigation between different views
 */
export function Tabs({ activeTab, onTabChange }: TabsProps) {
    return (
        <div className="ears__tabs">
            <button
                className={`ears__tab ${activeTab === 'eq' ? 'ears__tab--active' : ''}`}
                onClick={() => onTabChange('eq')}
            >
                EQ
            </button>
            <button
                className={`ears__tab ${activeTab === 'guide' ? 'ears__tab--active' : ''}`}
                onClick={() => onTabChange('guide')}
            >
                Guide
            </button>
            <button
                className={`ears__tab ${activeTab === 'tabs' ? 'ears__tab--active' : ''}`}
                onClick={() => onTabChange('tabs')}
            >
                Active Tabs
            </button>
        </div>
    );
}
