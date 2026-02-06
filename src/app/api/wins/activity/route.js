import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Count wins per date
        // SQLite: strftime('%Y-%m-%d', date_created) ensures we group by day
        const stmt = db.prepare(`
            SELECT 
                strftime('%Y-%m-%d', date_created) as date, 
                COUNT(*) as count 
            FROM wins 
            GROUP BY date
            ORDER BY date ASC
        `);

        const rows = stmt.all();

        // Transform to react-activity-calendar format
        // { date: "YYYY-MM-DD", count: 4, level: 3 }
        const data = rows.map(row => {
            let level = 0;
            if (row.count >= 1) level = 1;
            if (row.count >= 2) level = 2;
            if (row.count >= 3) level = 3;
            if (row.count >= 4) level = 4;

            return {
                date: row.date,
                count: row.count,
                level: level
            };
        });

        return NextResponse.json(data);
    } catch (error) {
        console.error('Activity stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch activity stats' }, { status: 500 });
    }
}
