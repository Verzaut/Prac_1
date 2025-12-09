import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, userId } = body;

    // Валидация
    if (!requestId || !userId) {
      return NextResponse.json(
        { error: 'ID заявки и ID пользователя обязательны' },
        { status: 400 }
      );
    }

    // Проверка существования заявки и принадлежности пользователю
    const request = db.prepare(`
      SELECT id, user_id, is_valid 
      FROM customer_requests 
      WHERE id = ? AND user_id = ?
    `).get(requestId, userId) as {
      id: number;
      user_id: number;
      is_valid: number;
    } | undefined;

    if (!request) {
      return NextResponse.json(
        { error: 'Заявка не найдена или не принадлежит вам' },
        { status: 404 }
      );
    }

    // Проверка, что заявка действительна
    if (request.is_valid === 0) {
      return NextResponse.json(
        { error: 'Нельзя оплатить недействительный заказ' },
        { status: 400 }
      );
    }

    // Обновляем статус оплаты
    db.prepare('UPDATE customer_requests SET paid = 1 WHERE id = ?').run(requestId);

    return NextResponse.json(
      { 
        message: 'Заказ успешно оплачен',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при оплате заказа:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

