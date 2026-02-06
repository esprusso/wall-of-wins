
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(request, context) {
    const params = await context.params;
    const id = params.id;

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    try {
        // First check if it exists
        const check = db.prepare('SELECT * FROM wins WHERE id = ?').get(id);
        if (!check) {
            return NextResponse.json({ error: 'Win not found' }, { status: 404 });
        }

        const currentState = check.is_starred;
        const newState = currentState ? 0 : 1;

        const stmt = db.prepare('UPDATE wins SET is_starred = ? WHERE id = ?');
        stmt.run(newState, id);

        return NextResponse.json({ ...check, is_starred: newState });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
