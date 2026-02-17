'use client';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTestStore } from '@/lib/store';
import { PHASES } from '@/lib/data';
import { useMotorSignals } from '@/hooks/useMotorSignals';

export default function QuestionRunner() {
    const {
        currentPhaseIndex,
        currentScenarioIndex,
        globalScenarioIndex,
        submitAnswer,
        nextStep
    } = useTestStore();

    const phase = PHASES[currentPhaseIndex];
    const scenario = phase.scenarios[currentScenarioIndex];

    const { handleHoverStart, handleHoverEnd, captureData, stats } = useMotorSignals();
    const [selected, setSelected] = useState<number | null>(null);

    // Reset local state when scenario changes
    useEffect(() => {
        setSelected(null);
    }, [scenario.id]);

    const handleChoose = (idx: number) => {
        if (selected !== null) return; // Prevent double click

        setSelected(idx);
        const answerData = captureData(idx);
        submitAnswer(answerData);

        // Delay before next step
        setTimeout(() => {
            nextStep();
        }, 600);
    };

    const progress = ((globalScenarioIndex) / 16) * 100;

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
                <div className="font-serif text-[1.3rem] text-ink">
                    TK<span className="text-acc">i</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-[0.72rem] font-semibold text-acc uppercase tracking-[0.12em]">
                        {phase.name}
                    </span>
                    <span className="font-mono text-[0.68rem] text-ink3">
                        {globalScenarioIndex + 1}/16
                    </span>
                </div>
            </div>

            {/* Progress */}
            <div className="h-[2px] background-bg3 rounded-[1px] mb-10 relative bg-bg3">
                <div
                    className="h-full bg-acc rounded-[1px] transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Pressure Timer (if id === 4) */
                scenario.id === 4 && (
                    <div className="h-[1px] bg-bg3 mb-4 rounded-[1px] overflow-hidden">
                        <div className="h-full bg-acc transition-all duration-75 animate-[shrink_15s_linear_forwards] w-full opacity-40" />
                        <style jsx>{`
               @keyframes shrink { from { width: 100%; } to { width: 0%; } }
             `}</style>
                    </div>
                )
            }

            {/* Card */}
            <div className="flex-1 flex flex-col relative max-w-[900px]">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-acc mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-grn animate-pulse" />
                    {scenario.ctx}
                </div>

                <div className="font-serif text-[clamp(1.3rem,2.5vw,1.65rem)] leading-[1.45] mb-7 max-w-[700px]">
                    {scenario.q}
                </div>

                {scenario.sub && (
                    <div className="text-[0.82rem] text-ink3 mb-5 leading-[1.6] italic">
                        {scenario.sub}
                    </div>
                )}

                <div className="flex flex-col gap-[0.6rem] mb-6">
                    {scenario.opts.map((opt, i) => (
                        <button
                            key={i}
                            onMouseEnter={() => handleHoverStart(i)}
                            onMouseLeave={() => handleHoverEnd(i)}
                            onClick={() => handleChoose(i)}
                            className={clsx(
                                "group relative text-left py-[0.9rem] px-[1.15rem] border rounded-lg text-[0.88rem] leading-[1.5] font-sans transition-all duration-150 overflow-hidden",
                                selected === i
                                    ? "border-acc bg-acc/10 text-ink"
                                    : "border-white/5 bg-white/2 text-ink2 hover:border-acc hover:text-ink hover:bg-acc/5"
                            )}
                        >
                            <span className="font-mono text-[0.65rem] text-ink4 mr-2 font-medium group-hover:text-ink transition-colors">
                                {String.fromCharCode(65 + i)}
                            </span>
                            {opt.text}
                        </button>
                    ))}
                </div>
            </div>

            {/* Signal Panel */}
            <div className="mt-auto bg-bg2 border border-white/5 rounded-[10px] p-5">
                <div className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ink4 mb-3 flex items-center justify-between">
                    <span>SIGNAUX EN DIRECT</span>
                    <span className="text-grn flex items-center gap-1.5">
                        <span className="w-[5px] h-[5px] rounded-full bg-grn animate-pulse" />
                        capture active
                    </span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                    <SignalItem label="Temps réaction" value={stats.rt} />
                    <SignalItem label="1er mouvement" value={stats.fm} />
                    <SignalItem label="Corrections" value={stats.hc} />
                    <SignalItem label="Mouvements" value={stats.mv} />
                    <SignalItem label="Zone focalisation" value={stats.dw} />
                </div>
            </div>
        </div>
    );
}

function SignalItem({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="text-center">
            <div className="font-mono text-[0.85rem] font-medium mb-0.5 text-ink4">
                {value}
            </div>
            <div className="text-[0.62rem] text-ink4 leading-[1.3] whitespace-pre-line">
                {label}
            </div>
        </div>
    );
}
