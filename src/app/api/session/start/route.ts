import { NextResponse } from 'next/server';
import { createSession } from '@/lib/storage';

export async function POST() {
    try {
        const sessionId = createSession();
        return NextResponse.json({ sessionId });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }
}
