import { NextResponse } from 'next/server';
import { ensureFontExists } from '@/lib/fonts';

export async function GET() {
    try {
        await ensureFontExists();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Font setup error:', error);
        return NextResponse.json({ success: false, error: 'Font setup failed' }, { status: 500 });
    }
} 