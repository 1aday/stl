import { getFontPath } from '@/lib/fonts';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const fontPath = getFontPath();
        return NextResponse.json({ fontPath });
    } catch {
        return NextResponse.json({ error: 'Failed to setup fonts' }, { status: 500 });
    }
} 