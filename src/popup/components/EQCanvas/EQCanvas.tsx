import {useRef, useEffect, useCallback, useState} from 'react';
import {useEQStore} from '@/store';
import {useFFTData} from '@/popup/hooks/useFFTData';
import {
    frequencyToX,
    gainToY,
    xToFrequency,
    yToGain,
    clampFrequency,
    clampGain,
    clampQ
} from '@/popup/utils/coordinateTransforms';
import {calculateFilterCurve} from '@/popup/utils/filterMath';
import {useCanvasDrag} from './useCanvasDrag';
import {
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
    MAX_FREQUENCY,
    COLORS,
    FILTER_DOT_RADIUS,
    Q_SENSITIVITY,
    SAMPLE_RATE
} from '@/popup/utils/constants';

interface EQCanvasProps {
    width?: number;
    height?: number;
}

function smoothstep(edge0: number, edge1: number, x: number) {
    const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}


export function EQCanvas({
                             width = CANVAS_WIDTH,
                             height = CANVAS_HEIGHT
                         }: EQCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const filters = useEQStore((state) => state.filters.items);
    const updateFilter = useEQStore((state) => state.filters.updateFilter);
    const setActiveFilterIndex = useEQStore((state) => state.ui.setActiveFilterIndex);
    const setIsDragging = useEQStore((state) => state.ui.setIsDragging);
    const activeFilterIndex = useEQStore((state) => state.ui.activeFilterIndex);
    const isVisualizerEnabled = useEQStore((state) => state.ui.isVisualizerEnabled);

    const [draggedDotIndex, setDraggedDotIndex] = useState<number | null>(null);
    const fftData = useFFTData(isVisualizerEnabled);

    // Используем ref'ы для часто меняющихся данных
    const filtersRef = useRef(filters);
    const fftDataRef = useRef(fftData);
    const isVisualizerEnabledRef = useRef(isVisualizerEnabled);
    const activeFilterIndexRef = useRef(activeFilterIndex);
    const draggedDotIndexRef = useRef(draggedDotIndex);

    // Синхронизируем ref'ы
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    useEffect(() => {
        fftDataRef.current = fftData;
    }, [fftData]);

    useEffect(() => {
        isVisualizerEnabledRef.current = isVisualizerEnabled;
    }, [isVisualizerEnabled]);

    useEffect(() => {
        activeFilterIndexRef.current = activeFilterIndex;
    }, [activeFilterIndex]);

    useEffect(() => {
        draggedDotIndexRef.current = draggedDotIndex;
    }, [draggedDotIndex]);

    /**
     * Проверка, находится ли мышь над точкой фильтра
     */
    const isInBounds = useCallback((mouseX: number, mouseY: number) => {
        for (let i = 0; i < filtersRef.current.length; i++) {
            const filter = filtersRef.current[i];
            const x = frequencyToX(filter.frequency, width);
            const y = gainToY(filter.gain, height);
            const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));

            if (distance <= FILTER_DOT_RADIUS + 5) {
                setDraggedDotIndex(i);
                return true;
            }
        }
        return false;
    }, [width, height]);

    /**
     * Обработка начала перетаскивания
     */
    const handleDragStart = useCallback(() => {
        if (draggedDotIndexRef.current !== null) {
            setActiveFilterIndex(draggedDotIndexRef.current);
            setIsDragging(true);
        }
    }, [setActiveFilterIndex, setIsDragging]);

    /**
     * Обработка перетаскивания
     */
    const handleDrag = useCallback((x: number, y: number, _dx: number, dy: number, event: MouseEvent) => {
        if (draggedDotIndexRef.current === null) return;

        const filter = filtersRef.current[draggedDotIndexRef.current];

        if (event.shiftKey) {
            // Изменение Q
            const deltaQ = dy * -Q_SENSITIVITY;
            const newQ = clampQ(filter.q + deltaQ);

            updateFilter(draggedDotIndexRef.current, {q: newQ});

            chrome.runtime.sendMessage({
                type: 'modifyFilter',
                index: draggedDotIndexRef.current,
                frequency: filter.frequency,
                gain: filter.gain,
                q: newQ,
            });
        } else {
            // Изменение частоты и усиления
            const newFreq = clampFrequency(xToFrequency(x, width));
            const newGain = clampGain(yToGain(y, height));

            updateFilter(draggedDotIndexRef.current, {frequency: newFreq, gain: newGain});

            chrome.runtime.sendMessage({
                type: 'modifyFilter',
                index: draggedDotIndexRef.current,
                frequency: newFreq,
                gain: newGain,
                q: filter.q,
            });
        }
    }, [updateFilter, width, height]);

    /**
     * Обработка завершения перетаскивания
     */
    const handleDragEnd = useCallback(() => {
        setActiveFilterIndex(null);
        setIsDragging(false);
        setDraggedDotIndex(null);
    }, [setActiveFilterIndex, setIsDragging]);

    /**
     * Используем существующий хук для перетаскивания
     */
    useCanvasDrag({
        onDragStart: handleDragStart,
        onDrag: handleDrag,
        onDragEnd: handleDragEnd,
        isInBounds,
        canvas: canvasRef.current,
    });

    /**
     * Отрисовка частотной шкалы
     */
    const drawFrequencyScale = useCallback((ctx: CanvasRenderingContext2D) => {
        for (let freq = 5; freq < MAX_FREQUENCY; freq *= 2) {
            const x = frequencyToX(freq, width);

            // Деления по центру
            ctx.strokeStyle = COLORS.grid;
            ctx.globalAlpha = 0.25;
            ctx.beginPath();
            ctx.moveTo(x, height / 2 + 10);
            ctx.lineTo(x, height / 2 - 10);
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Нижняя шкала
            ctx.strokeStyle = COLORS.text;
            ctx.beginPath();
            ctx.moveTo(x, height);
            ctx.lineTo(x, height - 15);
            ctx.stroke();

            // Нижние подписи
            ctx.fillStyle = COLORS.text;
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(freq).toString(), x, height - 18);

            // Верхняя шкала
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 15);
            ctx.stroke();
        }
    }, [width, height]);

    const drawFilterCurves = useCallback((ctx: CanvasRenderingContext2D) => {
        filtersRef.current.forEach((filter) => {
            if (filter.gain === 0) return;

            const points = calculateFilterCurve(
                filter,
                width,
                xToFrequency,
                gainToY,
                height,
                4
            );

            if (points.length < 4) return;

            const color =
                filter.type === 'lowshelf'
                    ? COLORS.lowShelfCurve
                    : filter.type === 'highshelf'
                        ? COLORS.highShelfCurve
                        : COLORS.filterCurve;

            const maxWidth = 2.2;
            const minWidth = 0.4;
            const maxAlpha = 0.9;

            const fadeLength = 0.60; // 15% в начале и конце

            const segmentCount = points.length / 2 - 1;

            for (let s = 0; s < segmentCount; s++) {
                const i = s * 2;

                const x0 = points[i];
                const y0 = points[i + 1];
                const x1 = points[i + 2];
                const y1 = points[i + 3];

                const t = s / segmentCount; // 0..1 вдоль линии
                const edgeT = Math.min(t, 1 - t);

                const fade = smoothstep(0, fadeLength, edgeT);

                ctx.beginPath();
                ctx.strokeStyle = color;
                ctx.globalAlpha = maxAlpha * fade;
                ctx.lineWidth = minWidth + (maxWidth - minWidth) * fade;
                ctx.lineCap = 'round';

                ctx.moveTo(x0, y0);
                ctx.lineTo(x1, y1);
                ctx.stroke();
            }

            ctx.globalAlpha = 1;
        });
    }, [width, height]);


    /**
     * Отрисовка точек фильтров
     */
    const drawFilterDots = useCallback((ctx: CanvasRenderingContext2D) => {
        filtersRef.current.forEach((filter, index) => {
            const x = frequencyToX(filter.frequency, width);
            const y = gainToY(filter.gain, height);

            // Цвет в зависимости от активности
            const isActive = activeFilterIndexRef.current === index || draggedDotIndexRef.current === index;
            const dotColor = isActive ? COLORS.filterDotActive : COLORS.filterDot;

            // Точка
            ctx.fillStyle = dotColor;
            ctx.beginPath();
            ctx.arc(x, y, FILTER_DOT_RADIUS, 0, 2 * Math.PI);
            ctx.fill();

            // Обводка
            ctx.strokeStyle = COLORS.background;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Номер фильтра
            ctx.fillStyle = COLORS.background;
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((index + 1).toString(), x, y);
        });
    }, [width, height]);

    /**
     * Отрисовка FFT визуализатора
     */
    const drawFFTVisualizer = useCallback((ctx: CanvasRenderingContext2D) => {
        if (!isVisualizerEnabledRef.current || fftDataRef.current.length === 0) return;

        const points: { x: number; y: number }[] = [];
        const binFreq = SAMPLE_RATE / (fftDataRef.current.length * 2);

        for (let i = 0; i < fftDataRef.current.length; i++) {
            const freq = i * binFreq;
            if (freq < 10) continue;

            const x = frequencyToX(freq, width);
            if (x > width) break;

            const magnitude = ((fftDataRef.current[i] + 100) / 100) * height;
            const y = height - 1 - magnitude;

            if (points.length === 0) {
                points.push({x, y});
            } else {
                const last = points[points.length - 1];
                if (x - last.x < 2) {
                    if (y > last.y) {
                        last.y = y;
                    }
                } else {
                    points.push({x, y});
                }
            }
        }

        if (points.length === 0) return;

        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, COLORS.fftBar);
        gradient.addColorStop(1, COLORS.background);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();

        points.forEach((p, i) => {
            if (i === 0) {
                ctx.moveTo(p.x, p.y);
            } else {
                ctx.lineTo(p.x, p.y);
            }
        });

        ctx.stroke();
        ctx.globalAlpha = 1;
    }, [width, height]);

    /**
     * Отрисовка сетки и центральной линии
     */
    const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
        // Центральная линия (0 dB)
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }, [width, height]);

    /**
     * Главная функция отрисовки
     */
    const draw = useCallback((ctx: CanvasRenderingContext2D) => {
        // Очистка
        ctx.clearRect(0, 0, width, height);

        // Фон
        ctx.fillStyle = COLORS.background;
        ctx.fillRect(0, 0, width, height);

        // Порядок отрисовки важен!
        drawGrid(ctx);
        drawFrequencyScale(ctx);
        drawFFTVisualizer(ctx);
        drawFilterCurves(ctx);
        drawFilterDots(ctx);
    }, [drawGrid, drawFrequencyScale, drawFFTVisualizer, drawFilterCurves, drawFilterDots, width, height]);

    /**
     * Обработчик двойного клика по точкам
     */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleDoubleClick = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Проверяем клик по любой точке
            filtersRef.current.forEach((filter, index) => {
                const x = frequencyToX(filter.frequency, width);
                const y = gainToY(filter.gain, height);
                const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));

                if (distance <= FILTER_DOT_RADIUS + 5) {
                    chrome.runtime.sendMessage({
                        type: 'resetFilter',
                        index,
                    });
                }
            });
        };

        canvas.addEventListener('dblclick', handleDoubleClick);
        return () => canvas.removeEventListener('dblclick', handleDoubleClick);
    }, [width, height]);

    /**
     * Основной цикл отрисовки
     */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Функция для одного кадра
        const renderFrame = () => {
            draw(ctx);
            requestAnimationFrame(renderFrame);
        };

        // Запускаем анимацию
        const animationId = requestAnimationFrame(renderFrame);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [draw]); // ← Теперь зависит только от draw

    return (
        <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
                backgroundColor: COLORS.background,
                border: '1px solid #A8D8EA',
                display: 'block',
            }}
        />
    );
}
