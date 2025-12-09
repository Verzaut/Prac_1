import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'users.db');
const dbDir = path.dirname(dbPath);

// Создаем директорию data, если её нет
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Создаем таблицу пользователей, если её нет
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    company TEXT NOT NULL,
    user_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;

