import {useEffect, useRef} from 'react';
import {gainToY} from '@/popup/utils/coordinateTransforms';
import {MIN_GAIN, MAX_GAIN, COLORS, GAIN_CANVAS_WIDTH, GAIN_CANVAS_HEIGHT} from '@/popup/utils/constants';

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

        // Clear canvas
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

        // Label
        ctx.fillStyle = COLORS.text;
        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('volume', centerX, gainToY(MAX_GAIN, GAIN_CANVAS_HEIGHT) - 10);

        // Zero line
        ctx.strokeStyle = COLORS.text;
        ctx.beginPath();
        ctx.moveTo(centerX - 5, gainToY(0, GAIN_CANVAS_HEIGHT));
        ctx.lineTo(centerX + 5, gainToY(0, GAIN_CANVAS_HEIGHT));
        ctx.stroke();

        // Gain markers
        for (let db = MIN_GAIN; db <= MAX_GAIN; db += 5) {
            const y = gainToY(db, GAIN_CANVAS_HEIGHT);

            // Tick mark
            ctx.strokeStyle = COLORS.text;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(5, y);
            ctx.stroke();

            // Label (skip if too close to "volume" label at top)
            if (db !== MAX_GAIN || y > 20) {
                ctx.fillStyle = COLORS.text;
                ctx.font = '10px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(db.toString(), 7, y);
            }
        }
    }, []);

    return (
        <canvas
            ref={canvasRef}
            width={GAIN_CANVAS_WIDTH}
            height={GAIN_CANVAS_HEIGHT}
            style={{
                backgroundColor: '#2C3E50',
                borderLeft: '1px solid #A8D8EA',
                borderTop: '1px solid #A8D8EA',
                borderBottom: '1px solid #A8D8EA',
            }}
        />
    );
}
