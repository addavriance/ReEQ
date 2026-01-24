import {useEffect, useRef, useCallback, useState} from 'react';
import {useCanvasDrag} from './useCanvasDrag';
import {linearGainToDB, dbToLinearGain} from '@/popup/utils/filterMath';
import {
    COLORS,
    GAIN_CANVAS_WIDTH,
    GAIN_CANVAS_HEIGHT,
    GAIN_LINE_HEIGHT,
    MIN_GAIN,
    MAX_GAIN, GAIN_LIMIT
} from '@/popup/utils/constants';
import {useEQStore} from '@/store';
import {transformCanvasByRatio} from "@/popup/utils/canvas.ts";
import {clamp, gainToY, yToGain} from "@/popup/utils/coordinateTransforms.ts";

/**
 * GainLine component
 * Draggable line for adjusting overall volume/gain
 */
export function GainLine() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gain = useEQStore((state) => state.gain.value);
    const updateGain = useEQStore((state) => state.gain.updateGain);
    const [isDragging, setIsDragging] = useState(false);

    // Convert linear gain to dB for display
    const gainDB = linearGainToDB(gain);

    const yToLimitedGain = (y: number) => dbToLinearGain(
        clamp(
            yToGain(y, GAIN_CANVAS_HEIGHT),
            MIN_GAIN,
            GAIN_LIMIT
        )
    );

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
            const newGain = yToLimitedGain(mouseY);
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
    useCanvasDrag({
        onDragStart: () => setIsDragging(true),
        onDrag: handleDrag,
        onDragEnd: () => setIsDragging(false),
        isInBounds,
        canvasRef,
    });

    /**
     * Draw the gain line
     */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.style.cursor = isDragging ? 'ns-resize' : 'initial';

        const ctx = canvas.getContext('2d');
        if (!ctx) return

        const gainValueOffset = y < 50 ? 20 : 0;

        const dpr = window.devicePixelRatio || 1;
        transformCanvasByRatio(canvas, ctx, GAIN_CANVAS_WIDTH, GAIN_CANVAS_HEIGHT, dpr);

        ctx.clearRect(0, 0, GAIN_CANVAS_WIDTH, GAIN_CANVAS_HEIGHT);

        const centerX = GAIN_CANVAS_WIDTH / 2;

        // Vertical line
        ctx.strokeStyle = COLORS.text;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(centerX, gainToY(MIN_GAIN, GAIN_CANVAS_HEIGHT));
        ctx.lineTo(centerX, gainToY(MAX_GAIN, GAIN_CANVAS_HEIGHT));
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Zero line
        ctx.strokeStyle = COLORS.text;
        ctx.beginPath();
        ctx.moveTo(centerX - 5, gainToY(0, GAIN_CANVAS_HEIGHT));
        ctx.lineTo(centerX + 5, gainToY(0, GAIN_CANVAS_HEIGHT));
        ctx.stroke();

        ctx.fillStyle = isDragging ? COLORS.filterDotActive : COLORS.gainLine;
        ctx.fillRect(0, y - GAIN_LINE_HEIGHT / 2, GAIN_CANVAS_WIDTH, GAIN_LINE_HEIGHT);

        ctx.fillStyle = COLORS.text;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${gainDB.toFixed(1)} dB`, GAIN_CANVAS_WIDTH / 2, y - GAIN_LINE_HEIGHT + gainValueOffset);
    }, [y, gainDB, isDragging]);

    return (
        <canvas
            ref={canvasRef}
            width={GAIN_CANVAS_WIDTH}
            height={GAIN_CANVAS_HEIGHT}
            style={{
                backgroundColor: 'transparent',
                pointerEvents: 'auto',
                borderLeft: '1px solid #A8D8EA',
                borderTop: '1px solid #A8D8EA',
                borderBottom: '1px solid #A8D8EA',
            }}
        />
    );
}
