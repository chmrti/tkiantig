import { NextRequest, NextResponse } from 'next/server';
import { saveAnswer, saveCognitiveAnswer } from '@/lib/storage';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    // Distinguish between behavioral and cognitive based on body structure
    // Behavioral has 'tags', 'pathComplexity' etc
    // Cognitive has 'correct' or 'questionId' specific fields

    let success = false;

    if (body.type === 'cognitive') {
        success = await saveCognitiveAnswer(id, body.data);
    } else {
        success = await saveAnswer(id, body.data);
    }

    if (!success) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
