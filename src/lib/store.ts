import { create } from 'zustand';
import { AppState, Answer, CognitiveAnswer } from './types';
import { PHASES, COG_SCHEDULE } from './data';

interface TestStore extends AppState {
    sessionId: string | null;
    isLoading: boolean;
    startTest: () => Promise<void>;
    nextStep: () => void;
    submitAnswer: (answer: Answer) => Promise<void>;
    submitCognitiveAnswer: (answer: CognitiveAnswer) => Promise<void>;
    submitOpenAnswer: (text: string) => Promise<void>;
    completeTest: () => Promise<void>;
    reset: () => void;
    setPhase: (phase: AppState['phase']) => void;
}

const initialState: AppState = {
    phase: 'intro',
    currentPhaseIndex: 0,
    currentScenarioIndex: 0,
    globalScenarioIndex: 0,
    globalStep: 0,
    totalSteps: 25,
    answers: [],
    cogAnswers: [],
    openAnswer: '',
    cogQueueIndex: 0,
    cogBatch: [],
    analysis: null,
};

export const useTestStore = create<TestStore>((set, get) => ({
    ...initialState,
    sessionId: null,
    isLoading: false,

    startTest: async () => {
        set({ isLoading: true });
        try {
            const res = await fetch('/api/session/start', { method: 'POST' });
            const data = await res.json();

            set({
                sessionId: data.sessionId,
                phase: 'transition',
                currentPhaseIndex: 0,
                currentScenarioIndex: 0,
                globalScenarioIndex: 0,
                globalStep: 0,
                answers: [],
                cogAnswers: [],
                openAnswer: '',
                isLoading: false
            });
        } catch (e) {
            console.error("Failed to start session", e);
            set({ isLoading: false });
        }
    },

    setPhase: (phase) => set({ phase }),

    submitAnswer: async (answer) => {
        // Optimistic update
        set((state) => ({ answers: [...state.answers, answer] }));

        // API Call
        const { sessionId } = get();
        if (sessionId) {
            await fetch(`/api/session/${sessionId}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'behavioral', data: answer })
            });
        }
    },

    submitCognitiveAnswer: async (answer) => {
        // Optimistic update
        set((state) => ({ cogAnswers: [...state.cogAnswers, answer] }));

        // API Call
        const { sessionId } = get();
        if (sessionId) {
            await fetch(`/api/session/${sessionId}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'cognitive', data: answer })
            });
        }
    },

    submitOpenAnswer: async (text) => {
        set({ openAnswer: text });
        const { sessionId } = get();
        if (sessionId) {
            await fetch(`/api/session/${sessionId}/open-answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
        }
    },

    completeTest: async () => {
        const { sessionId } = get();
        if (sessionId) {
            await fetch(`/api/session/${sessionId}/complete`, { method: 'POST' });
        }
    },

    nextStep: () => {
        const state = get();

        if (state.phase === 'scenario') {
            const currentPhase = PHASES[state.currentPhaseIndex];
            const nextScenarioIndex = state.currentScenarioIndex + 1;

            // Update global progress
            set((s) => ({
                globalStep: s.globalStep + 1,
                globalScenarioIndex: s.globalScenarioIndex + 1
            }));

            // Check if phase is complete
            if (nextScenarioIndex >= currentPhase.scenarios.length) {
                // Phase Complete. Check for cognitive questions
                const schedule = COG_SCHEDULE.find(s => s.after === `phase${state.currentPhaseIndex}`);

                if (schedule && schedule.questions.length > 0) {
                    set({
                        phase: 'cognitive',
                        cogBatch: schedule.questions,
                        cogQueueIndex: 0
                    });
                } else {
                    // Go to next phase or open question
                    const nextPhaseIndex = state.currentPhaseIndex + 1;
                    if (nextPhaseIndex >= PHASES.length) {
                        set({ phase: 'openq' });
                    } else {
                        set({
                            phase: 'transition',
                            currentPhaseIndex: nextPhaseIndex,
                            currentScenarioIndex: 0
                        });
                    }
                }
            } else {
                // Next scenario in same phase
                set({ currentScenarioIndex: nextScenarioIndex });
            }
        }
        else if (state.phase === 'cognitive') {
            set((s) => ({ globalStep: s.globalStep + 1 }));
            const nextQueueIndex = state.cogQueueIndex + 1;

            if (nextQueueIndex >= state.cogBatch.length) {
                // Batch complete, go to next phase
                const nextPhaseIndex = state.currentPhaseIndex + 1;
                if (nextPhaseIndex >= PHASES.length) {
                    set({ phase: 'openq' });
                } else {
                    set({
                        phase: 'transition',
                        currentPhaseIndex: nextPhaseIndex,
                        currentScenarioIndex: 0
                    });
                }
            } else {
                set({ cogQueueIndex: nextQueueIndex });
            }
        }
        else if (state.phase === 'openq') {
            // Trigger completion
            get().completeTest();
            set({ phase: 'result' });
        }
    },

    reset: () => set(initialState)
}));
