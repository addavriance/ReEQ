import {useState} from 'react';

/**
 * Preset Controls component
 * Save, delete, and reset presets
 */
export function PresetControls() {
    const [presetName, setPresetName] = useState('');

    const handleSavePreset = async () => {
        if (!presetName.trim()) return;

        try {
            await chrome.runtime.sendMessage({
                type: 'savePreset',
                preset: presetName.trim(),
            });
            setPresetName('');
        } catch (error) {
            console.error('Failed to save preset:', error);
        }
    };

    const handleDeletePreset = async () => {
        if (!presetName.trim()) return;

        try {
            await chrome.runtime.sendMessage({
                type: 'deletePreset',
                preset: presetName.trim(),
            });
            setPresetName('');
        } catch (error) {
            console.error('Failed to delete preset:', error);
        }
    };

    const handleResetFilters = async () => {
        try {
            await chrome.runtime.sendMessage({
                type: 'resetFilters',
            });
        } catch (error) {
            console.error('Failed to reset filters:', error);
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSavePreset();
        }
    };

    return (
        <div className="ears__preset-controls">
            <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Preset Name"
                className="ears__preset-input"
            />
            <button
                onClick={handleSavePreset}
                className="ears__button ears__button--save"
            >
                + Save Preset
            </button>
            <button
                onClick={handleDeletePreset}
                className="ears__button ears__button--delete"
            >
                - Delete Preset
            </button>
            <button
                onClick={handleResetFilters}
                className="ears__button ears__button--reset"
            >
                Reset Filters
            </button>
        </div>
    );
}
