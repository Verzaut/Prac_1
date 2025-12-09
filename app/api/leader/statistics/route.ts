import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Общая статистика
    const totalRequests = db.prepare('SELECT COUNT(*) as count FROM customer_requests').get() as { count: number };
    const completedRequests = db.prepare("SELECT COUNT(*) as count FROM customer_requests WHERE status = 'completed'").get() as { count: number };
    const inProgressRequests = db.prepare("SELECT COUNT(*) as count FROM customer_requests WHERE status = 'in_progress'").get() as { count: number };
    const pendingRequests = db.prepare("SELECT COUNT(*) as count FROM customer_requests WHERE status = 'pending'").get() as { count: number };
    
    // Суммарная прибыль (только оплаченные заказы)
    const totalProfit = db.prepare(`
      SELECT COALESCE(SUM(price), 0) as total 
      FROM customer_requests 
      WHERE paid = 1 AND is_valid = 1
    `).get() as { total: number };

    // Статистика по месяцам (для графика)
    const monthlyStats = db.prepare(`
      SELECT 
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count,
        COALESCE(SUM(CASE WHEN paid = 1 AND is_valid = 1 THEN price ELSE 0 END), 0) as profit
      FROM customer_requests
      WHERE created_at >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month ASC
    `).all() as Array<{
      month: string;
      count: number;
      profit: number;
    }>;

    // Статистика по статусам
    const statusStats = db.prepare(`
      SELECT 
        status,
        COUNT(*) as count
      FROM customer_requests
      WHERE is_valid = 1
      GROUP BY status
    `).all() as Array<{
      status: string;
      count: number;
    }>;

    // Детальная информация о заказах
    const ordersDetails = db.prepare(`
      SELECT 
        cr.id,
        cr.company,
        cr.problem,
        cr.status,
        cr.paid,
        cr.price,
        cr.created_at,
        cr.completed_at,
        cu.email as customer_email,
        cu.company as customer_company,
        en.email as engineer_email,
        en.company as engineer_company
      FROM customer_requests cr
      LEFT JOIN users cu ON cr.user_id = cu.id
      LEFT JOIN users en ON cr.engineer_id = en.id
      ORDER BY cr.created_at DESC
    `).all() as Array<{
      id: number;
      company: string;
      problem: string;
      status: string;
      paid: number;
      price: number;
      created_at: string;
      completed_at: string | null;
      customer_email: string;
      customer_company: string;
      engineer_email: string | null;
      engineer_company: string | null;
    }>;

    return NextResponse.json(
      {
        totalRequests: totalRequests.count,
        completedRequests: completedRequests.count,
        inProgressRequests: inProgressRequests.count,
        pendingRequests: pendingRequests.count,
        totalProfit: totalProfit.total,
        monthlyStats,
        statusStats,
        ordersDetails: ordersDetails.map(order => ({
          id: order.id,
          company: order.company,
          problem: order.problem,
          status: order.status,
          paid: order.paid === 1,
          price: order.price,
          created_at: order.created_at,
          completed_at: order.completed_at,
          customer: {
            email: order.customer_email,
            company: order.customer_company,
          },
          engineer: order.engineer_email ? {
            email: order.engineer_email,
            company: order.engineer_company,
          } : null,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

