import { Answer, CognitiveAnswer } from './types';
import { computeScores } from './scoring';
import { supabase } from './supabase';

export async function createSession() {
    const { data, error } = await supabase
        .from('sessions')
        .insert({})
        .select('id')
        .single();

    if (error) {
        console.error('Error creating session:', error);
        throw error;
    }
    return data.id;
}

export async function saveAnswer(sessionId: string, answer: Answer) {
    // We need to append to the existing JSON array.
    // Supabase doesn't support 'append' directly to JSONB easy without a function, 
    // but for low traffic MVP we can just:
    // 1. Get current answers (or assume client state is source of truth? No, security.)
    // BETTER: Create a 'rpc' function or just fetch-modify-update.
    // OR: maintain a separate table for answers. 
    // GIVEN the schema provided: "answers jsonb default '[]'::jsonb", 
    // we can use the postgres '||' operator if we write raw SQL, but supabase-js is cleaner with `rpc` or just fetch-update.
    // Let's go with fetch-update for simplicity of implementation now, despite race conditions (low concurency expected).

    // Actually, to avoid race conditions in a "real-ish" demo, let's just append at the end:
    // But we are sending 1 by 1.

    const { data: session } = await supabase.from('sessions').select('answers').eq('id', sessionId).single();
    if (!session) return false;

    const newAnswers = [...(session.answers || []), answer];

    const { error } = await supabase
        .from('sessions')
        .update({ answers: newAnswers })
        .eq('id', sessionId);

    return !error;
}

export async function saveCognitiveAnswer(sessionId: string, answer: CognitiveAnswer) {
    const { data: session } = await supabase.from('sessions').select('cog_answers').eq('id', sessionId).single();
    if (!session) return false;

    const newAnswers = [...(session.cog_answers || []), answer];

    const { error } = await supabase
        .from('sessions')
        .update({ cog_answers: newAnswers })
        .eq('id', sessionId);

    return !error;
}

export async function saveOpenAnswer(sessionId: string, answer: string) {
    const { error } = await supabase
        .from('sessions')
        .update({ open_answer: answer })
        .eq('id', sessionId);
    return !error;
}

export async function completeSession(sessionId: string) {
    // 1. Fetch all answers to compute score
    const { data: session } = await supabase
        .from('sessions')
        .select('answers, cog_answers')
        .eq('id', sessionId)
        .single();

    if (!session) return null;

    // 2. Compute score
    const score = computeScores(session.answers || [], session.cog_answers || []);

    // 3. Update session
    const { error } = await supabase
        .from('sessions')
        .update({
            completed: true,
            score: score
        })
        .eq('id', sessionId);

    if (error) return null;
    return score;
}
