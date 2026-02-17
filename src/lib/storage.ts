import { Answer, CognitiveAnswer } from './types';
import { computeScores } from './scoring';

// In-memory storage for MVP
// In a real app, this would be Redis/Postgres
type SessionData = {
    id: string;
    createdAt: number;
    answers: Answer[];
    cogAnswers: CognitiveAnswer[];
    openAnswer: string | null;
    completed: boolean;
    score: Record<string, number> | null;
};

// Global variable to persist across hot reloads in dev (to some extent)
// independent of module reloading if possible, but in Next.js dev server it might reset
// For a robust dev experience without DB, simple file write might be better, 
// but let's stick to global variable first.
const globalForStore = global as unknown as { tkiSessions: Map<string, SessionData> };

export const sessions = globalForStore.tkiSessions || new Map<string, SessionData>();

if (process.env.NODE_ENV !== 'production') globalForStore.tkiSessions = sessions;

export function createSession() {
    const id = Math.random().toString(36).substring(2, 15);
    const session: SessionData = {
        id,
        createdAt: Date.now(),
        answers: [],
        cogAnswers: [],
        openAnswer: null,
        completed: false,
        score: null,
    };
    sessions.set(id, session);
    return id;
}

export function getSession(id: string) {
    return sessions.get(id);
}

export function saveAnswer(sessionId: string, answer: Answer) {
    const session = sessions.get(sessionId);
    if (!session) return false;
    session.answers.push(answer);
    return true;
}

export function saveCognitiveAnswer(sessionId: string, answer: CognitiveAnswer) {
    const session = sessions.get(sessionId);
    if (!session) return false;
    session.cogAnswers.push(answer);
    return true;
}

export function saveOpenAnswer(sessionId: string, answer: string) {
    const session = sessions.get(sessionId);
    if (!session) return false;
    session.openAnswer = answer;
    return true;
}

export function completeSession(sessionId: string) {
    const session = sessions.get(sessionId);
    if (!session) return null;

    session.completed = true;
    session.score = computeScores(session.answers, session.cogAnswers);
    return session.score;
}
