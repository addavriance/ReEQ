import {useEQStore} from '@/store';

/**
 * Preset List component
 * Displays and allows loading saved presets
 */
export function PresetList() {
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
                <span className="ears__user-presets">
                    {Object.keys(presets).map((presetName) => (
                        <button
                            key={presetName}
                            onClick={() => handleLoadPreset(presetName)}
                            className="ears__button ears__button--preset"
                        >
                            {presetName}
                        </button>
                    ))}
                </span>
            )}
        </>
    );
}
