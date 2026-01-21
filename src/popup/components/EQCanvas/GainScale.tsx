import {useEffect, useRef} from 'react';
import {gainToY} from '@/popup/utils/coordinateTransforms';
import {MIN_GAIN, MAX_GAIN, COLORS, GAIN_CANVAS_WIDTH, GAIN_CANVAS_HEIGHT} from '@/popup/utils/constants';
import {transformCanvasByRatio} from "@/popup/utils/canvas.ts";

/**
 * Gain scale component
 * Draws gain/volume scale on the side
 */
export function GainScale() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        transformCanvasByRatio(canvas, ctx, GAIN_CANVAS_WIDTH, GAIN_CANVAS_HEIGHT, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, GAIN_CANVAS_WIDTH, GAIN_CANVAS_HEIGHT);

        // Gain markers
        for (let db = MIN_GAIN; db <= MAX_GAIN; db += 5) {
            const y = gainToY(db, GAIN_CANVAS_HEIGHT);

            // Tick mark
            ctx.strokeStyle = COLORS.text;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(5, y);
            ctx.stroke();

            ctx.fillStyle = COLORS.text;
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(db.toString(), 7, y);
        }
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={GAIN_CANVAS_WIDTH}
            height={GAIN_CANVAS_HEIGHT}
            style={{
                position: 'absolute',
                backgroundColor: '#2C3E50',
                borderLeft: '1px solid #A8D8EA',
                borderTop: '1px solid #A8D8EA',
                borderBottom: '1px solid #A8D8EA',
            }}
        />
    );
}
