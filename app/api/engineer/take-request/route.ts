import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, engineerId } = body;

    // Валидация
    if (!requestId || !engineerId) {
      return NextResponse.json(
        { error: 'ID заявки и ID инженера обязательны' },
        { status: 400 }
      );
    }

    // Проверка существования заявки
    const request = db.prepare('SELECT id, engineer_id, status, is_valid FROM customer_requests WHERE id = ?').get(requestId) as {
      id: number;
      engineer_id: number | null;
      status: string;
      is_valid: number;
    } | undefined;

    if (!request) {
      return NextResponse.json(
        { error: 'Заявка не найдена' },
        { status: 404 }
      );
    }

    // Проверка, что заявка действительна
    if (request.is_valid === 0) {
      return NextResponse.json(
        { error: 'Нельзя взять недействительный заказ' },
        { status: 400 }
      );
    }

    // Проверка, что заявка еще не взята другим инженером
    if (request.engineer_id !== null && request.engineer_id !== engineerId) {
      return NextResponse.json(
        { error: 'Заявка уже взята другим инженером' },
        { status: 409 }
      );
    }

    // Обновляем заявку: назначаем инженера и меняем статус
    db.prepare(`
      UPDATE customer_requests 
      SET engineer_id = ?, status = 'in_progress' 
      WHERE id = ?
    `).run(engineerId, requestId);

    return NextResponse.json(
      { 
        message: 'Заявка успешно взята в работу',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при взятии заявки:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

