import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, company, problem } = body;

    // Валидация
    if (!userId || !company || !problem) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Проверка существования пользователя
    const user = db.prepare('SELECT id, user_type FROM users WHERE id = ?').get(userId) as {
      id: number;
      user_type: string;
    } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Проверка, что пользователь - заказчик
    if (user.user_type !== 'customer') {
      return NextResponse.json(
        { error: 'Только заказчики могут создавать заявки' },
        { status: 403 }
      );
    }

    // Вставка заявки в БД
    const stmt = db.prepare('INSERT INTO customer_requests (user_id, company, problem) VALUES (?, ?, ?)');
    const result = stmt.run(userId, company, problem);

    return NextResponse.json(
      { 
        message: 'Заявка успешно создана',
        requestId: result.lastInsertRowid 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

