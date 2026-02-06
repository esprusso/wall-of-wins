import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { wins, clearExisting } = body;

        if (!Array.isArray(wins)) {
            return NextResponse.json({ error: 'Invalid data format. Expected an array of wins.' }, { status: 400 });
        }

        const insertStmt = db.prepare(`
            INSERT INTO wins (content, date_created, is_starred, color, win_order, image_url)
            VALUES (@content, @date_created, @is_starred, @color, @win_order, @image_url)
        `);

        const deleteStmt = db.prepare('DELETE FROM wins');

        const transaction = db.transaction(() => {
            if (clearExisting) {
                deleteStmt.run();
            }

            for (const win of wins) {
                insertStmt.run({
                    content: win.content,
                    date_created: win.date_created,
                    is_starred: win.is_starred ? 1 : 0,
                    color: win.color || 'yellow', // Default if missing
                    win_order: win.win_order || 0,
                    image_url: win.image_url || null
                });
            }
        });

        transaction();

        return NextResponse.json({ message: 'Import successful', count: wins.length });
    } catch (error) {
        console.error('Import failed:', error);
        return NextResponse.json({ error: 'Failed to import wins' }, { status: 500 });
    }
}
