import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const wins = db.prepare('SELECT * FROM wins ORDER BY date_created DESC').all();

        // Create a JSON string
        const json = JSON.stringify(wins, null, 2);

        // Return as a downloadable file
        return new NextResponse(json, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="wall-of-wins-backup-${new Date().toISOString().split('T')[0]}.json"`,
            },
        });
    } catch (error) {
        console.error('Export failed:', error);
        return NextResponse.json({ error: 'Failed to export wins' }, { status: 500 });
    }
}
