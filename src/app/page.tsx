'use client';
import { useTestStore } from '@/lib/store';
import Intro from '@/components/test/Intro';
import Transition from '@/components/test/Transition';
import QuestionRunner from '@/components/test/QuestionRunner';
import CognitiveRunner from '@/components/test/CognitiveRunner';
import OpenQuestionRunner from '@/components/test/OpenQuestionRunner';
import TraceCanvas from '@/components/test/TraceCanvas';

export default function TestPage() {
    const phase = useTestStore((s) => s.phase);

    return (
        <>
            <TraceCanvas />
            <main className="max-w-[900px] mx-auto min-h-screen p-8 flex flex-col relative z-10">
                {phase === 'intro' && <Intro />}
                {phase === 'transition' && <Transition />}
                {phase === 'scenario' && <QuestionRunner />}
                {phase === 'cognitive' && <CognitiveRunner />}
                {phase === 'openq' && <OpenQuestionRunner />}
            </main>
        </>
    );
}
