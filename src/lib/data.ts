import { BehavioralDynamics, Phase, CognitiveQuestion, CognitiveScheduleItem, OpenQuestion } from "./types";

export const DYNAMICS: BehavioralDynamics = {
    VD: {
        name: "Vélocité décisionnelle",
        short: "Vélocité",
        desc: "La vitesse à laquelle vous convergez vers une décision. Pas le temps de réponse brut — le ratio entre temps de réflexion et temps d'action.",
        science: "Kahneman Système 1/2 · Dual Process Theory",
        color: "#e8390e",
        low: "Analytique délibéré — vous pesez chaque option avant d'agir. Forte capacité de jugement, risque de paralysie décisionnelle.",
        high: "Décisionnaire instinctif — vous agissez vite sur des heuristiques fiables. Haute réactivité, risque de biais de confirmation."
    },
    TA: {
        name: "Tolérance à l'ambiguïté",
        short: "Ambiguïté",
        desc: "Comment vous réagissez quand les consignes sont floues, incomplètes ou contradictoires. Cherchez-vous la clarté ou foncez-vous dans le flou ?",
        science: "Budner 1962 · Furnham & Ribchester 1995",
        color: "#60a5fa",
        low: "Besoin de cadre — vous cherchez la clarté avant d'agir. Fiable en environnement structuré, en difficulté dans le chaos.",
        high: "Navigateur du flou — vous avancez sans consignes claires. Parfait pour l'innovation et les startups, risque d'imprécision."
    },
    PA: {
        name: "Plasticité adaptative",
        short: "Plasticité",
        desc: "Quand les règles changent en cours de route, combien de temps mettez-vous à recalibrer ? Restez-vous accroché à l'ancien cadre ou pivotez-vous immédiatement ?",
        science: "Cognitive Flexibility · Wisconsin Card Sort · Set-shifting",
        color: "#34d399",
        low: "Ancrage au cadre — vous maintenez votre cap malgré les changements. Fiable et constant, mais lent à s'adapter.",
        high: "Pivot rapide — vous recalibrez instantanément. Agile et réactif, risque d'instabilité stratégique."
    },
    RS: {
        name: "Régulation sociale",
        short: "Social",
        desc: "Dans les interactions, naviguez-vous par assertivité directe, diplomatie calculée, ou évitement ?",
        science: "Social Information Processing · Thomas-Kilmann Conflict Mode",
        color: "#a78bfa",
        low: "Évitement ou diplomatie indirecte — vous préférez ne pas créer de friction. Excellent en médiation, risque de non-dit.",
        high: "Assertivité directe — vous dites les choses sans filtre social. Clarifie les situations, risque de conflit."
    },
    PF: {
        name: "Persistance sous frustration",
        short: "Persistance",
        desc: "Face à un obstacle ou une situation frustrante, insistez-vous, contournez-vous, ou lâchez-vous ?",
        science: "Grit Scale · Duckworth 2007 · Delay of Gratification",
        color: "#f472b6",
        low: "Lâcher-prise rapide — vous redirigez votre énergie quand un obstacle est trop fort. Économe en effort, risque d'abandon prématuré.",
        high: "Persistance obstinée — vous insistez jusqu'au bout. Haute ténacité, risque de sunk cost fallacy."
    },
    SE: {
        name: "Style d'exploration",
        short: "Exploration",
        desc: "Analysez-vous toutes les options avant de choisir (maximizer) ou vous arrêtez-vous à la première option satisfaisante (satisficer) ?",
        science: "Schwartz 2002 · Maximizing vs Satisficing",
        color: "#fbbf24",
        low: "Satisficer — vous prenez la première option viable. Rapide et décisif, risque de passer à côté d'options meilleures.",
        high: "Maximizer — vous explorez exhaustivement. Décisions optimales, risque de paralysie et de regret post-décision."
    },
    LC: {
        name: "Locus de contrôle",
        short: "Locus",
        desc: "Pensez-vous pouvoir influencer la situation (interne) ou attendez-vous que la situation se résolve (externe) ?",
        science: "Rotter 1966 · Internal vs External Locus of Control",
        color: "#2dd4bf",
        low: "Locus externe — vous attendez les bonnes conditions ou les bonnes personnes. Patience stratégique, risque de passivité.",
        high: "Locus interne — vous prenez le contrôle de la situation. Proactivité, risque de surcharge et de micro-management."
    },
    CP: {
        name: "Cohérence sous pression",
        short: "Cohérence",
        desc: "Votre style décisionnel reste-t-il stable quand la pression augmente, ou dérive-t-il vers un mode dégradé ?",
        science: "Yerkes-Dodson Law · Stress-Decision Interaction",
        color: "#fb923c",
        low: "Pattern instable sous pression — votre style change significativement. Adaptable mais imprévisible sous stress.",
        high: "Pattern stable — vous décidez de la même façon sous pression et au calme. Fiable en crise, risque de rigidité."
    }
};

