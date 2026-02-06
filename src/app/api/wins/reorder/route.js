
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { items } = body; // Expects [{ id: 1, order: 0 }, { id: 2, order: 1 }, ...]

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
        }

        const updateStmt = db.prepare('UPDATE wins SET win_order = ? WHERE id = ?');

        const updateMany = db.transaction((wins) => {
            for (const win of wins) {
                updateStmt.run(win.order, win.id);
            }
        });

        updateMany(items);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Reorder error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
