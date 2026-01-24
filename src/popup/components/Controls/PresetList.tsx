import {useEQStore} from '@/store';

interface PresetListProps {
    onPresetSelect?: (presetName: string) => void;
}

/**
 * Preset List component
 * Displays and allows loading saved presets
 */
export function PresetList({onPresetSelect}: PresetListProps) {
    const presets = useEQStore((state) => state.presets.items);

    const handleLoadPreset = async (presetName: string) => {
        try {
            await chrome.runtime.sendMessage({
                type: 'preset',
                preset: presetName,
            });
        } catch (error) {
            console.error('Failed to load preset:', error);
        }
    };

    const handlePresetClick = (presetName: string) => {
        handleLoadPreset(presetName);
    };

    const handlePresetRightClick = (presetName: string, event: React.MouseEvent) => {
        event.preventDefault();
        onPresetSelect?.(presetName);
    };

    const handleBassBoost = () => {
        handleLoadPreset('bassBoost');
    };

    return (
        <>
            {/* Bass Boost preset */}
            <button
                onClick={handleBassBoost}
                className="ears__button ears__button--bass"
            >
                Bass Boost
            </button>

            {/* User presets */}
            {Object.keys(presets).length > 0 && (
                <>
                    {Object.keys(presets).map((presetName) => (
                        <button
                            key={presetName}
                            onClick={() => handlePresetClick(presetName)}
                            onContextMenu={(e) => handlePresetRightClick(presetName, e)}
                            className="ears__button ears__button--preset"
                            title="Click to load preset, right-click to select for deletion"
                        >
                            {presetName}
                        </button>
                    ))}
                </>
            )}
        </>
    );
}
