import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    try {
        const stmt = db.prepare(`
            SELECT * FROM wins 
            WHERE content LIKE ? 
            ORDER BY date_created DESC
        `);
        const wins = stmt.all(`%${query}%`);
        return NextResponse.json(wins);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to search wins' }, { status: 500 });
    }
}