export const PHASES: Phase[] = [
    {
        name: "Gestion de crise", desc: "Prise de décision sous urgence et pression temporelle", scenarios: [
            {
                id: 1, ctx: "URGENCE CLIENT", q: "17h50, vendredi. Un client stratégique vous appelle : un bug critique bloque son équipe de 40 personnes. Votre manager est en avion. L'équipe tech estime 4h de travail. Le client menace de résilier lundi.", sub: "Vous êtes seul décisionnaire. Pas de filet de sécurité.", opts: [
                    { text: "Appeler le client immédiatement pour négocier un délai et cadrer les attentes", tags: { VD: .7, RS: .6, LC: .8, TA: .3 } },
                    { text: "Commencer le fix vous-même — improviser avec les ressources disponibles", tags: { VD: .9, LC: .9, PF: .8, TA: .7 } },
                    { text: "Escalader en urgence — trouver quelqu'un de décisionnaire, coûte que coûte", tags: { VD: .5, LC: .4, RS: .5, TA: .2 } },
                    { text: "Documenter le problème en détail et préparer un plan d'action structuré pour lundi 8h", tags: { VD: .2, SE: .8, TA: .2, PF: .5 } }
                ]
            },
            {
                id: 2, ctx: "INTERRUPTION — LES RÈGLES CHANGENT", q: "Vous étiez en train d'agir quand le client rappelle : le bug était un faux positif. Par contre, il veut renégocier les termes du contrat lundi matin. « C'est maintenant ou jamais. » Votre manager est toujours injoignable.", sub: "Ce que vous aviez commencé ne sert plus à rien. Le problème a changé de nature.", opts: [
                    { text: "Accepter la réunion et préparer des arguments ce soir", tags: { PA: .9, VD: .8, LC: .8, PF: .7 } },
                    { text: "Demander de préciser exactement ce qu'il veut renégocier avant de s'engager", tags: { PA: .4, TA: .2, SE: .8, VD: .3 } },
                    { text: "Expliquer que ce type de décision nécessite votre manager — reporter à lundi", tags: { PA: .2, LC: .3, RS: .4, TA: .2 } },
                    { text: "Proposer un call ce week-end pour cadrer les attentes des deux côtés", tags: { PA: .7, RS: .7, LC: .7, TA: .6 } }
                ]
            },
            {
                id: 3, ctx: "CASCADE D'URGENCES", q: "Lundi 9h. Trois urgences simultanées : le client de vendredi veut sa réunion, un collègue est malade et vous devez reprendre son livrable pour 14h, et votre manager (enfin de retour) vous demande un reporting « pour hier ».", sub: "Impossible de tout faire. Quelque chose va tomber.", opts: [
                    { text: "Prioriser le client — c'est le chiffre d'affaires. Le reste attendra.", tags: { VD: .8, LC: .7, TA: .6, SE: .3 } },
                    { text: "Faire le reporting d'abord — le manager est votre priorité hiérarchique", tags: { VD: .5, LC: .4, RS: .3, SE: .4 } },
                    { text: "Déléguer le reporting à un junior et gérer client + livrable en parallèle", tags: { VD: .7, LC: .9, PA: .7, RS: .6 } },
                    { text: "Aller voir le manager, expliquer la situation et demander de reprioriser ensemble", tags: { VD: .4, RS: .7, TA: .3, LC: .5 } }
                ]
            },
            {
                id: 4, ctx: "PRESSION TEMPORELLE MAXIMALE", q: "Le client de vendredi est en salle de réunion. Vous avez 2 minutes avant d'y entrer. Vous n'avez pas eu le temps de préparer. Vous avez juste votre mémoire de vendredi soir.", sub: "⏱ Répondez en moins de 15 secondes.", opts: [
                    { text: "Entrer avec confiance et improviser — vous connaissez le dossier", tags: { VD: .9, TA: .9, LC: .8, CP: .8 } },
                    { text: "Demander 10 minutes de délai — « je reviens avec un document »", tags: { VD: .3, TA: .2, SE: .7, CP: .4 } },
                    { text: "Envoyer un collègue en éclaireur pendant que vous rassemblez vos notes", tags: { VD: .6, RS: .6, LC: .6, PA: .5 } },
                    { text: "Entrer et commencer par écouter — laisser le client parler d'abord", tags: { VD: .5, TA: .7, RS: .8, SE: .5 } }
                ]
            }
        ]
    },
    {
        name: "Ambiguïté & exploration", desc: "Prise de décision avec des informations incomplètes ou contradictoires", scenarios: [
            {
                id: 5, ctx: "CONSIGNES FLOUES", q: "Nouveau projet. Le brief tient en une phrase : « Fais quelque chose d'innovant pour le client X. » Deadline : 2 semaines. Pas de budget défini. Pas d'autre directive.", sub: "C'est tout ce que vous avez. Le reste est à vous.", opts: [
                    { text: "Demander un brief plus détaillé, un budget et des KPIs avant de commencer", tags: { TA: .1, SE: .7, VD: .3, LC: .4 } },
                    { text: "Foncer avec une V1 rapide en 48h — montrer plutôt qu'expliquer", tags: { TA: .9, VD: .9, LC: .9, SE: .2 } },
                    { text: "Analyser les projets passés du client X pour identifier des patterns", tags: { TA: .5, SE: .9, VD: .4, PF: .6 } },
                    { text: "Proposer 3 directions différentes avec mini-budget pour faire choisir", tags: { TA: .7, SE: .6, RS: .7, LC: .7 } }
                ]
            },
            {
                id: 6, ctx: "INFORMATIONS CONTRADICTOIRES", q: "Deux sources fiables vous donnent des informations opposées. Votre data analyst dit que le segment jeunes est en croissance. Votre commercial terrain dit que les jeunes ne convertissent plus depuis 3 mois.", sub: "Les deux sont compétents. Les deux ont des preuves.", opts: [
                    { text: "Creuser les données — les chiffres ne mentent pas, les impressions si", tags: { TA: .4, SE: .8, VD: .3, LC: .6 } },
                    { text: "Faire confiance au terrain — le commercial voit ce que les chiffres ne montrent pas encore", tags: { TA: .6, VD: .7, SE: .3, LC: .5 } },
                    { text: "Organiser un face-à-face entre les deux pour confronter les perspectives", tags: { TA: .7, RS: .8, SE: .6, LC: .7 } },
                    { text: "Lancer un test A/B rapide sur le segment — laisser le marché trancher", tags: { TA: .9, VD: .8, LC: .9, PA: .7 } }
                ]
            },
            {
                id: 7, ctx: "CHOIX IRRÉVERSIBLE", q: "Vous devez choisir entre deux partenaires technologiques. Le premier est établi, cher, avec un historique prouvé. Le second est une startup, 3× moins cher, avec une techno prometteuse mais non testée à l'échelle. Le choix est irréversible — contrat de 3 ans.", sub: "Pas de bonne réponse. Chaque choix a un coût d'opportunité réel.", opts: [
                    { text: "Le partenaire établi — dans l'incertitude, minimiser le risque", tags: { TA: .2, VD: .6, SE: .4, PF: .4 } },
                    { text: "La startup — le différentiel de prix finance 2 ans de marge de manœuvre", tags: { TA: .8, VD: .7, LC: .8, SE: .5 } },
                    { text: "Demander un POC de 3 mois à la startup avant de signer", tags: { TA: .5, SE: .9, VD: .3, PF: .7 } },
                    { text: "Proposer un split : 70% établi / 30% startup pour diversifier le risque", tags: { TA: .6, SE: .7, PA: .6, RS: .5 } }
                ]
            },
            {
                id: 8, ctx: "ABSENCE DE FEEDBACK", q: "Vous pilotez un projet depuis 6 semaines. Aucun retour de la direction. Pas de KPIs définis. Vous ne savez pas si vous allez dans la bonne direction. Le budget diminue.", sub: "Le silence peut signifier la confiance ou l'indifférence. Impossible de savoir.", opts: [
                    { text: "Continuer sur votre lancée — pas de nouvelles, bonnes nouvelles", tags: { TA: .8, LC: .7, PF: .8, VD: .6 } },
                    { text: "Demander un point avec la direction pour valider l'orientation", tags: { TA: .3, RS: .6, SE: .5, LC: .5 } },
                    { text: "Envoyer un rapport d'avancement non sollicité pour provoquer du feedback", tags: { TA: .5, LC: .8, RS: .7, VD: .5 } },
                    { text: "Pivoter préventivement — changer d'approche pour couvrir plus de scénarios", tags: { TA: .7, PA: .8, SE: .6, VD: .7 } }
                ]
            }
        ]
    },
    {
        name: "Dynamiques sociales", desc: "Interactions interpersonnelles, conflits et collaboration", scenarios: [
            {
                id: 9, ctx: "APPROPRIATION DE CRÉDIT", q: "En réunion d'équipe, votre collègue Marc présente votre travail du week-end comme le sien. Votre manager le félicite chaleureusement. Marc vous regarde et dit : « On a bien bossé en équipe, non ? »", sub: "10 personnes dans la salle. Tout le monde attend votre réaction.", opts: [
                    { text: "Sourire. Le résultat compte plus que le crédit.", tags: { RS: .2, PF: .5, LC: .3, PA: .6 } },
                    { text: "Corriger calmement : « Juste pour être précis, c'est moi qui ai géré vendredi soir. »", tags: { RS: .9, LC: .8, PF: .7, TA: .6 } },
                    { text: "Ne rien dire en public, mais clarifier avec Marc en tête-à-tête après", tags: { RS: .6, PF: .6, PA: .5, LC: .5 } },
                    { text: "« Oui, bel effort d'équipe » — avec un ton qui laisse planer le doute", tags: { RS: .5, TA: .5, PA: .4, LC: .4 } }
                ]
            },
            {
                id: 10, ctx: "FEEDBACK NÉGATIF", q: "Vous devez donner un feedback négatif à un membre de votre équipe que tout le monde apprécie. Son travail est en baisse depuis 2 mois. Les autres commencent à compenser en silence.", sub: "Si vous ne dites rien, l'équipe va se dégrader. Si vous le dites mal, vous perdez sa confiance.", opts: [
                    { text: "Conversation directe et factuelle : « Voici les chiffres, voici ce que j'attends. »", tags: { RS: .9, LC: .8, VD: .7, PF: .7 } },
                    { text: "Approche empathique : « Comment ça va en ce moment ? J'ai remarqué un changement. »", tags: { RS: .5, LC: .5, TA: .6, SE: .5 } },
                    { text: "Attendre encore un mois — ça peut être temporaire", tags: { RS: .2, PF: .3, LC: .3, PA: .3 } },
                    { text: "En parler au RH et leur demander de gérer", tags: { RS: .3, LC: .2, PA: .4, VD: .4 } }
                ]
            },
            {
                id: 11, ctx: "DÉSACCORD HIÉRARCHIQUE", q: "Votre manager veut lancer une campagne que vous pensez être une erreur stratégique. Vous avez des données qui le montrent, mais il est convaincu. Il vous demande de l'exécuter « immédiatement ».", sub: "C'est votre manager. Mais c'est aussi votre nom sur le projet.", opts: [
                    { text: "Présenter vos données une dernière fois, clairement, puis exécuter sa décision", tags: { RS: .7, LC: .7, PF: .6, PA: .5 } },
                    { text: "Exécuter sans discuter — c'est sa responsabilité, pas la vôtre", tags: { RS: .2, LC: .2, PA: .7, VD: .8 } },
                    { text: "Proposer un test limité avant le lancement complet pour réduire le risque", tags: { RS: .6, LC: .8, SE: .8, TA: .5 } },
                    { text: "Escalader au N+2 — si vous avez raison, il faut que quelqu'un le sache", tags: { RS: .8, LC: .9, PF: .9, TA: .7 } }
                ]
            },
            {
                id: 12, ctx: "DEMANDE DÉRAISONNABLE", q: "Un client important demande une fonctionnalité en 48h qui prendrait normalement 3 semaines. Votre commercial a déjà dit oui sans vous consulter. Le client attend.", sub: "Le « oui » a déjà été donné. Le client ne le sait pas.", opts: [
                    { text: "Rappeler le client et renégocier un délai réaliste — honnêteté avant tout", tags: { RS: .8, LC: .8, VD: .6, PF: .6 } },
                    { text: "Mobiliser l'équipe pour un sprint de 48h — tenir la promesse coûte que coûte", tags: { PF: .9, VD: .8, LC: .7, PA: .5 } },
                    { text: "Livrer une V1 simplifiée en 48h et le reste en 2 semaines", tags: { PA: .8, TA: .7, SE: .6, LC: .7 } },
                    { text: "Dire à votre commercial de gérer — c'est son engagement, pas le vôtre", tags: { RS: .4, LC: .3, PF: .2, PA: .4 } }
                ]
            }
        ]
    },
    {
        name: "Éthique & persistance", desc: "Dilemmes moraux, frustration et décisions à long terme", scenarios: [
            {
                id: 13, ctx: "DILEMME ÉTHIQUE", q: "Vous découvrez qu'un collègue apprécié falsifie légèrement ses notes de frais depuis plusieurs mois. Petits montants (50-100€). Personne d'autre ne semble le savoir.", sub: "C'est quelqu'un que vous respectez. Les montants sont faibles.", opts: [
                    { text: "En parler directement au collègue en privé — lui laisser la chance de corriger", tags: { RS: .7, LC: .7, PF: .5, TA: .5 } },
                    { text: "Signaler à votre manager ou au RH — une faute est une faute", tags: { RS: .5, LC: .6, PF: .7, TA: .3 } },
                    { text: "Ne rien faire — ce n'est pas votre problème et les montants sont faibles", tags: { RS: .1, LC: .2, PF: .2, TA: .7 } },
                    { text: "Vérifier d'abord discrètement si c'est vraiment intentionnel", tags: { SE: .9, TA: .4, VD: .3, RS: .5 } }
                ]
            },
            {
                id: 14, ctx: "ÉCHEC RÉPÉTÉ", q: "C'est la troisième fois que votre proposition est rejetée par le comité. À chaque fois, des raisons différentes. Vous êtes convaincu que votre idée est bonne. Vos collègues commencent à vous suggérer de laisser tomber.", sub: "3 rejets. Est-ce de la ténacité ou de l'obstination ?", opts: [
                    { text: "Soumettre une 4e version — en intégrant chaque feedback reçu", tags: { PF: .9, LC: .8, SE: .7, VD: .5 } },
                    { text: "Laisser tomber — 3 refus, c'est un message. Passer à autre chose.", tags: { PF: .1, PA: .8, VD: .7, TA: .5 } },
                    { text: "Trouver un sponsor interne qui porte l'idée à votre place", tags: { PF: .6, RS: .8, LC: .6, PA: .6 } },
                    { text: "Pivoter — garder le cœur de l'idée mais changer complètement l'emballage", tags: { PF: .7, PA: .9, SE: .6, TA: .7 } }
                ]
            },
            {
                id: 15, ctx: "SACRIFICE À COURT TERME", q: "On vous propose une promotion avec 30% d'augmentation, mais dans une équipe dont vous savez que le management est toxique. Vos collègues actuels comptent sur vous pour un projet qui vous passionne.", sub: "Plus d'argent vs. plus de sens. Carrière vs. intégrité.", opts: [
                    { text: "Accepter — le salaire et le titre ouvrent des portes. Le reste se gère.", tags: { VD: .7, LC: .7, PF: .6, TA: .6 } },
                    { text: "Refuser — votre santé mentale et vos relations valent plus que 30%", tags: { PF: .5, LC: .6, RS: .5, TA: .3 } },
                    { text: "Négocier : « Oui, mais dans 6 mois, et si je peux garder mon projet actuel »", tags: { PA: .7, SE: .8, RS: .7, LC: .8 } },
                    { text: "Accepter, mais avec un plan de sortie en 12 mois si la situation ne change pas", tags: { PA: .6, VD: .6, PF: .7, SE: .6 } }
                ]
            },
            {
                id: 16, ctx: "TRANSPARENCE OU PROTECTION", q: "Votre équipe a fait une erreur qui a coûté 15K€ à l'entreprise. Vous pouvez la camoufler dans les comptes du trimestre — personne ne le verra. Ou vous pouvez la déclarer, ce qui impactera le bonus de toute l'équipe.", sub: "Personne ne saura. Sauf vous.", opts: [
                    { text: "Déclarer l'erreur — la transparence construit la confiance à long terme", tags: { RS: .6, LC: .7, PF: .5, TA: .3 } },
                    { text: "La camoufler — protéger l'équipe est la priorité, pas la comptabilité", tags: { RS: .4, LC: .4, PF: .4, TA: .8 } },
                    { text: "En parler à l'équipe d'abord et décider collectivement", tags: { RS: .8, LC: .5, SE: .6, TA: .5 } },
                    { text: "Déclarer, mais en présentant un plan correctif pour minimiser l'impact", tags: { RS: .7, LC: .8, SE: .7, PA: .6 } }
                ]
            }
        ]
    }
];

