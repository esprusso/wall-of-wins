
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'db', 'wins.db');
const db = new Database(dbPath);

// Initialize schema
db.prepare(`
  CREATE TABLE IF NOT EXISTS wins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    date_created TEXT NOT NULL,
    is_starred BOOLEAN DEFAULT 0
  )
`).run();

// Migration: Add color column if not exists
try {
  const columns = db.prepare("PRAGMA table_info(wins)").all();
  const colorExists = columns.some(col => col.name === 'color');
  if (!colorExists) {
    db.prepare("ALTER TABLE wins ADD COLUMN color TEXT DEFAULT 'yellow'").run();
  }

  const orderExists = columns.some(col => col.name === 'win_order');
  if (!orderExists) {
    db.prepare("ALTER TABLE wins ADD COLUMN win_order INTEGER DEFAULT 0").run();
  }

  const imageExists = columns.some(col => col.name === 'image_url');
  if (!imageExists) {
    db.prepare("ALTER TABLE wins ADD COLUMN image_url TEXT").run();
  }
} catch (error) {
  console.error('Migration failed:', error);
}

export default db;
