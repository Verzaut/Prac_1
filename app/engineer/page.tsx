"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Request {
  id: number;
  problem: string;
  status: string;
  engineer_id: number | null;
  created_at: string;
  customer_email: string;
}

interface GroupedRequests {
  [company: string]: Request[];
}

export default function EngineerPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    email: string;
    company: string;
    userType: string;
  } | null>(null);
  const [requests, setRequests] = useState<GroupedRequests>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [totalRequests, setTotalRequests] = useState(0);
  const [takingRequestId, setTakingRequestId] = useState<number | null>(null);

  useEffect(() => {
    // Получаем данные пользователя из localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Проверяем, что пользователь - инженер
      if (parsedUser.userType !== "engineer") {
        router.push("/dashboard");
        return;
      }
      
      // Загружаем заявки
      loadRequests();
    } else {
      // Если нет данных пользователя, перенаправляем на страницу входа
      router.push("/");
    }
  }, [router]);

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/engineer/requests");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при загрузке заявок");
        return;
      }

      setRequests(data.requests || {});
      setTotalRequests(data.totalRequests || 0);
    } catch (err) {
      setError("Произошла ошибка при подключении к серверу");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeRequest = async (requestId: number) => {
    if (!user?.id) return;

    setTakingRequestId(requestId);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/engineer/take-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          engineerId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при взятии заявки");
        return;
      }

      setSuccess("Заявка успешно взята в работу!");
      // Перезагружаем заявки
      await loadRequests();
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError("Произошла ошибка при подключении к серверу");
    } finally {
      setTakingRequestId(null);
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

  const getStatusBadge = (status: string) => {
    const statusLabels: Record<string, { label: string; color: string }> = {
      pending: { label: "Ожидает", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" },
      in_progress: { label: "В работе", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" },
      completed: { label: "Завершена", color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" },
    };

    const statusInfo = statusLabels[status] || { label: status, color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400" };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
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

  const companies = Object.keys(requests).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Панель инженера
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Добро пожаловать, {user.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Всего заявок: {totalRequests}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadRequests}
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

          {/* Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}

          {/* Loading state */}
          {isLoading && companies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Загрузка заявок...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Нет доступных заявок от заказчиков
              </p>
            </div>
          ) : (
            /* Requests grouped by company */
            <div className="space-y-8">
              {companies.map((company) => (
                <div
                  key={company}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-900/50"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-600 dark:text-blue-400">🏢</span>
                    {company}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      ({requests[company].length} {requests[company].length === 1 ? "заявка" : "заявок"})
                    </span>
                  </h2>

                  <div className="space-y-4">
                    {requests[company].map((request) => (
                      <div
                        key={request.id}
                        className="bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusBadge(request.status)}
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                Заказчик: {request.customer_email}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Создано: {formatDate(request.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Описание проблемы:
                          </h3>
                          <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                            {request.problem}
                          </p>
                        </div>
                        {request.status === "pending" && !request.engineer_id && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handleTakeRequest(request.id)}
                              disabled={takingRequestId === request.id || isLoading}
                              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {takingRequestId === request.id ? "Обработка..." : "Взять заказ"}
                            </button>
                          </div>
                        )}
                        {request.engineer_id === user.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              ✓ Вы взяли этот заказ
                            </span>
                          </div>
                        )}
                        {request.engineer_id && request.engineer_id !== user.id && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Заказ уже взят другим инженером
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

