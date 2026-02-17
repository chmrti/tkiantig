'use client';
import { useState } from 'react';
import { useTestStore } from '@/lib/store';
import { OPEN_QUESTION } from '@/lib/data';
import { Sparkles } from 'lucide-react';

export default function OpenQuestionRunner() {
    const { submitOpenAnswer, nextStep } = useTestStore();
    const [text, setText] = useState('');

    const handleSubmit = () => {
        submitOpenAnswer(text);
        nextStep();
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[800px] mx-auto w-full pt-10">
            <div className="font-serif text-[1.3rem] text-ink mb-10 text-center">
                Dernière étape
            </div>

            <div className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-pur mb-4 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {OPEN_QUESTION.ctx}
            </div>

            <div className="font-serif text-[1.5rem] leading-[1.4] mb-4">
                {OPEN_QUESTION.q}
            </div>

            <div className="flex items-center gap-2 p-3 bg-pur/5 border border-pur/15 rounded-lg mb-6 text-[0.78rem] text-pur">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                {OPEN_QUESTION.sub}
            </div>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={OPEN_QUESTION.placeholder}
                className="w-full min-h-[200px] p-4 bg-bg2 border border-white/5 rounded-lg text-[0.92rem] text-ink font-sans resize-y focus:outline-none focus:border-pur transition-colors placeholder:text-ink4 leading-relaxed"
            />

            <div className="text-right font-mono text-[0.65rem] text-ink4 mt-2 mb-6">
                {text.length} caractères
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={text.length < 10}
                    className="px-8 py-3 bg-pur text-white rounded-lg font-semibold text-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pur/20 disabled:opacity-30 disabled:hover:transform-none disabled:cursor-not-allowed transition-all"
                >
                    Terminer le test
                </button>
            </div>
        </div>
    );
}
