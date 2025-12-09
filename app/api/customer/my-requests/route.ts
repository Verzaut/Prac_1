import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'ID пользователя обязателен' },
        { status: 400 }
      );
    }

    // Получаем все заявки пользователя
    const requests = db.prepare(`
      SELECT 
        id,
        company,
        problem,
        status,
        paid,
        is_valid,
        created_at
      FROM customer_requests
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(parseInt(userId)) as Array<{
      id: number;
      company: string;
      problem: string;
      status: string;
      paid: number;
      is_valid: number;
      created_at: string;
    }>;

    return NextResponse.json(
      {
        requests: requests.map(r => ({
          id: r.id,
          company: r.company,
          problem: r.problem,
          status: r.status,
          paid: r.paid === 1,
          is_valid: r.is_valid === 1,
          created_at: r.created_at,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при получении заявок:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

