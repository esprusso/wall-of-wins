import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // Expects 'YYYY-MM'

    if (!month) {
        return NextResponse.json({ error: 'Month parameter is required (YYYY-MM)' }, { status: 400 });
    }

    try {
        // Prepare statement to find all unique dates with wins in the given month
        // SQLite: strftime('%Y-%m', date_created) extracts the YYYY-MM part
        const stmt = db.prepare(`
            SELECT DISTINCT strftime('%Y-%m-%d', date_created) as date
            FROM wins
            WHERE strftime('%Y-%m', date_created) = ?
            ORDER BY date ASC
        `);

        const rows = stmt.all(month);

        // Extract just the date strings into an array
        const dates = rows.map(row => row.date);

        return NextResponse.json(dates);
    } catch (error) {
        console.error('Failed to fetch monthly wins:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
