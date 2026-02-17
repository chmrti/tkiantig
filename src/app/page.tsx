'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SimulationState {
    step: number;
    movements: number;
    reactionTime: string;
    reactionClass: string;
    hesitations: string;
    hesColor: string;
    corrections: string;
    corrColor: string;
    firstMove: string;
    fmColor: string;
    result: any;
    currentScenario: any;
}

export default function LandingPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Canvas refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const swRef = useRef<HTMLDivElement>(null);

    // Sim state
    const [simState, setSimState] = useState<SimulationState>({
        step: 0,
        movements: 0,
        reactionTime: '—',
        reactionClass: 'mid',
        hesitations: '—',
        hesColor: 'rgba(255,255,255,.3)',
        corrections: '—',
        corrColor: 'rgba(255,255,255,.3)',
        firstMove: '—',
        fmColor: 'rgba(255,255,255,.3)',
        result: null,
        currentScenario: null
    });

    const handleSubscribe = async () => {
        if (!email || !email.includes('@')) return;
        setStatus('loading');
        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (e) {
            setStatus('error');
        }
    };

    // Canvas Logic
    useEffect(() => {
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) } });
        }, { threshold: 0.1 });
        document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

        // Canvas init
        const canvas = canvasRef.current;
        const sw = swRef.current;
        if (!canvas || !sw) return;

        canvas.width = sw.offsetWidth;
        canvas.height = sw.offsetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.strokeStyle = 'rgba(232,57,14,0.25)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';

        let lastX: number | null = null;
        let lastY: number | null = null;
        let tStart: number = Date.now();
        let mvStarted = false;
        let mvCnt = 0;
        let fmTime: number | null = null;
        let lastHov = -1;
        let hes = 0;
        let corr = 0;

        // Scenario data
        const scenarios = [
            { ctx: "URGENCE — PRESSION TEMPORELLE", q: "17h50, vendredi. Un client stratégique signale un bug critique. Votre manager est injoignable. L'équipe tech dit 4h de travail. Le client menace de résilier lundi.", opts: ["Appeler le client pour négocier un délai", "Commencer le fix vous-même immédiatement", "Escalader — trouver un décisionnaire coûte que coûte", "Documenter et préparer un plan béton pour lundi 8h"] },
            { ctx: "INTERRUPTION — LES RÈGLES CHANGENT", q: "Vous aviez commencé à agir quand le client rappelle : fausse alerte sur le bug. Il veut renégocier le contrat lundi. Manager toujours injoignable.", opts: ["Accepter et préparer des arguments ce soir", "Demander ce qu'il veut renégocier exactement", "Reporter à lundi quand le manager sera là", "Proposer un call ce week-end pour cadrer"] },
            { ctx: "FRICTION SOCIALE", q: "Lundi en réunion, votre collègue Marc présente votre travail du week-end comme le sien. Le manager le félicite. Marc : « Belle équipe, non ? »", opts: ["Sourire — le résultat compte plus que le crédit", "Corriger calmement : « C'est moi qui ai géré vendredi »", "Ne rien dire, clarifier en privé après", "« Oui, bel effort d'équipe » avec un ton ambigu"] },
            { ctx: "AMBIGUÏTÉ — CONSIGNES FLOUES", q: "Nouveau projet. Le brief tient en une phrase : « Fais quelque chose d'innovant pour le client X. » Deadline : 2 semaines. Pas d'autre directive.", opts: ["Demander un brief plus détaillé avant de commencer", "Foncer avec une première proposition rapide", "Analyser ce que le client X a déjà reçu avant", "Proposer 3 pistes différentes pour faire choisir"] },
            { ctx: "DÉCISION ÉTHIQUE", q: "Vous découvrez qu'un collègue apprécié falsifie légèrement ses notes de frais (petits montants). Personne d'autre ne semble le savoir.", opts: ["En parler directement au collègue en privé", "Signaler à votre manager — c'est une faute", "Ne rien faire — c'est pas votre problème", "Vérifier d'abord si c'est vraiment intentionnel"] }
        ];

        let cur = 0;
        let answers: any[] = [];

        const renderSim = () => {
            if (cur >= scenarios.length) {
                showRes();
                return;
            }
            const s = scenarios[cur];

            // Reset state for new step
            tStart = Date.now();
            fmTime = null;
            hes = 0;
            corr = 0;
            lastHov = -1;
            mvCnt = 0;
            mvStarted = false;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            lastX = null;
            lastY = null;
            ctx.beginPath(); // Reset path

            // Update React state
            setSimState(prev => ({
                ...prev,
                step: cur + 1,
                movements: 0,
                reactionTime: '—',
                reactionClass: 'mid',
                hesitations: '—',
                hesColor: 'rgba(255,255,255,.3)',
                corrections: '—',
                corrColor: 'rgba(255,255,255,.3)',
                firstMove: '—',
                fmColor: 'rgba(255,255,255,.3)',
                currentScenario: s
            }));
        };

        const showRes = () => {
            const avgT = (answers.reduce((s, a) => s + a.t, 0) / answers.length).toFixed(1);
            const avgFM = Math.round(answers.reduce((s, a) => s + (a.fm || 800), 0) / answers.length);
            const totCorr = answers.reduce((s, a) => s + a.corr, 0);
            const totMov = answers.reduce((s, a) => s + a.mv, 0);

            const style = parseFloat(avgT) < 5 ? "Décisionnaire rapide" : parseFloat(avgT) < 10 ? "Réfléchi calibré" : "Analyste approfondi";
            const impulse = avgFM < 400 ? "Instinct dominant" : avgFM < 900 ? "Équilibré" : "Analytique";
            const ambiv = totCorr > 6 ? "Haute ambivalence" : totCorr > 2 ? "Modérée" : "Conviction forte";
            const adapt = answers[1] && answers[1].t < answers[0].t ? "Adaptabilité rapide" : "Ancrage au cadre";
            const amb = answers[3] ? (answers[3].ch === 0 ? "Besoin de cadre" : answers[3].ch === 1 ? "Tolérance haute" : "Structureur") : "—";

            setSimState(prev => ({
                ...prev,
                result: { avgT, avgFM, totCorr, totMov, style, impulse, ambiv, adapt, amb }
            }));
        };

        // Initial render
        renderSim();

        // Canvas tracking
        const handleMouseMove = (e: MouseEvent) => {
            if (cur >= scenarios.length) return; // Stop tracking if finished

            const rect = sw.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            mvCnt++;

            if (!mvStarted) {
                mvStarted = true;
                fmTime = Date.now() - tStart;
                setSimState(prev => ({
                    ...prev,
                    firstMove: fmTime + 'ms',
                    fmColor: (fmTime! < 400 ? '#34d399' : fmTime! < 1200 ? '#fbbf24' : '#e8390e')
                }));
            }

            if (lastX !== null && lastY !== null) {
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            lastX = x;
            lastY = y;

            setSimState(prev => ({ ...prev, movements: mvCnt }));
        };

        sw.addEventListener('mousemove', handleMouseMove);

        // Expose functions for iteration
        (window as any).tkiSimNext = (idx: number) => {
            const elapsed = parseFloat(((Date.now() - tStart) / 1000).toFixed(1));

            answers.push({ sc: cur, ch: idx, t: elapsed, fm: fmTime, hes, corr, mv: mvCnt });

            setSimState(prev => ({
                ...prev,
                reactionTime: elapsed + 's',
                reactionClass: (elapsed < 4 ? 'fast' : elapsed < 10 ? 'mid' : 'slow')
            }));

            setTimeout(() => {
                cur++;
                renderSim();
            }, 700);
        };

        (window as any).tkiSimHover = (idx: number) => {
            if (lastHov !== -1 && lastHov !== idx) {
                corr++;
                setSimState(prev => ({
                    ...prev,
                    corrections: corr.toString(),
                    corrColor: corr > 2 ? '#e8390e' : corr > 0 ? '#fbbf24' : '#34d399'
                }));
            }
            if (lastHov === idx) {
                hes++;
                setSimState(prev => ({
                    ...prev,
                    hesitations: hes.toString(),
                    hesColor: hes > 3 ? '#e8390e' : hes > 1 ? '#fbbf24' : '#34d399'
                }));
            }
            lastHov = idx;
        };

        return () => {
            sw.removeEventListener('mousemove', handleMouseMove);
            (window as any).tkiSimNext = undefined;
            (window as any).tkiSimHover = undefined;
        };
    }, []);

    // ... Helper to render current scenario ...
    const CurrentScenario = () => {
        if (!simState.currentScenario || simState.result) return null;

        return (
            <>
                <div className="swctx">{simState.currentScenario.ctx}</div>
                <div className="swq">{simState.currentScenario.q}</div>
                <div className="swopts">
                    {simState.currentScenario.opts.map((o: string, i: number) => (
                        <button
                            key={i}
                            className="swopt"
                            onMouseEnter={() => (window as any).tkiSimHover?.(i)}
                            onClick={(e) => {
                                (e.target as HTMLElement).classList.add('ch');
                                (window as any).tkiSimNext?.(i);
                            }}
                        >
                            {o}
                        </button>
                    ))}
                </div>
                <div className="swft"><span>trace de souris visible ↑</span><span>{simState.step}/5</span></div>
            </>
        );
    };

    const ResultView = () => {
        if (!simState.result) return null;
        const r = simState.result;
        return (
            <div className="swres">
                <h3>Votre profil comportemental</h3>
                <div className="sigbdg">{r.style}</div>
                <div className="resg">
                    <div className="ri"><div className="rl">Temps moyen</div><div className="rv">{r.avgT}s</div></div>
                    <div className="ri"><div className="rl">1er mouvement</div><div className="rv">{r.avgFM}ms → {r.impulse}</div></div>
                    <div className="ri"><div className="rl">Corrections</div><div className="rv">{r.totCorr} → {r.ambiv}</div></div>
                    <div className="ri"><div className="rl">Adaptation (Q1→Q2)</div><div className="rv">{r.adapt}</div></div>
                    <div className="ri"><div className="rl">Face à l'ambiguïté</div><div className="rv">{r.amb}</div></div>
                    <div className="ri"><div className="rl">Mouvements captés</div><div className="rv">{r.totMov}</div></div>
                </div>
                <p>5 scénarios · {r.totMov} mouvements souris · Le test complet : 6 scénarios adaptatifs, 12 dimensions, ~4000 micro-événements.</p>
                <div className="text-center mt-4">
                    <Link href="/test" className="btn bd" style={{ display: 'inline-flex', fontSize: '.82rem', padding: '.6rem 1.4rem' }}>
                        Obtenir mon profil complet →
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <>
            <style jsx global>{`
                :root{--bg:#fafaf8;--white:#fff;--ink:#0f0f0f;--ink-2:#333;--ink-l:#666;--ink-f:#aaa;--bdr:#e5e5e0;--acc:#e8390e;--acc-s:rgba(232,57,14,.06);--dk:#0a0a0c;--dk2:#141416;--dk3:#1e1e22;--grn:#34d399;--ylw:#fbbf24}
                body { background: var(--bg); color: var(--ink); font-family: var(--font-outfit), sans-serif; }
                h1, h2, h3, .logo, .spb-num, .swq, .ent h2, .cta h2, footer .fl { font-family: var(--font-instrument-serif), serif; }
                .mono, .sws, .swctx, .swft, .spt, .sv, .ex { font-family: var(--font-jetbrains-mono), monospace; }
                
                .btn { display:inline-flex;align-items:center;gap:.35rem;padding:.7rem 1.6rem;border-radius:6px;font-size:.88rem;font-weight:500;text-decoration:none;border:none;cursor:pointer;transition:all .15s; }
                .bd { background:var(--ink);color:#fff; } .bd:hover { background:var(--acc); }
                .bg { background:transparent;color:var(--ink);border:1.5px solid var(--bdr); } .bg:hover { border-color:var(--ink); }
                
                nav { position:fixed;top:0;width:100%;z-index:100;background:rgba(250,250,248,.92);backdrop-filter:blur(24px);border-bottom:1px solid var(--bdr); }
                .ni { max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 2rem; }
                .logo { font-size:1.4rem;text-decoration:none;color:var(--ink); } .logo span { color:var(--acc); }
                .nr { display:flex;align-items:center;gap:2rem;list-style:none; }
                .nr a { font-size:.82rem;font-weight:500;color:var(--ink-l);text-decoration:none; } .nr a:hover { color:var(--ink); }
                .nc { background:var(--ink)!important;color:#fff!important;padding:.45rem 1.2rem;border-radius:6px;font-size:.8rem!important;transition:background .15s; } .nc:hover { background:var(--acc)!important; }
                
                .hero { max-width:760px;margin:0 auto;padding:8.5rem 2rem 4.5rem; }
                .hero h1 { font-size:clamp(2.4rem,4.8vw,3.3rem);line-height:1.15;letter-spacing:-.025em;font-weight:400;margin-bottom:2rem; }
                .hero h1 em { font-style:italic; }
                .hero .lead { font-size:1.05rem;line-height:1.9;color:var(--ink-l);font-weight:300;margin-bottom:2.5rem;max-width:600px; }
                
                .spb { border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr);padding:1.5rem 2rem;text-align:center; }
                .spb-inner { max-width:800px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:2.5rem;flex-wrap:wrap; }
                .spb-item { display:flex;align-items:center;gap:.5rem; }
                .spb-num { font-size:1.5rem;color:var(--acc); }
                .spb-label { font-size:.78rem;color:var(--ink-f);font-weight:400;text-align:left;line-height:1.3; }
                
                .fade-in { opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease; }
                .fade-in.visible { opacity:1;transform:none; }

                .dead { background:var(--dk);color:#fff;padding:5rem 2rem; }
                .di { max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center; }
                .dead h2 { font-size:2rem;font-weight:400;line-height:1.25;margin-bottom:1.25rem; }
                .dead h2 em { font-style:italic;color:var(--acc); }
                .dead p { color:rgba(255,255,255,.5);line-height:1.85;font-weight:300;font-size:.92rem;margin-bottom:.75rem; }
                .dead p strong { color:rgba(255,255,255,.85);font-weight:500; }
                .dl { list-style:none;display:flex;flex-direction:column;gap:.6rem; }
                .dl li { display:flex;align-items:center;gap:.6rem;padding:.75rem 1.1rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:8px;font-size:.85rem; }
                .dl .s { text-decoration:line-through;color:rgba(255,255,255,.25);flex:1; } .dl .t { font-size:.65rem;padding:.15rem .5rem;border-radius:3px;background:rgba(232,57,14,.12);color:var(--acc);white-space:nowrap; }
                .dl .alive { border-color:rgba(232,57,14,.25);background:rgba(232,57,14,.04); } .dl .alive .s { text-decoration:none;color:#fff;font-weight:500; } .dl .alive .t { background:rgba(52,211,153,.12);color:var(--grn); }

                .insight { max-width:760px;margin:0 auto;padding:5rem 2rem;text-align:center; }
                .insight blockquote { font-size:clamp(1.6rem,3vw,2.2rem);line-height:1.35;font-weight:400;margin-bottom:1.5rem;font-style:italic; }
                .insight blockquote span { color:var(--acc); }
                .insight p { color:var(--ink-l);line-height:1.85;font-weight:300;max-width:560px;margin:0 auto 1rem; }
                .insight p strong { color:var(--ink);font-weight:500; }

                .sigs { max-width:760px;margin:0 auto;padding:2rem 2rem 5rem; }
                .sigs h2 { font-size:2rem;font-weight:400;margin-bottom:2rem; }
                .sg { display:grid;grid-template-columns:1fr 1fr;gap:1rem; }
                .sc { padding:1.5rem;border:1px solid var(--bdr);border-radius:10px;background:var(--white);transition:all .2s; }
                .sc:hover { border-color:var(--acc);transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,0,0,.04); }
                .sc h4 { font-size:.88rem;font-weight:600;margin-bottom:.35rem;display:flex;align-items:center;gap:.5rem; }
                .sc h4 .ico { font-size:.7rem;width:22px;height:22px;border-radius:5px;background:var(--acc-s);color:var(--acc);display:flex;align-items:center;justify-content:center; }
                .sc p { font-size:.8rem;color:var(--ink-l);line-height:1.6;font-weight:300; }
                .sc .ex { margin-top:.5rem;font-size:.68rem;color:var(--ink-f);background:var(--bg);padding:.35rem .6rem;border-radius:4px;display:inline-block; }

                .dms { background:var(--white);border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr);padding:5rem 2rem; }
                .dmi { max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr 1.15fr;gap:4rem;align-items:start; }
                .dmi h2 { font-size:1.85rem;font-weight:400;margin-bottom:1rem;line-height:1.25; }
                .dmi>div>p { color:var(--ink-l);line-height:1.8;font-weight:300;font-size:.9rem;margin-bottom:.75rem; }

                .sw { background:var(--dk);border-radius:14px;overflow:hidden;color:#fff;box-shadow:0 30px 80px rgba(0,0,0,.15);position:relative; }
                .swh { padding:.85rem 1.25rem;border-bottom:1px solid rgba(255,255,255,.06);display:flex;justify-content:space-between;align-items:center;font-size:.78rem; }
                .swt { font-weight:600;display:flex;align-items:center;gap:.4rem; }
                .dot { width:6px;height:6px;border-radius:50%;background:var(--grn);animation:bl 2s infinite; }
                @keyframes bl{0%,100%{opacity:1}50%{opacity:.3}}
                .sws { color:rgba(255,255,255,.3);font-size:.68rem; }
                .swpb { height:2px;background:rgba(255,255,255,.04); } .swpf { height:100%;background:var(--acc);transition:width .5s; }
                .swbd { padding:2rem 1.5rem;min-height:380px;display:flex;flex-direction:column;justify-content:center; }
                .swctx { font-size:.68rem;color:rgba(255,255,255,.25);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.85rem; }
                .swq { font-size:1.15rem;line-height:1.45;margin-bottom:1.25rem; }
                .swopts { display:flex;flex-direction:column;gap:.5rem; }
                .swopt { padding:.75rem 1rem;border:1px solid rgba(255,255,255,.08);border-radius:7px;font-size:.82rem;cursor:pointer;transition:all .12s;background:transparent;color:rgba(255,255,255,.65);text-align:left;font-family:var(--font-outfit),sans-serif; }
                .swopt:hover { border-color:var(--acc);color:#fff;background:rgba(232,57,14,.06); }
                .swopt.ch { border-color:var(--acc);background:rgba(232,57,14,.1);color:#fff; }
                .swft { margin-top:1rem;display:flex;justify-content:space-between;font-size:.65rem;color:rgba(255,255,255,.18); }
                #mouseCanvas { position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:5; }
                
                .sp { margin-top:1rem;background:var(--dk2);border-radius:8px;padding:1rem 1.25rem;border:1px solid rgba(255,255,255,.04); }
                .spt { font-size:.62rem;text-transform:uppercase;letter-spacing:.15em;color:rgba(255,255,255,.2);margin-bottom:.6rem; }
                .sr { display:flex;align-items:center;justify-content:space-between;margin-bottom:.35rem; }
                .sr .sl { font-size:.72rem;color:rgba(255,255,255,.4); }
                .sr .sv { font-size:.72rem;font-weight:500; }
                .sv.fast { color:var(--grn); } .sv.mid { color:var(--ylw); } .sv.slow { color:var(--acc); }

                .swres { text-align:center;padding:.5rem 0; }
                .swres h3 { font-size:1.35rem;margin-bottom:.5rem; }
                .sigbdg { display:inline-block;padding:.35rem 1rem;background:rgba(232,57,14,.12);border:1px solid rgba(232,57,14,.25);border-radius:100px;color:var(--acc);font-weight:600;font-size:.82rem;margin-bottom:1rem; }
                .swres p { color:rgba(255,255,255,.45);font-size:.82rem;line-height:1.6;margin-bottom:1rem; }
                .resg { display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:1.25rem;text-align:left; }
                .ri { background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:6px;padding:.55rem .75rem; }
                .ri .rl { font-size:.65rem;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:.15rem;font-family:var(--font-jetbrains-mono); }
                .ri .rv { font-size:.82rem;font-weight:500; }

                .comp { max-width:760px;margin:0 auto;padding:5rem 2rem; }
                .comp h2 { font-size:2rem;font-weight:400;margin-bottom:2rem; }
                .ctbl { width:100%;border-collapse:collapse; }
                .ctbl th,.ctbl td { padding:.75rem 1rem;text-align:left;font-size:.82rem;border-bottom:1px solid var(--bdr); }
                .ctbl th { font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;color:var(--ink-f);font-weight:600; }
                .ctbl td:first-child { font-weight:600;color:var(--ink-l); }
                .ctbl td:last-child { font-weight:600;color:var(--acc); }
                .ctbl tr:last-child td { border-bottom:none; }
                .tki-col { background:var(--acc-s);border-radius:8px; }

                .af { max-width:760px;margin:0 auto;padding:4rem 2rem 5rem;text-align:center; }
                .af h2 { font-size:2rem;font-weight:400;margin-bottom:1rem; }
                .af>p { color:var(--ink-l);font-weight:300;max-width:520px;margin:0 auto 2.5rem;line-height:1.7; }
                
                .sci { background:var(--white);border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr);padding:4rem 2rem; }
                .scii { max-width:760px;margin:0 auto; }
                .sci h2 { font-size:1.8rem;font-weight:400;margin-bottom:2rem; }
                .ref { padding:1rem;border:1px solid var(--bdr);border-radius:8px;margin-bottom:.75rem;background:var(--bg); }
                .ref-title { font-size:.85rem;font-weight:600;margin-bottom:.25rem; }
                .ref-meta { font-size:.72rem;color:var(--ink-f);line-height:1.5; }

                .ent { background:var(--dk);color:#fff;padding:5rem 2rem; }
                .enti { max-width:1080px;margin:0 auto; }
                .ent h2 { font-size:2rem;font-weight:400;margin-bottom:.75rem; }
                .ent>div>p { color:rgba(255,255,255,.4);max-width:540px;line-height:1.7;font-weight:300;margin-bottom:2.5rem; }
                .ehow { display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;margin-bottom:3rem; }
                .ehc { background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;text-align:center; }
                .ehc .ehn { font-family:var(--font-instrument-serif);font-size:2.5rem;color:rgba(255,255,255,.1);margin-bottom:.5rem; }
                .ehc h4 { font-size:.92rem;font-weight:600;margin-bottom:.35rem; }
                .ehc p { font-size:.78rem;color:rgba(255,255,255,.4);line-height:1.6; }
                .eg { display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem; }
                .ec { background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:1.75rem; }
                .ec h4 { font-size:.88rem;font-weight:600;margin-bottom:.35rem; }
                .ec .ep { font-family:var(--font-instrument-serif);font-size:1.8rem;margin:.75rem 0 .35rem; }
                .ec .ep span { font-size:.82rem;font-family:var(--font-outfit),sans-serif;opacity:.4; }
                .ec p { font-size:.78rem;color:rgba(255,255,255,.35);line-height:1.6; }
                .ec.feat { border-color:var(--acc);background:rgba(232,57,14,.03); }

                .faq { max-width:760px;margin:0 auto;padding:5rem 2rem; }
                .faq h2 { font-size:2rem;font-weight:400;margin-bottom:2rem; }
                .fqi { border-bottom:1px solid var(--bdr);padding:1.25rem 0; }
                .fqi summary { font-size:.92rem;font-weight:600;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center; }
                .fqi summary::after { content:'+';font-size:1.2rem;color:var(--ink-f);transition:transform .2s; }
                .fqi[open] summary::after { transform:rotate(45deg); }
                .fqi p { margin-top:.75rem;font-size:.88rem;color:var(--ink-l);line-height:1.75;font-weight:300; }

                .cta { text-align:center;padding:5rem 2rem;max-width:560px;margin:0 auto; }
                .ei { flex:1;padding:.65rem 1rem;border:1.5px solid var(--bdr);border-radius:6px;font-size:.85rem;background:var(--white);outline:none; width: 100%; }
                
                @media(max-width:900px){.di,.dmi,.eg,.ehow{grid-template-columns:1fr}.sg{grid-template-columns:1fr}.nr{display:none}.erow{flex-direction:column}.ctbl{font-size:.72rem}.ctbl th,.ctbl td{padding:.5rem}}
            `}</style>

            <nav>
                <div className="ni">
                    <Link href="/" className="logo">TK<span>i</span></Link>
                    <ul className="nr hidden md:flex">
                        <li><a href="#insight">La science</a></li>
                        <li><a href="#demo">Démo live</a></li>
                        <li><a href="#ent">Entreprises</a></li>
                        <li><Link href="/test" className="text-acc font-bold">Passer le test</Link></li>
                        <li><a href="#cta" className="nc">Rejoindre</a></li>
                    </ul>
                </div>
            </nav>

            <section className="hero fade-in">
                <div className="mono text-acc mb-6 text-[0.68rem] tracking-[0.18em] font-medium uppercase">Recrutement post-IA</div>
                <h1>On ne regarde pas ce que tu choisis.<br />On regarde <em>comment tu choisis.</em></h1>
                <p className="lead">L'IA rédige les CV, coache les entretiens, optimise les tests. <strong>Le seul signal qu'elle ne peut pas fabriquer, c'est la trace motrice de ta prise de décision.</strong> TKi capture trajectoire de souris, patterns d'hésitation et latences de réaction pour révéler qui tu es dans l'action.</p>
                <div className="flex gap-3 flex-wrap">
                    <Link href="/test" className="btn bd">Passer le test complet →</Link>
                    <a href="#ent" className="btn bg">Je recrute</a>
                </div>
            </section>

            <section className="spb">
                <div className="spb-inner">
                    <div className="spb-item"><span className="spb-num">114+</span><span className="spb-label">études publiées<br />sur le mouse-tracking</span></div>
                    <div className="spb-item"><span className="spb-num">15</span><span className="spb-label">minutes<br />de simulation</span></div>
                    <div className="spb-item"><span className="spb-num">~4000</span><span className="spb-label">micro-événements<br />capturés par session</span></div>
                    <div className="spb-item"><span className="spb-num">0</span><span className="spb-label">diplôme<br />requis</span></div>
                </div>
            </section>

            <section className="dead fade-in">
                <div className="di">
                    <div>
                        <h2>L'IA a tué <em>tout le déclaratif</em></h2>
                        <p>En 2026, chaque candidat a un coach IA qui rédige, prépare, optimise. <strong>Tout ce qu'un candidat dit de lui-même est suspect.</strong></p>
                        <p>Mais l'IA ne peut pas simuler un corps devant un écran. Elle ne peut pas reproduire la trajectoire de ta souris quand tu hésites, ni le micro-délai avant ton clic quand tu changes d'avis.</p>
                        <p><strong>Les signaux moteurs de la prise de décision sont le dernier signal fiable.</strong></p>
                    </div>
                    <ul className="dl">
                        <li><span className="s">Le CV</span><span className="t">GPT le rédige</span></li>
                        <li><span className="s">La lettre de motivation</span><span className="t">GPT l'écrit</span></li>
                        <li><span className="s">L'entretien coaché</span><span className="t">GPT le prépare</span></li>
                        <li><span className="s">Le test de personnalité</span><span className="t">GPT connaît les réponses</span></li>
                        <li><span className="s">La simulation textuelle</span><span className="t">GPT la passe aussi</span></li>
                        <li className="alive"><span className="s">Les signaux moteurs de décision</span><span className="t">INFALSIFIABLE</span></li>
                    </ul>
                </div>
            </section>

            <section className="insight fade-in" id="insight">
                <div className="mono">L'insight fondateur</div>
                <blockquote>Un LLM peut choisir la réponse optimale.<br />Il ne peut pas simuler <span>la trajectoire de souris d'un humain qui hésite.</span></blockquote>
                <p>Les tests classiques mesurent le <strong>contenu</strong> des réponses. TKi mesure la <strong>dynamique</strong> de la prise de décision — les signaux moteurs, temporels et attentionnels qui trahissent la structure cognitive réelle.</p>
                <p>Ce n'est pas un meilleur test de personnalité. C'est une <strong>technologie de lecture comportementale pour l'ère post-IA</strong> — la réinvention de la lecture non-verbale à travers l'écran.</p>
            </section>

            <section className="sigs fade-in">
                <div className="mono">Ce qu'on capture</div>
                <h2>6 couches de signaux infra-verbaux</h2>
                <div className="sg">
                    <div className="sc"><h4><span className="ico">↗</span> Trajectoire de curseur</h4><p>Hésitation, retour en arrière, survol d'une option puis changement. La trajectoire révèle le processus de décision interne.</p><div className="ex">mousemove → heatmap d'hésitation</div></div>
                    <div className="sc"><h4><span className="ico">⏱</span> Latence 1er mouvement</h4><p>Délai entre apparition du scénario et premier mouvement. &lt;400ms = instinctif. &gt;800ms = analytique. Ce ratio est une signature individuelle.</p><div className="ex">first_move &lt; 400ms → instinct</div></div>
                    <div className="sc"><h4><span className="ico">↩</span> Corrections de direction</h4><p>Nombre de fois où tu te diriges vers une option puis changes. Corrèle avec l'ambivalence décisionnelle — impossible à simuler.</p><div className="ex">dir_changes &gt; 3 → ambivalence</div></div>
                    <div className="sc"><h4><span className="ico">📖</span> Patterns de lecture</h4><p>Ordre de lecture, temps sur chaque option. Tu lis tout avant de décider ou tu t'arrêtes à la première option plausible ?</p><div className="ex">pattern → satisficer vs maximizer</div></div>
                    <div className="sc"><h4><span className="ico">⚡</span> Pression temporelle</h4><p>On varie la pression de temps. Ton pattern change-t-il ? La stabilité décisionnelle sous contrainte est un signal fort.</p><div className="ex">drift &lt; 0.15 → haute stabilité</div></div>
                    <div className="sc"><h4><span className="ico">🔄</span> Cohérence motrice</h4><p>Même dilemme, deux angles. Tes signaux moteurs sont-ils cohérents ? L'incohérence révèle la fabrication consciente.</p><div className="ex">coherence &lt; 0.6 → fabriqué</div></div>
                </div>
            </section>

            <section className="dms fade-in" id="demo">
                <div className="dmi">
                    <div>
                        <div className="mono">Démo interactive</div>
                        <h2>Essayez. Regardez votre trace de souris se dessiner en temps réel.</h2>
                        <p>5 scénarios professionnels. Pendant que vous répondez, le canvas dessine votre trajectoire de souris et le panneau affiche vos signaux en direct.</p>
                        <p>C'est exactement ça, TKi. Sauf que la version complète analyse 12 dimensions sur ~4000 micro-événements en 15 minutes.</p>
                        <p style={{ fontSize: '.8rem', color: 'var(--ink-f)', marginTop: '1rem', borderTop: '1px solid var(--bdr)', paddingTop: '1rem' }}><strong style={{ color: 'var(--ink-l)' }}>Note :</strong> cette démo capte réellement vos mouvements de souris. Rien n'est envoyé — tout reste dans votre navigateur.</p>
                    </div>

                    <div>
                        <div className="sw" id="sw" ref={swRef}>
                            <canvas id="mouseCanvas" ref={canvasRef}></canvas>
                            <div className="swh">
                                <span className="swt"><span className="dot"></span> Simulation TKi</span>
                                <span className="sws" id="sStep">{simState.result ? 'analyse' : `${simState.step}/5`}</span>
                            </div>
                            <div className="swpb"><div className="swpf" id="sProg" style={{ width: simState.result ? '100%' : `${((simState.step - 1) / 5) * 100}%` }}></div></div>
                            <div className="swbd" id="sBody">
                                {simState.result ? <ResultView /> : <CurrentScenario />}
                            </div>
                        </div>
                        <div className="sp" id="sigP" style={{ display: simState.result ? 'none' : 'block' }}>
                            <div className="spt">Signaux capturés en temps réel</div>
                            <div className="sr"><span className="sl">Temps de réaction</span><span className={`sv ${simState.reactionClass}`} id="sRT">{simState.reactionTime}</span></div>
                            <div className="sr"><span className="sl">Hésitations (survol)</span><span className="sv" style={{ color: simState.hesColor }} id="sHes">{simState.hesitations}</span></div>
                            <div className="sr"><span className="sl">Corrections trajectoire</span><span className="sv" style={{ color: simState.corrColor }} id="sCorr">{simState.corrections}</span></div>
                            <div className="sr"><span className="sl">1er mouvement</span><span className="sv" style={{ color: simState.fmColor }} id="sFM">{simState.firstMove}</span></div>
                            <div className="sr"><span className="sl">Mouvements totaux</span><span className="sv" style={{ color: 'rgba(255,255,255,.3)' }} id="sMov">{simState.movements}</span></div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="comp fade-in">
                <div className="mono">Positionnement</div>
                <h2>Pas un meilleur test. Une nouvelle catégorie.</h2>
                <table className="ctbl">
                    <thead><tr><th></th><th>Pymetrics / HireVue</th><th>Tests classiques (MBTI, DISC)</th><th className="tki-col" style={{ color: 'var(--acc)' }}>TKi</th></tr></thead>
                    <tbody>
                        <tr><td>Mesure</td><td>Cognition (jeux)</td><td>Auto-déclaration</td><td className="tki-col">Signaux moteurs réels</td></tr>
                        <tr><td>Falsifiable par IA ?</td><td>Partiellement</td><td>Oui, facilement</td><td className="tki-col">Non</td></tr>
                        <tr><td>Valeur dans le temps</td><td>Stable</td><td>Décroissante</td><td className="tki-col">Croissante (anti-fragile)</td></tr>
                        <tr><td>Base scientifique</td><td>Neurosciences</td><td>Psychométrie déclarative</td><td className="tki-col">Mouse-tracking cognitif (114+ études)</td></tr>
                        <tr><td>Cible</td><td>Enterprise</td><td>Tous</td><td className="tki-col">16-30 ans sans credentials</td></tr>
                        <tr><td>Candidat</td><td>Passif</td><td>Passif</td><td className="tki-col">Immersion interactive</td></tr>
                    </tbody>
                </table>
            </section>

            <section className="af fade-in">
                <div className="mono">Pourquoi maintenant</div>
                <h2>Un business anti-fragile</h2>
                <p>Chaque nouveau modèle d'IA rend les CV et entretiens moins fiables. TKi est le seul outil dont la valeur <em>augmente</em> avec la puissance de l'IA.</p>
                <svg viewBox="0 0 500 200" style={{ maxWidth: '460px', display: 'block', margin: '0 auto' }}>
                    <line x1="30" y1="180" x2="480" y2="180" stroke="#e5e5e0" strokeWidth="1" />
                    <line x1="30" y1="10" x2="30" y2="180" stroke="#e5e5e0" strokeWidth="1" />
                    <text x="10" y="100" transform="rotate(-90,10,100)" fill="#aaa" fontSize="9" fontFamily="Outfit" textAnchor="middle" letterSpacing="2">FIABILITÉ</text>
                    <text x="440" y="195" fill="#aaa" fontSize="8" fontFamily="JetBrains Mono" letterSpacing="1">PUISSANCE IA →</text>
                    <path d="M 40 35 Q 200 45 470 155" fill="none" stroke="#ddd" strokeWidth="1.5" strokeDasharray="5 3" />
                    <text x="472" y="162" fill="#ccc" fontSize="10" fontFamily="Outfit">CV / entretien</text>
                    <path d="M 40 145 Q 200 125 470 25" fill="none" stroke="#e8390e" strokeWidth="2" />
                    <text x="472" y="30" fill="#e8390e" fontSize="10" fontFamily="Outfit" fontWeight="600">TKi</text>
                    <line x1="180" y1="15" x2="180" y2="175" stroke="#e8390e" strokeWidth=".5" strokeDasharray="3 3" opacity=".3" />
                    <text x="180" y="195" fill="#e8390e" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle" opacity=".4">2026</text>
                </svg>
            </section>

            <section className="sci fade-in">
                <div className="scii">
                    <div className="mono">Fondations scientifiques</div>
                    <h2>Basé sur 15 ans de recherche en mouse-tracking cognitif</h2>
                    <div className="ref"><div className="ref-title">Mouse tracking as a window into decision making</div><div className="ref-meta">Gallo, Duñabeitia & Costello — Behavior Research Methods, 2019 · 114+ études analysées dans la méta-revue. « Le mouse-tracking est plus fin que les temps de réponse et plus accessible que l'eye-tracking. »</div></div>
                    <div className="ref"><div className="ref-title">How Mouse-tracking Can Advance Social Cognitive Theory</div><div className="ref-meta">Stillman, Shen & Ferguson — Trends in Cognitive Sciences, 2018 · Montre que les trajectoires de souris prédisent les comportements futurs et révèlent les conflits décisionnels internes.</div></div>
                    <div className="ref"><div className="ref-title">Using mouse cursor tracking to investigate online cognition</div><div className="ref-meta">Schoemann et al. — Psychonomic Bulletin & Review, 2021 · Revue systématique de 167 expériences. Établit les standards méthodologiques du mouse-tracking.</div></div>
                    <div className="ref"><div className="ref-title">Mouse-tracking for investigating strategic behavior</div><div className="ref-meta">Frontiers in Psychology, 2025 · Montre que les trajectoires de souris corrèlent avec l'effort cognitif et le comportement stratégique en situation de décision.</div></div>
                </div>
            </section>

            <section className="ent fade-in" id="ent">
                <div className="enti">
                    <div className="mono">Pour les entreprises</div>
                    <h2>Le seul signal que l'IA ne peut pas fabriquer</h2>
                    <p>Vos candidats ont passé 15 minutes dans un environnement contrôlé. Vous savez comment ils décident — pas ce qu'ils prétendent.</p>
                    <div className="ehow">
                        <div className="ehc"><div className="ehn">1</div><h4>Publiez un poste</h4><p>Décrivez le rôle, la culture, les traits comportementaux recherchés.</p></div>
                        <div className="ehc"><div className="ehn">2</div><h4>Les candidats passent TKi</h4><p>15 min de simulation. Gratuit pour eux. Profil comportemental généré automatiquement.</p></div>
                        <div className="ehc"><div className="ehn">3</div><h4>Matching IA</h4><p>Vous recevez les profils classés par compatibilité. Rapport pré-entretien inclus.</p></div>
                    </div>
                    <div className="eg">
                        <div className="ec"><h4>Starter</h4><div className="ep">299€ <span>/mois</span></div><p>1 recruteur · 50 profils/mois · Matching comportemental · Rapport pré-entretien</p></div>
                        <div className="ec feat"><h4>Business</h4><div className="ep">799€ <span>/mois</span></div><p>5 recruteurs · Profils illimités · API + ATS · Analytics prédictifs · Score de rétention</p></div>
                        <div className="ec"><h4>Enterprise</h4><div className="ep">Sur mesure</div><p>Illimité · Simulations custom par métier · Account manager · Calibration culture</p></div>
                    </div>
                </div>
            </section>

            <section className="faq fade-in">
                <div className="mono">Questions clés</div>
                <h2>FAQ investisseurs</h2>
                <details className="fqi"><summary>Le mouse-tracking est-il scientifiquement validé ?</summary><p>Oui. Plus de 114 études publiées dans des revues peer-reviewed (Behavior Research Methods, Trends in Cognitive Sciences, Psychonomic Bulletin & Review). Le mouse-tracking est utilisé en recherche cognitive depuis 2004. TKi est la première application commerciale pour le recrutement.</p></details>
                <details className="fqi"><summary>Comment gérez-vous le RGPD ?</summary><p>Les données de trajectoire sont pseudonymisées et traitées localement. Le profil comportemental est la propriété du candidat. Les entreprises n'accèdent qu'au profil agrégé, jamais aux données brutes. Conformité RGPD par design.</p></details>
                <details className="fqi"><summary>Et sur mobile (pas de souris) ?</summary><p>Sur mobile, TKi capture les patterns de tap, la pression tactile (sur les devices compatibles), les temps de réponse et les patterns de scroll. Les signaux sont différents mais la méthodologie est identique : mesurer la dynamique de la décision, pas son contenu.</p></details>
                <details className="fqi"><summary>Comment empêcher quelqu'un de passer le test plusieurs fois ?</summary><p>Authentification par email + device fingerprint. Mais surtout : le test s'adapte. Les scénarios sont générés dynamiquement — deux sessions ne se ressemblent jamais. Et les signaux moteurs sont naturellement stables : ta signature comportementale ne change pas d'un passage à l'autre.</p></details>
                <details className="fqi"><summary>Quel est l'unfair advantage ?</summary><p>Pascal Larue, CEO d'ImpactUp, 20 ans de recrutement terrain fonctions commerciales et marketing, +2000 placements, 6 bureaux en France. Il est notre advisor et donne accès à un réseau d'entreprises qui recrutent activement notre cible. C'est notre distribution day one.</p></details>
                <details className="fqi"><summary>Quelle est la roadmap de validation ?</summary><p>Q1 2026 : prototype + waitlist + recrutement psychométricien. Q2 : simulation complète + 10 entreprises pilotes. Q3 : plateforme live + premiers revenus. Q4 : 100+ clients + seed si pertinent.</p></details>
            </section>

            <section className="cta" id="cta">
                <h2>Le recrutement post-IA commence ici</h2>
                <p>Candidats : votre profil comportemental, gratuit pour toujours. Entreprises : accès anticipé à la plateforme.</p>
                <div className="flex gap-2 max-w-[400px] mx-auto flex-col sm:flex-row">
                    <input
                        type="email"
                        className="ei"
                        placeholder="ton@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={status === 'success'}
                    />
                    <button
                        className="btn bd whitespace-nowrap justify-center"
                        onClick={handleSubscribe}
                        disabled={status !== 'idle' && status !== 'error'}
                        style={status === 'success' ? { background: '#34d399' } : {}}
                    >
                        {status === 'loading' ? '...' : status === 'success' ? '✓ Inscrit' : 'Rejoindre →'}
                    </button>
                </div>
                {status === 'error' && <p className="text-acc text-xs mt-2">Une erreur est survenue. Réessayez.</p>}
            </section>

            <footer><div className="fi flex justify-between items-center max-w-[1080px] mx-auto p-8 border-t border-[var(--bdr)]">
                <span className="fl font-serif">TKi</span>
                <span className="fr text-xs text-[var(--ink-f)]">© 2026 — On ne regarde pas ce que tu choisis. On regarde comment tu choisis.</span>
            </div></footer>
        </>
    );
}
