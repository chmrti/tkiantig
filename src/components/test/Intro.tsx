'use client';
import { useTestStore } from '@/lib/store';

export default function Intro() {
    const startTest = useTestStore((s) => s.startTest);

    return (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-8 animate-in fade-in duration-700">
            <div className="font-mono text-[0.65rem] text-ink4 mb-8 tracking-[0.12em]">
                TEST COMPORTEMENTAL
            </div>
            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-normal mb-6 leading-[1.2]">
                On ne regarde pas<br />
                ce que tu choisis.<br />
                On regarde <em className="text-acc not-italic">comment<br />tu choisis.</em>
            </h1>
            <p className="text-ink2 max-w-[500px] leading-[1.85] font-light mb-3 text-[0.95rem]">
                16 scénarios professionnels. 8 questions de raisonnement. 1 question ouverte analysée par IA. ~15 minutes.
            </p>
            <p className="text-ink2 max-w-[500px] leading-[1.85] font-light mb-3 text-[0.95rem]">
                Pendant que vous répondez, TKi capture vos micro-signaux moteurs — trajectoire de souris, temps de réaction, hésitations, corrections — pour construire votre profil comportemental et cognitif.
            </p>
            <p className="text-ink2 max-w-[500px] leading-[1.85] font-light mb-8 text-[0.95rem]">
                <strong className="text-ink font-medium">Il n'y a pas de bonne ou mauvaise réponse.</strong> Chaque choix révèle un style — et chaque style a sa valeur.
            </p>
            <button
                onClick={startTest}
                className="mt-8 px-10 py-3.5 bg-acc text-white rounded-lg text-base font-semibold font-sans hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(232,57,14,0.3)] transition-all duration-200"
            >
                Commencer le test →
            </button>
            <div className="font-mono text-[0.68rem] text-ink4 mt-6">
                25 questions · 8 dimensions comportementales · Score cognitif · Analyse IA · ~4000 micro-événements · 0 donnée envoyée
            </div>
        </div>
    );
}
