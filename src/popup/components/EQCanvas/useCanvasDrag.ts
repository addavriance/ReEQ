import {useCallback, useEffect, useLayoutEffect, useRef, useState, RefObject} from 'react';

interface DragState {
    isDragging: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
}

interface UseCanvasDragOptions {
    onDragStart?: (x: number, y: number, event: MouseEvent) => void;
    onDrag?: (x: number, y: number, dx: number, dy: number, event: MouseEvent) => void;
    onDragEnd?: (x: number, y: number, event: MouseEvent) => void;
    isInBounds: (x: number, y: number) => boolean;
    canvasRef: RefObject<HTMLCanvasElement | null>;
}

/**
 * Hook for handling drag operations on canvas
 * Provides mouse drag tracking with bounds checking
 */
export function useCanvasDrag({
                                  onDragStart,
                                  onDrag,
                                  onDragEnd,
                                  isInBounds,
                                  canvasRef,
                              }: UseCanvasDragOptions) {
    const [dragState, setDragState] = useState<DragState>({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
    });

    const dragStateRef = useRef(dragState);
    dragStateRef.current = dragState;

    // Track canvas mount state to trigger effect re-runs
    const [canvasMounted, setCanvasMounted] = useState(false);

    // Monitor canvas ref and update mount state after each render
    useLayoutEffect(() => {
        const mounted = canvasRef.current !== null;
        if (mounted !== canvasMounted) {
            setCanvasMounted(mounted);
        }
    });

    /**
     * Get mouse position relative to canvas
     */
    const getMousePos = useCallback(
        (event: MouseEvent): { x: number; y: number } => {
            if (!canvasRef.current) return {x: 0, y: 0};

            const rect = canvasRef.current.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            };
        },
        [canvasRef]
    );

    /**
     * Handle mouse down - start drag
     */
    const handleMouseDown = useCallback(
        (event: MouseEvent) => {
            const pos = getMousePos(event);

            if (isInBounds(pos.x, pos.y)) {
                event.preventDefault();
                setDragState({
                    isDragging: true,
                    startX: pos.x,
                    startY: pos.y,
                    currentX: pos.x,
                    currentY: pos.y,
                });
                onDragStart?.(pos.x, pos.y, event);
            }
        },
        [getMousePos, isInBounds, onDragStart]
    );

    /**
     * Handle mouse move - update drag
     */
    const handleMouseMove = useCallback(
        (event: MouseEvent) => {
            if (!dragStateRef.current.isDragging) return;

            const pos = getMousePos(event);
            const dx = pos.x - dragStateRef.current.currentX;
            const dy = pos.y - dragStateRef.current.currentY;

            setDragState((prev) => ({
                ...prev,
                currentX: pos.x,
                currentY: pos.y,
            }));

            onDrag?.(pos.x, pos.y, dx, dy, event);
        },
        [getMousePos, onDrag]
    );

    /**
     * Handle mouse up - end drag
     */
    const handleMouseUp = useCallback(
        (event: MouseEvent) => {
            if (!dragStateRef.current.isDragging) return;

            const pos = getMousePos(event);
            setDragState((prev) => ({
                ...prev,
                isDragging: false,
            }));

            onDragEnd?.(pos.x, pos.y, event);
        },
        [getMousePos, onDragEnd]
    );

    /**
     * Setup event listeners
     */
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [canvasRef, canvasMounted, handleMouseDown, handleMouseMove, handleMouseUp]);

    return {
        isDragging: dragState.isDragging,
        startX: dragState.startX,
        startY: dragState.startY,
        currentX: dragState.currentX,
        currentY: dragState.currentY,
    };
}
