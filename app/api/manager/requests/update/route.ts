import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, paid, is_valid } = body;

    // Валидация
    if (!requestId) {
      return NextResponse.json(
        { error: 'ID заявки обязателен' },
        { status: 400 }
      );
    }

    // Проверка существования заявки
    const existingRequest = db.prepare('SELECT id FROM customer_requests WHERE id = ?').get(requestId);
    if (!existingRequest) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      );
    }

    // Обновляем заявку
    const updates: string[] = [];
    const values: any[] = [];

    if (paid !== undefined) {
      updates.push('paid = ?');
      values.push(paid ? 1 : 0);
    }

    if (is_valid !== undefined) {
      updates.push('is_valid = ?');
      values.push(is_valid ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Не указаны поля для обновления' },
        { status: 400 }
      );
    }

    values.push(requestId);
    const sql = `UPDATE customer_requests SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    return NextResponse.json(
      { 
        message: 'Заявка успешно обновлена',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при обновлении заявки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

