
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, context) {
    const params = await context.params;
    const id = params.id;

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    try {
        const stmt = db.prepare('DELETE FROM wins WHERE id = ?');
        const info = stmt.run(id);

        if (info.changes === 0) {
            return NextResponse.json({ error: 'Win not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request, context) {
    const params = await context.params;
    const id = params.id;

    if (!id) {
        return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const { content } = body;

        // If only toggling star, the other route handles it, but let's allow content updates here
        if (!content) {
            return NextResponse.json({ error: 'No content provided for update' }, { status: 400 });
        }

        const stmt = db.prepare('UPDATE wins SET content = ? WHERE id = ?');
        const info = stmt.run(content, id);

        if (info.changes === 0) {
            return NextResponse.json({ error: 'Win not found' }, { status: 404 });
        }

        const updatedWin = db.prepare('SELECT * FROM wins WHERE id = ?').get(id);
        return NextResponse.json(updatedWin);

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