export const COGNITIVE: CognitiveQuestion[] = [
    {
        id: 'C1', level: 1, ctx: 'LOGIQUE — NIVEAU 1', q: 'Si tous les Zarks sont Blims, et que certains Blims sont Troqs, laquelle de ces affirmations est CERTAINEMENT vraie ?',
        opts: ['Certains Zarks sont Troqs', 'Tous les Blims sont Zarks', 'Certains Zarks sont Blims', 'Aucun Zark n\'est un Troq'], correct: 2,
        explain: 'Tous les Zarks sont Blims → donc certains Zarks sont (forcément) Blims. Les autres conclusions ne sont pas garanties.'
    },
    {
        id: 'C2', level: 2, ctx: 'SÉQUENCE — NIVEAU 2', q: 'Trouvez le prochain élément : ⬤ ◯ ⬤ ⬤ ◯ ⬤ ⬤ ⬤ ◯ ?',
        opts: ['◯', '⬤ ⬤', '⬤', '⬤ ⬤ ⬤ ⬤'], correct: 2,
        explain: 'Le pattern est : 1 plein, 1 vide, 2 pleins, 1 vide, 3 pleins, 1 vide → suivant : 4 pleins. Le premier du groupe de 4 est ⬤.'
    },
    {
        id: 'C3', level: 3, ctx: 'DÉDUCTION — NIVEAU 3', q: 'Dans une course, vous doublez la personne en 2e position. À quelle position êtes-vous maintenant ?',
        opts: ['1er', '2e', '3e', 'Impossible à déterminer'], correct: 1,
        explain: 'Si vous doublez le 2e, vous prenez sa place : vous êtes 2e. Beaucoup répondent 1er par réflexe.'
    },
    {
        id: 'C4', level: 4, ctx: 'LOGIQUE CONDITIONNELLE — NIVEAU 4', q: 'Un tiroir contient 5 chaussettes noires et 5 chaussettes blanches mélangées. Sans regarder, combien devez-vous en prendre au MINIMUM pour être sûr d\'avoir une paire de la même couleur ?',
        opts: ['2', '3', '5', '6'], correct: 1,
        explain: 'Avec 3 chaussettes, par le principe des tiroirs (pigeonhole), vous avez forcément au moins 2 de la même couleur.'
    },
    {
        id: 'C5', level: 5, ctx: 'RAISONNEMENT ABSTRAIT — NIVEAU 5', q: 'A est plus grand que B. C est plus petit que A. B est plus grand que D. Laquelle de ces affirmations est IMPOSSIBLE à déterminer avec certitude ?',
        opts: ['A est plus grand que D', 'C est plus grand que D', 'B est plus grand que C', 'D est le plus petit'], correct: 1,
        explain: 'On sait A>B>D et A>C, mais la relation entre C et D (ou C et B) n\'est pas déterminable. "C est plus grand que D" ne peut pas être affirmé.'
    },
    {
        id: 'C6', level: 6, ctx: 'PATTERN LOGIQUE — NIVEAU 6', q: '1, 1, 2, 3, 5, 8, 13, 21, ... Le 10e terme de cette suite est :',
        opts: ['34', '55', '44', '89'], correct: 1,
        explain: 'Suite de Fibonacci. 1,1,2,3,5,8,13,21,34,55. Le 10e terme est 55.'
    },
    {
        id: 'C7', level: 7, ctx: 'LOGIQUE COMBINATOIRE — NIVEAU 7', q: 'Trois interrupteurs dans le couloir contrôlent trois ampoules dans une pièce fermée. Vous ne pouvez entrer dans la pièce qu\'UNE SEULE FOIS. Comment identifier quel interrupteur contrôle quelle ampoule ?',
        opts: ['Allumer les 3, éteindre 1, puis entrer', 'Allumer 1 pendant 5 min, l\'éteindre, allumer un 2e, puis entrer', 'Entrer et tester un par un', 'C\'est impossible en une seule visite'], correct: 1,
        explain: 'Allumer le 1er pendant 5 min (chauffe), l\'éteindre, allumer le 2e, entrer. L\'ampoule allumée = 2e. L\'ampoule éteinte mais chaude = 1er. L\'ampoule froide et éteinte = 3e.'
    },
    {
        id: 'C8', level: 8, ctx: 'MÉTA-RAISONNEMENT — NIVEAU 8', q: 'Un énoncé dit : « Cette phrase contient exactement trois erreurs. » L\'orthographe et la grammaire sont parfaites. Combien d\'erreurs cette phrase contient-elle réellement ?',
        opts: ['0', '1 (l\'affirmation elle-même)', '2', '3'], correct: 1,
        explain: 'L\'orthographe est correcte (0 erreur de ce type), donc l\'affirmation "trois erreurs" est elle-même la seule erreur. C\'est un paradoxe auto-référentiel — la phrase contient exactement 1 erreur : son propre énoncé.'
    }
];

export const COG_SCHEDULE: CognitiveScheduleItem[] = [
    { after: 'phase0', questions: [0, 1] }, // After crisis phase
    { after: 'phase1', questions: [2, 3] }, // After ambiguity phase
    { after: 'phase2', questions: [4, 5] }, // After social phase
    { after: 'phase3', questions: [6, 7] }  // After ethics phase
];

export const OPEN_QUESTION: OpenQuestion = {
    ctx: 'QUESTION OUVERTE — ANALYSÉE PAR IA',
    q: 'Vous êtes le dernier humain sur Terre. Tout fonctionne encore — électricité, internet, nourriture — mais vous êtes absolument seul. Qu\'est-ce que vous faites le premier jour, et pourquoi ?',
    sub: 'Répondez en 3-5 phrases. Cette réponse sera analysée par intelligence artificielle pour évaluer la structure de pensée, la créativité et la cohérence argumentative.',
    placeholder: 'Écrivez votre réponse ici...'
};
