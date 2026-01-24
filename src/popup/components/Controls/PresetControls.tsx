import {useRef} from 'react';
import {useEQStore} from '@/store';

interface PresetControlsProps {
    presetName: string;
    setPresetName: (name: string) => void;
}

/**
 * Preset Controls component
 * Save, delete, reset, import, and export presets
 */
export function PresetControls({presetName, setPresetName}: PresetControlsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const setPresets = useEQStore((state) => state.presets.setPresets);

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
            const response = await chrome.runtime.sendMessage({
                type: 'deletePreset',
                preset: presetName.trim(),
            });

            if (response && response.presets) {
                setPresets(response.presets);
            }
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

    const handleExportPresets = async () => {
        try {
            const response = await chrome.runtime.sendMessage({
                type: 'exportPresets',
            });

            if (response && response.presets) {
                const dataStr = JSON.stringify(response.presets, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `reeq-presets-${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Failed to export presets:', error);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const presets = JSON.parse(text);

            const response = await chrome.runtime.sendMessage({
                type: 'importPresets',
                presets: presets,
            });

            if (response && response.presets) {
                setPresets(response.presets);
            }

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Failed to import presets:', error);
            alert('Failed to import presets. Please ensure the file is a valid ReEQ presets export.');
        }
    };

    return (
        <>
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

            <div className="ears__import-export">
                <button
                    onClick={handleExportPresets}
                    className="ears__button ears__button--export"
                    title="Export all saved presets to a file"
                >
                    Export Presets
                </button>
                <button
                    onClick={handleImportClick}
                    className="ears__button ears__button--import"
                    title="Import presets from a file"
                >
                    Import Presets
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    style={{display: 'none'}}
                />
            </div>
        </>
    );
}
