import {useEffect, useRef, useCallback} from 'react';
import {useCanvasDrag} from './useCanvasDrag';
import {linearGainToDB, dbToLinearGain} from '@/popup/utils/filterMath';
import {
    COLORS,
    GAIN_CANVAS_WIDTH,
    GAIN_CANVAS_HEIGHT,
    GAIN_LINE_HEIGHT,
    MIN_GAIN,
    MAX_GAIN
} from '@/popup/utils/constants';
import {useEQStore} from '@/store';

/**
 * GainLine component
 * Draggable line for adjusting overall volume/gain
 */
export function GainLine() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gain = useEQStore((state) => state.gain.value);
    const updateGain = useEQStore((state) => state.gain.updateGain);

    // Convert linear gain to dB for display
    const gainDB = linearGainToDB(gain);

    // Calculate Y position (inverted: 0 at bottom, height at top)
    const gainToY = (db: number) => {
        const range = MAX_GAIN - MIN_GAIN;
        return GAIN_CANVAS_HEIGHT * (1 - (db - MIN_GAIN) / range);
    };

    const yToGain = (y: number) => {
        // Clamp y to canvas bounds
        const clampedY = Math.max(0, Math.min(y, GAIN_CANVAS_HEIGHT));
        const range = MAX_GAIN - MIN_GAIN;
        const db = (1 - clampedY / GAIN_CANVAS_HEIGHT) * range + MIN_GAIN;
        return dbToLinearGain(db);
    };

    const y = gainToY(gainDB);

    // Debug: log gain values
    useEffect(() => {
        console.log('[GainLine] Linear gain:', gain.toFixed(3), '| dB:', gainDB.toFixed(1), '| Y:', y.toFixed(1), '| Range:', MIN_GAIN, 'to', MAX_GAIN);
    }, [gain, gainDB, y]);

    /**
     * Check if mouse is over the line
     */
    const isInBounds = useCallback(
        (_mouseX: number, mouseY: number) => {
            return Math.abs(mouseY - y) <= GAIN_LINE_HEIGHT + 5;
        },
        [y]
    );

    /**
     * Handle drag
     */
    const handleDrag = useCallback(
        (_x: number, mouseY: number) => {
            const newGain = yToGain(mouseY);
            updateGain(newGain);

            // Send to background/offscreen
            chrome.runtime.sendMessage({
                type: 'modifyGain',
                gain: newGain,
            });
        },
        [updateGain]
    );

    /**
     * Setup drag handling
     */
    const {isDragging} = useCanvasDrag({
        onDrag: handleDrag,
        isInBounds,
        canvas: canvasRef.current,
    });

    /**
     * Draw the gain line
     */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, GAIN_CANVAS_WIDTH, GAIN_CANVAS_HEIGHT);

        // Draw line
        ctx.fillStyle = isDragging ? COLORS.filterDotActive : COLORS.gainLine;
        ctx.fillRect(0, y - GAIN_LINE_HEIGHT / 2, GAIN_CANVAS_WIDTH, GAIN_LINE_HEIGHT);

        // Draw gain value
        ctx.fillStyle = COLORS.text;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${gainDB.toFixed(1)} dB`, GAIN_CANVAS_WIDTH / 2, y - GAIN_LINE_HEIGHT);
    }, [y, gainDB, isDragging]);

    return (
        <canvas
            ref={canvasRef}
            width={GAIN_CANVAS_WIDTH}
            height={GAIN_CANVAS_HEIGHT}
            style={{
                backgroundColor: 'transparent',
                position: 'absolute',
                top: 0,
                left: 0,
                cursor: 'ns-resize',
                pointerEvents: 'auto',
            }}
        />
    );
}
