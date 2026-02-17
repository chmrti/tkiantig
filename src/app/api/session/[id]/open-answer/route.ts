import { NextRequest, NextResponse } from 'next/server';
import { saveOpenAnswer } from '@/lib/storage';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    const success = await saveOpenAnswer(id, body.text);

    if (!success) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
}
