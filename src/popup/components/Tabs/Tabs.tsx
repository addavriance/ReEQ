interface TabsProps {
    activeTab: 'eq' | 'tabs';
    onTabChange: (tab: 'eq' | 'tabs') => void;
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
                className={`ears__tab ${activeTab === 'tabs' ? 'ears__tab--active' : ''}`}
                onClick={() => onTabChange('tabs')}
            >
                Active Tabs
            </button>
        </div>
    );
}
