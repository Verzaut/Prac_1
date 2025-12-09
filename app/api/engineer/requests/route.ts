import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Получаем все заявки от заказчиков
    const requests = db.prepare(`
      SELECT 
        cr.id,
        cr.company,
        cr.problem,
        cr.status,
        cr.engineer_id,
        cr.is_valid,
        cr.created_at,
        u.email as customer_email
      FROM customer_requests cr
      JOIN users u ON cr.user_id = u.id
      WHERE cr.is_valid = 1
      ORDER BY cr.company ASC, cr.created_at DESC
    `).all() as Array<{
      id: number;
      company: string;
      problem: string;
      status: string;
      engineer_id: number | null;
      is_valid: number;
      created_at: string;
      customer_email: string;
    }>;

    // Группируем заявки по компаниям
    const groupedByCompany: Record<string, Array<{
      id: number;
      problem: string;
      status: string;
      created_at: string;
      customer_email: string;
    }>> = {};

    requests.forEach((request) => {
      if (!groupedByCompany[request.company]) {
        groupedByCompany[request.company] = [];
      }
      groupedByCompany[request.company].push({
        id: request.id,
        problem: request.problem,
        status: request.status,
        engineer_id: request.engineer_id,
        created_at: request.created_at,
        customer_email: request.customer_email,
      });
    });

    return NextResponse.json(
      {
        requests: groupedByCompany,
        totalRequests: requests.length,
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

