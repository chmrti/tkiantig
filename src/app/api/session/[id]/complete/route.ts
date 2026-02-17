import { NextRequest, NextResponse } from 'next/server';
import { completeSession } from '@/lib/storage';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const score = await completeSession(id);

    if (!score) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ score });
}
