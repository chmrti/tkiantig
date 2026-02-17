'use client';
import { useTestStore } from '@/lib/store';
import { DYNAMICS } from '@/lib/data';
import { computeScores } from '@/lib/scoring';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResultPage() {
    const { answers, cogAnswers } = useTestStore();
    const router = useRouter();
    const [scores, setScores] = useState<Record<string, number>>({});

    useEffect(() => {
        if (answers.length === 0) {
            router.replace('/');
            return;
        }

        const calculatedScores = computeScores(answers, cogAnswers);
        setScores(calculatedScores);
    }, [answers, cogAnswers, router]);

    if (answers.length === 0) return null;

    return (
        <div className="max-w-[900px] mx-auto min-h-screen p-8 animate-in fade-in duration-700">
            <div className="text-center mb-10">
                <h2 className="font-serif text-[2rem] font-normal mb-2">Profil Comportemental</h2>
                <p className="text-ink3 text-sm">Basé sur l'analyse de vos micros-choix</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {Object.entries(DYNAMICS).map(([key, def]) => (
                    <div key={key} className="bg-bg2 border border-white/5 rounded-lg p-5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm">{def.name}</span>
                            <span className="font-mono text-sm font-semibold">{scores[key]}%</span>
                        </div>
                        <div className="h-1 bg-bg4 rounded-full mb-3 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{ width: `${scores[key]}%`, backgroundColor: def.color }}
                            />
                        </div>
                        <p className="text-xs text-ink3 leading-relaxed">
                            {scores[key] > 50 ? def.high : def.low}
                        </p>
                    </div>
                ))}
            </div>

            <div className="bg-bg2 border border-white/5 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-sm mb-2">Note Importante</h3>
                <p className="text-ink3 text-xs max-w-[500px] mx-auto leading-relaxed">
                    Ce résultat est une version simplifiée. Dans la version complète, ces scores sont pondérés par
                    l'analyse de vos signaux moteurs (hésitations, vitesse, changements d'avis) qui révèlent la
                    confiance réelle derrière chaque décision.
                </p>
            </div>

            <div className="text-center mt-10">
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2 border border-white/10 rounded-md text-sm text-ink3 hover:text-acc hover:border-acc transition-colors"
                >
                    Imprimer le rapport
                </button>
            </div>
        </div>
    );
}
