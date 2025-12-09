import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Валидация
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Хеширование пароля для сравнения
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Поиск пользователя в БД
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, hashedPassword) as {
      id: number;
      email: string;
      company: string;
      user_type: string;
      created_at: string;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    // Возвращаем данные пользователя (без пароля)
    return NextResponse.json(
      {
        message: 'Вход выполнен успешно',
        user: {
          id: user.id,
          email: user.email,
          company: user.company,
          userType: user.user_type,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

