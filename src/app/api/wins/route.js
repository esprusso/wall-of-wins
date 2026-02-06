
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const starred = searchParams.get('starred');

    let stmt;
    let rows;

    try {
        if (starred === 'true') {
            stmt = db.prepare('SELECT * FROM wins WHERE is_starred = 1 ORDER BY win_order ASC, date_created DESC, id DESC');
            rows = stmt.all();
        } else if (date) {
            stmt = db.prepare('SELECT * FROM wins WHERE date_created = ? ORDER BY win_order ASC, id DESC');
            rows = stmt.all(date);
        } else {
            // Fallback or "all"
            stmt = db.prepare('SELECT * FROM wins ORDER BY win_order ASC, date_created DESC, id DESC');
            rows = stmt.all();
        }
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
    try {
        // Check if the request is multipart
        const contentType = request.headers.get('content-type') || '';

        let content, date_created, color, imageUrl = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            content = formData.get('content');
            date_created = formData.get('date_created');
            color = formData.get('color');
            const file = formData.get('image');

            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const filename = Date.now() + '-' + file.name.replaceAll(' ', '_');

                // Ensure uploads directory exists
                const uploadDir = path.join(process.cwd(), 'public/uploads');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                await writeFile(path.join(uploadDir, filename), buffer);
                imageUrl = `/uploads/${filename}`;
            }
        } else {
            const body = await request.json();
            content = body.content;
            date_created = body.date_created;
            color = body.color;
        }

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        // Default to today if no date provided
        if (!date_created) {
            date_created = new Date().toISOString().split('T')[0];
        }

        const winColor = color || 'yellow';

        // Insert new win at the top (order = 0), shift others down if needed? 
        // Or just insert. For now we use order 0. 
        // To properly insert at top, we could query min(win_order) - 1.
        // Or just accept 0 and let the user reorder.
        // Let's get the minimum current order to place it at the absolute top
        const minOrderStmt = db.prepare("SELECT MIN(win_order) as minOrder FROM wins");
        const result = minOrderStmt.get();
        const newOrder = (result && result.minOrder !== null) ? result.minOrder - 1 : 0;

        const stmt = db.prepare('INSERT INTO wins (content, date_created, color, win_order, image_url) VALUES (?, ?, ?, ?, ?)');
        const info = stmt.run(content, date_created, winColor, newOrder, imageUrl);

        return NextResponse.json({
            id: info.lastInsertRowid,
            content,
            date_created,
            color: winColor,
            is_starred: 0,
            win_order: newOrder,
            image_url: imageUrl
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
