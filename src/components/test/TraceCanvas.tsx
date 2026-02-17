'use client';
import { useEffect, useRef } from 'react';
import { useTestStore } from '@/lib/store';

export default function TraceCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { phase } = useTestStore();
    const lastPos = useRef<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Resize handler
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Drawing handler
        const draw = (e: MouseEvent) => {
            if (phase !== 'scenario' && phase !== 'cognitive') return;

            const x = e.clientX;
            const y = e.clientY;

            if (lastPos.current) {
                ctx.beginPath();
                ctx.strokeStyle = 'rgba(232, 57, 14, 0.35)'; // var(--acc) with opacity
                ctx.lineWidth = 1.2;
                ctx.lineCap = 'round';
                ctx.moveTo(lastPos.current.x, lastPos.current.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            lastPos.current = { x, y };
        };

        window.addEventListener('mousemove', draw);

        // Reset trace on phase change
        const clear = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            lastPos.current = null;
        };

        // Trigger clear when phase changes (monitored by useEffect dependency)
        clear();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', draw);
        };
    }, [phase]); // Dependency on phase to reset canvas

    // Also need to clear canvas when switching scenarios within 'scenario' phase
    // We can subscribe to store changes specifically for scenario index
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            lastPos.current = null;
        }
    }, [useTestStore.getState().currentScenarioIndex, useTestStore.getState().cogQueueIndex]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 opacity-15"
        />
    );
}
