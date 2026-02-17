import { Answer, CognitiveAnswer, BehavioralDynamics } from './types';
import { DYNAMICS } from './data';

// Helper for clamping
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

// Helper for mean
const mean = (arr: number[]) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;

// Helper for standard deviation
const stdev = (arr: number[]) => {
    if (arr.length === 0) return 0;
    const m = mean(arr);
    return Math.sqrt(mean(arr.map(x => Math.pow(x - m, 2))));
};

/**
 * Computes motor adjustment for a specific dimension based on signals.
 * This is a simplified implementation of the logic described in the architecture.
 */
function computeMotorAdjustment(dimKey: string, answers: Answer[]): number {
    // Collect relevant signals across all answers
    const reactionTimes = answers.map(a => a.time);
    const hoverChanges = answers.map(a => a.hoverChanges);
    const pathComplexities = answers.map(a => a.pathComplexity);

    // Normalize signals (simple min-max scaling relative to expected baselines)
    // Baselines are arbitrary for this frontend implementation
    const avgRT = mean(reactionTimes);
    const avgHover = mean(hoverChanges);
    const avgPath = mean(pathComplexities);

    let adj = 0;

    switch (dimKey) {
        case 'VD': // Vélocité: Faster RT = higher VD
            // If RT is fast (< 5s), boost VD. If slow (> 15s), reduce VD.
            if (avgRT < 5) adj += 0.15;
            else if (avgRT > 15) adj -= 0.15;
            break;

        case 'TA': // Tolérance Ambiguïté: More exploration (hover changes) = higher TA? 
            // Actually, low TA people might seek more info (explore more) OR freeze.
            // High TA people might decide quicker in ambiguity.
            // Let's assume High TA = less hesitation in complex scenarios.
            if (avgHover < 2) adj += 0.1;
            break;

        case 'SE': // Style Exploration: More unique hovers = higher SE (Maximizer)
            const avgUnique = mean(answers.map(a => a.uniqueHovers));
            if (avgUnique > 3) adj += 0.2; // Explored almost all
            else if (avgUnique < 2) adj -= 0.1; // Satisficer
            break;

        case 'LC': // Locus Control: Proactive (first move fast) = Internal (High LC)
            const avgFirstMove = mean(answers.map(a => a.firstMove));
            if (avgFirstMove < 1000) adj += 0.1;
            break;

        default:
            break;
    }

    return adj;
}

export function computeScores(answers: Answer[], cogAnswers: CognitiveAnswer[]) {
    const scores: Record<string, number> = {};

    // 1. Behavioral Scores
    Object.keys(DYNAMICS).forEach(dimKey => {
        // Declarative score
        const tagValues: number[] = [];
        answers.forEach(a => {
            if (a.tags[dimKey] !== undefined) {
                tagValues.push(a.tags[dimKey]);
            }
        });

        const declAvg = tagValues.length > 0 ? mean(tagValues) : 0.5;

        // Motor adjustment
        const motorAdj = computeMotorAdjustment(dimKey, answers);

        // Weighted sum: 70% declarative, 30% motor (simulating the spec)
        // Base is 0-1, mapped to 0-100
        // We assume motorAdj is around -0.2 to +0.2 centered on 0
        const rawScore = (declAvg * 0.7) + (0.5 + motorAdj) * 0.3;

        scores[dimKey] = clamp(Math.round(rawScore * 100), 0, 100);
    });

    // 2. Cognitive Score
    // Weighted by level (simplified here as we don't have level in CognitiveAnswer, need to look up)
    // Actually we can't easily look up level without importing COGNITIVE and finding by ID.
    // Let's assume unweighted for MVP or try to look up.

    // We need to import properly or pass relevant data. 
    // Ideally Answer should contain level, but it doesn't.
    // Let's implement a simple cognitive score: Correct / Total * 100 + Speed Bonus

    let correctCount = 0;
    let speedBonus = 0;

    cogAnswers.forEach(a => {
        if (a.correct) {
            correctCount++;
            if (a.time < 8) speedBonus += 2; // Fast correct
        } else {
            if (a.time < 4) speedBonus -= 3; // Fast wrong (impulsive)
        }
    });

    const baseCognitive = (correctCount / Math.max(1, cogAnswers.length)) * 100;
    scores['COGNITIVE'] = clamp(Math.round(baseCognitive + speedBonus), 0, 100);

    return scores;
}
