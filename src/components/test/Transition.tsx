'use client';
import { useEffect } from 'react';
import { useTestStore } from '@/lib/store';
import { PHASES } from '@/lib/data';

export default function Transition() {
    const { currentPhaseIndex, setPhase } = useTestStore();
    const phase = PHASES[currentPhaseIndex];

    useEffect(() => {
        const timer = setTimeout(() => {
            setPhase('scenario');
        }, 2000);
        return () => clearTimeout(timer);
    }, [setPhase]);

    return (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="font-serif text-[4rem] text-acc opacity-30 mb-2">
                {currentPhaseIndex + 1}/4
            </div>
            <h2 className="font-serif text-[1.8rem] font-normal mb-3">
                {phase.name}
            </h2>
            <p className="text-ink3 text-[0.88rem] max-w-[400px] leading-[1.7]">
                {phase.desc}
            </p>
        </div>
    );
}
