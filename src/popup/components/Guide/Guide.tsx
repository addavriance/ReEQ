/**
 * Guide component
 * Displays user guide and instructions
 */
export function Guide() {
    return (
        <div className="ears__guide">
            <p className="ears__guide-text">
                Click the ReEQ extension icon to enable audio processing on the current tab.
                To add another tab, open that tab and click the ReEQ icon again.
            </p>

            <h3 className="ears__guide-subtitle">Equalizer (EQ)</h3>

            <p className="ears__guide-text">
                The movable dots each represent a filter used to equalize (EQ) the audio.
                Filters allow you to boost or reduce specific frequencies.
            </p>

            <p className="ears__guide-text">
                • Move a dot <strong>left/right</strong> to select lower or higher frequencies
                <br />
                • Move a dot <strong>up/down</strong> to increase or decrease the gain
                <br />
                • Hold <strong>Shift</strong> while dragging to adjust the Q-factor (bandwidth)
                <br />
                • <strong>Double-click</strong> a dot to reset that filter
            </p>

            <p className="ears__guide-text">
                The frequency spectrum visualizer shows what you're listening to in real-time
                and how your EQ settings affect the audio.
            </p>

            <h3 className="ears__guide-subtitle">Volume Control</h3>

            <p className="ears__guide-text">
                Use the vertical slider on the left to adjust overall volume (gain).
                This applies after all EQ filters and affects the final output.
            </p>

            <h3 className="ears__guide-subtitle">Presets</h3>

            <p className="ears__guide-text">
                To save your current filter configuration:
            </p>
            <ol className="ears__guide-list">
                <li>Type a name in the preset input box</li>
                <li>Click "Save Preset" or press ENTER</li>
                <li>Your preset will appear in the preset list below</li>
            </ol>

            <p className="ears__guide-text">
                Use "Export Presets" to save all your presets to a JSON file,
                and "Import Presets" to load them on another device or after reinstalling.
            </p>

            <h3 className="ears__guide-subtitle">Filter Types</h3>

            <p className="ears__guide-text">
                • Filters 1-3 (left side): <strong>Low-shelf</strong> - affect bass frequencies
                <br />
                • Filters 4-7 (middle): <strong>Peaking</strong> - affect mid-range frequencies
                <br />
                • Filters 8-10 (right side): <strong>High-shelf</strong> - affect treble frequencies
            </p>

            <h3 className="ears__guide-subtitle">Tips</h3>

            <p className="ears__guide-text">
                ⚠️ <strong>Warning:</strong> Excessive gain can damage your hearing and speakers.
                Start with small adjustments and listen at moderate volumes.
            </p>

            <p className="ears__guide-text">
                💡 For best results, enable the visualizer to see how your changes affect
                the frequency spectrum in real-time.
            </p>
        </div>
    );
}
