import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, company, userType } = body;

    // Валидация
    if (!email || !password || !company || !userType) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Неверный формат email' },
        { status: 400 }
      );
    }

    // Проверка, существует ли пользователь с таким email
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 409 }
      );
    }

    // Хеширование пароля (простое хеширование, в продакшене лучше использовать bcrypt)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Вставка пользователя в БД
    const stmt = db.prepare('INSERT INTO users (email, password, company, user_type) VALUES (?, ?, ?, ?)');
    const result = stmt.run(email, hashedPassword, company, userType);

    return NextResponse.json(
      { 
        message: 'Регистрация успешна',
        userId: result.lastInsertRowid 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

