"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Statistics {
  totalRequests: number;
  completedRequests: number;
  inProgressRequests: number;
  pendingRequests: number;
  totalProfit: number;
  monthlyStats: Array<{
    month: string;
    count: number;
    profit: number;
  }>;
  statusStats: Array<{
    status: string;
    count: number;
  }>;
  ordersDetails: Array<{
    id: number;
    company: string;
    problem: string;
    status: string;
    paid: boolean;
    price: number;
    created_at: string;
    completed_at: string | null;
    customer: {
      email: string;
      company: string;
    };
    engineer: {
      email: string;
      company: string;
    } | null;
  }>;
}

export default function LeaderPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    email: string;
    company: string;
    userType: string;
  } | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      if (parsedUser.userType !== "leader") {
        router.push("/dashboard");
        return;
      }
      
      loadStatistics();
    } else {
      router.push("/");
    }
  }, [router]);

  const loadStatistics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/leader/statistics");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при загрузке статистики");
        return;
      }

      setStatistics(data);
    } catch (err) {
      setError("Произошла ошибка при подключении к серверу");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(amount);
  };

  const getMaxValue = (values: number[]) => {
    return Math.max(...values, 1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (isLoading || !statistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Загрузка статистики...</p>
        </div>
      </div>
    );
  }

  const maxCount = getMaxValue(statistics.monthlyStats.map(s => s.count));
  const maxProfit = getMaxValue(statistics.monthlyStats.map(s => s.profit));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Панель руководителя
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Добро пожаловать, {user.email}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadStatistics}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Обновление..." : "Обновить"}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
                Всего заявок
              </h3>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-300">
                {statistics.totalRequests}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                Завершено
              </h3>
              <p className="text-3xl font-bold text-green-900 dark:text-green-300">
                {statistics.completedRequests}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
              <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                В работе
              </h3>
              <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-300">
                {statistics.inProgressRequests}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-2">
                Суммарная прибыль
              </h3>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">
                {formatCurrency(statistics.totalProfit)}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Requests Chart */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Заявки по месяцам
              </h2>
              <div className="space-y-3">
                {statistics.monthlyStats.map((stat) => (
                  <div key={stat.month} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-20">
                      {new Date(stat.month + "-01").toLocaleDateString("ru-RU", { month: "short", year: "numeric" })}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                      <div
                        className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(stat.count / maxCount) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {stat.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Profit Chart */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Прибыль по месяцам
              </h2>
              <div className="space-y-3">
                {statistics.monthlyStats.map((stat) => (
                  <div key={stat.month} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-20">
                      {new Date(stat.month + "-01").toLocaleDateString("ru-RU", { month: "short", year: "numeric" })}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                      <div
                        className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(stat.profit / maxProfit) * 100}%` }}
                      >
                        <span className="text-xs text-white font-medium">
                          {formatCurrency(stat.profit)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orders Details */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Детальная информация по заказам
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Компания</th>
                    <th className="px-4 py-3">Заказчик</th>
                    <th className="px-4 py-3">Инженер</th>
                    <th className="px-4 py-3">Статус</th>
                    <th className="px-4 py-3">Оплата</th>
                    <th className="px-4 py-3">Цена</th>
                    <th className="px-4 py-3">Дата создания</th>
                    <th className="px-4 py-3">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.ordersDetails.map((order) => (
                    <tr
                      key={order.id}
                      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3">{order.id}</td>
                      <td className="px-4 py-3">{order.company}</td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{order.customer.email}</div>
                          <div className="text-xs text-gray-500">{order.customer.company}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.engineer ? (
                          <div>
                            <div className="font-medium">{order.engineer.email}</div>
                            <div className="text-xs text-gray-500">{order.engineer.company}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Не назначен</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                          order.status === "in_progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" :
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        }`}>
                          {order.status === "completed" ? "Завершена" :
                           order.status === "in_progress" ? "В работе" : "Ожидает"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {order.paid ? (
                          <span className="text-green-600 dark:text-green-400">✓ Оплачено</span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400">✗ Не оплачено</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{formatCurrency(order.price)}</td>
                      <td className="px-4 py-3">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {selectedOrder === order.id ? "Скрыть" : "Подробнее"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {(() => {
                  const order = statistics.ordersDetails.find(o => o.id === selectedOrder);
                  if (!order) return null;
                  return (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Детали заказа #{order.id}
                        </h3>
                        <button
                          onClick={() => setSelectedOrder(null)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Компания:</h4>
                          <p className="text-gray-900 dark:text-gray-100">{order.company}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Заказчик:</h4>
                          <p className="text-gray-900 dark:text-gray-100">{order.customer.email}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{order.customer.company}</p>
                        </div>
                        {order.engineer && (
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Инженер:</h4>
                            <p className="text-gray-900 dark:text-gray-100">{order.engineer.email}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{order.engineer.company}</p>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Описание проблемы:</h4>
                          <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{order.problem}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Статус:</h4>
                            <p className="text-gray-900 dark:text-gray-100">
                              {order.status === "completed" ? "Завершена" :
                               order.status === "in_progress" ? "В работе" : "Ожидает"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Оплата:</h4>
                            <p className="text-gray-900 dark:text-gray-100">
                              {order.paid ? "Оплачено" : "Не оплачено"}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Цена:</h4>
                            <p className="text-gray-900 dark:text-gray-100">{formatCurrency(order.price)}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Дата создания:</h4>
                            <p className="text-gray-900 dark:text-gray-100">{formatDate(order.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

