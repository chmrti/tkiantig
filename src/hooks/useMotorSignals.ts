import { useRef, useEffect, useState, useCallback } from 'react';
import { useTestStore } from '@/lib/store';
import { Point, HoverEvent } from '@/lib/types';
import { PHASES } from '@/lib/data';

export function useMotorSignals() {
    const {
        phase,
        currentPhaseIndex,
        currentScenarioIndex,
        answers
    } = useTestStore();

    // Local state for current question signals
    const tStartRef = useRef<number>(0);
    const firstMoveTimeRef = useRef<number | null>(null);
    const lastXRef = useRef<number | null>(null);
    const lastYRef = useRef<number | null>(null);
    const moveStartedRef = useRef<boolean>(false);
    const pathPointsRef = useRef<Point[]>([]);

    // Hover tracking
    const hoverSequenceRef = useRef<HoverEvent[]>([]);
    const optionDwellTimesRef = useRef<number[]>([0, 0, 0, 0]);
    const lastHoveredRef = useRef<number>(-1);
    const lastHoverStartRef = useRef<number>(0);
    const hoverChangesRef = useRef<number>(0);
    const moveCountRef = useRef<number>(0);

    // Stats suitable for display
    const [stats, setStats] = useState({
        rt: '—',
        fm: '—',
        hc: 0,
        mv: 0,
        dw: '—'
    });

    const resetSignals = useCallback(() => {
        tStartRef.current = Date.now();
        firstMoveTimeRef.current = null;
        lastXRef.current = null;
        lastYRef.current = null;
        moveStartedRef.current = false;
        pathPointsRef.current = [];
        hoverSequenceRef.current = [];
        optionDwellTimesRef.current = [0, 0, 0, 0];
        lastHoveredRef.current = -1;
        lastHoverStartRef.current = 0;
        hoverChangesRef.current = 0;
        moveCountRef.current = 0;

        setStats({
            rt: '—',
            fm: '—',
            hc: 0,
            mv: 0,
            dw: '—'
        });
    }, []);

    // Reset when scenario changes
    useEffect(() => {
        if (phase === 'scenario' || phase === 'cognitive') {
            resetSignals();
        }
    }, [phase, currentPhaseIndex, currentScenarioIndex, resetSignals]);

    // Mouse move handler
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (phase !== 'scenario' && phase !== 'cognitive') return;

        const now = Date.now();
        const x = e.clientX;
        const y = e.clientY;

        moveCountRef.current++;

        if (!moveStartedRef.current) {
            moveStartedRef.current = true;
            firstMoveTimeRef.current = now - tStartRef.current;
        }

        // Path complexity calc can be done here or post-hoc
        pathPointsRef.current.push({ x, y, t: now - tStartRef.current });
        lastXRef.current = x;
        lastYRef.current = y;

        // Update stats for UI (throttled ideally, but React batching helps)
        const elapsed = ((now - tStartRef.current) / 1000).toFixed(1);

        // Find max dwell
        let maxDwellIndex = -1;
        let maxDwellVal = 0;
        optionDwellTimesRef.current.forEach((val, idx) => {
            // Add current hover if active
            let currentVal = val;
            if (lastHoveredRef.current === idx) {
                currentVal += (now - lastHoverStartRef.current);
            }
            if (currentVal > maxDwellVal) {
                maxDwellVal = currentVal;
                maxDwellIndex = idx;
            }
        });

        setStats(prev => ({
            ...prev,
            rt: elapsed + 's',
            fm: firstMoveTimeRef.current ? firstMoveTimeRef.current + 'ms' : '—',
            mv: moveCountRef.current,
            dw: maxDwellIndex >= 0 ? String.fromCharCode(65 + maxDwellIndex) : '—'
        }));

    }, [phase]);

    // Attach global listener
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    // Hover handlers
    const handleHoverStart = (idx: number) => {
        const now = Date.now();

        // End previous hover
        if (lastHoveredRef.current >= 0 && lastHoverStartRef.current > 0) {
            optionDwellTimesRef.current[lastHoveredRef.current] += now - lastHoverStartRef.current;
        }

        if (lastHoveredRef.current !== -1 && lastHoveredRef.current !== idx) {
            hoverChangesRef.current++;
            setStats(s => ({ ...s, hc: hoverChangesRef.current }));
        }

        hoverSequenceRef.current.push({ opt: idx, t: now - tStartRef.current });
        lastHoveredRef.current = idx;
        lastHoverStartRef.current = now;
    };

    const handleHoverEnd = (idx: number) => {
        if (lastHoveredRef.current === idx && lastHoverStartRef.current > 0) {
            optionDwellTimesRef.current[idx] += Date.now() - lastHoverStartRef.current;
            lastHoverStartRef.current = 0;
        }
    };

    // Capture final data
    const captureData = (choiceIndex: number) => {
        const now = Date.now();
        const elapsed = (now - tStartRef.current) / 1000;

        // End final hover
        if (lastHoveredRef.current >= 0 && lastHoverStartRef.current > 0) {
            optionDwellTimesRef.current[lastHoveredRef.current] += now - lastHoverStartRef.current;
        }

        // Path complexity
        let dirChanges = 0;
        const points = pathPointsRef.current;
        for (let i = 2; i < points.length; i++) {
            const dx1 = points[i - 1].x - points[i - 2].x;
            const dy1 = points[i - 1].y - points[i - 2].y;
            const dx2 = points[i].x - points[i - 1].x;
            const dy2 = points[i].y - points[i - 1].y;
            const cross = dx1 * dy2 - dy1 * dx2;
            if (Math.abs(cross) > 500) dirChanges++;
        }

        const uniqueHovers = new Set(hoverSequenceRef.current.map(h => h.opt)).size;
        const currentPhase = PHASES[currentPhaseIndex];
        const scenarioId = currentPhase ? currentPhase.scenarios[currentScenarioIndex].id : 0;
        const tags = currentPhase ? currentPhase.scenarios[currentScenarioIndex].opts[choiceIndex].tags : {};

        return {
            scenarioId,
            choice: choiceIndex,
            tags,
            time: elapsed,
            firstMove: firstMoveTimeRef.current || 0,
            hoverChanges: hoverChangesRef.current,
            moveCount: moveCountRef.current,
            pathComplexity: dirChanges,
            uniqueHovers,
            hoverSequence: [...hoverSequenceRef.current],
            optionDwellTimes: [...optionDwellTimesRef.current],
            pathPoints: points.length // storing length only for now
        };
    };

    return {
        handleHoverStart,
        handleHoverEnd,
        captureData,
        stats,
        currentPath: pathPointsRef // Exposing ref directly might be tricky for canvas, usually canvas listens to mousemove itself or we calculate path from ref?
        // Actually, for the canvas overlay, it's better if it tracks its own state or we share the event listener. 
        // We already have handleMouseMove updating 'pathPointsRef'.
    };
}
