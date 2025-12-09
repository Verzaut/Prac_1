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

// Создаем таблицу заявок от заказчиков
db.exec(`
  CREATE TABLE IF NOT EXISTS customer_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company TEXT NOT NULL,
    problem TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    paid INTEGER DEFAULT 0,
    is_valid INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )
`);

// Обновляем существующую таблицу, если она уже есть (добавляем новые поля)
try {
  db.exec(`ALTER TABLE customer_requests ADD COLUMN paid INTEGER DEFAULT 0`);
} catch (e) {
  // Поле уже существует, игнорируем ошибку
}

try {
  db.exec(`ALTER TABLE customer_requests ADD COLUMN is_valid INTEGER DEFAULT 1`);
} catch (e) {
  // Поле уже существует, игнорируем ошибку
}

export default db;

