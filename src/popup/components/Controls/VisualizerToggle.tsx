import {useEQStore} from '@/store';

/**
 * Visualizer Toggle component
 * Toggles FFT spectrum visualizer on/off
 */
export function VisualizerToggle() {
    const isEnabled = useEQStore((state) => state.ui.isVisualizerEnabled);
    const toggleVisualizer = useEQStore((state) => state.ui.toggleVisualizer);

    return (
        <button
            onClick={toggleVisualizer}
            className={isEnabled ? 'ears__viz-button ears__viz-button--active' : 'ears__viz-button'}
        >
            <span>
                Spectrum
                <br/>
                Visualizer
            </span>
        </button>
    );
}
