"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Request {
  id: number;
  company: string;
  problem: string;
  status: string;
  paid: boolean;
  is_valid: boolean;
  created_at: string;
}

export default function CustomerPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    email: string;
    company: string;
    userType: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    company: "",
    problem: "",
  });
  const [requests, setRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"create" | "requests">("create");

  useEffect(() => {
    // Получаем данные пользователя из localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData((prev) => ({ ...prev, company: parsedUser.company || "" }));
      loadRequests(parsedUser.id);
    } else {
      // Если нет данных пользователя, перенаправляем на страницу входа
      router.push("/");
    }
  }, [router]);

  const loadRequests = async (userId: number) => {
    setIsLoadingRequests(true);
    try {
      const response = await fetch(`/api/customer/my-requests?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при загрузке заявок");
        return;
      }

      setRequests(data.requests || []);
    } catch (err) {
      setError("Произошла ошибка при подключении к серверу");
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/customer/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
          company: formData.company,
          problem: formData.problem,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при отправке заявки");
        return;
      }

      setSuccess("Заявка успешно отправлена! Инженер свяжется с вами.");
      setFormData({ company: "", problem: "" });
      // Обновляем список заявок
      if (user?.id) {
        await loadRequests(user.id);
      }
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError("Произошла ошибка при подключении к серверу");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayRequest = async (requestId: number) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/customer/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Ошибка при оплате заказа");
        return;
      }

      setSuccess("Заказ успешно оплачен!");
      // Обновляем список заявок
      await loadRequests(user.id);
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Панель заказчика
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Добро пожаловать, {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Выйти
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "create"
                  ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Создать заявку
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 font-medium transition-colors ${
                activeTab === "requests"
                  ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Мои заявки ({requests.length})
            </button>
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

          {/* Create Request Form */}
          {activeTab === "create" && (
            <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Компания
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Название вашей компании"
              />
            </div>

            <div>
              <label
                htmlFor="problem"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Описание проблемы
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                id="problem"
                name="problem"
                value={formData.problem}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                placeholder="Опишите проблему, с которой может помочь инженер..."
              />
            </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Отправка..." : "Отправить заявку"}
              </button>
            </form>
          )}

          {/* Requests List */}
          {activeTab === "requests" && (
            <div>
              {isLoadingRequests ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400">Загрузка заявок...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    У вас пока нет заявок
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className={`border rounded-lg p-5 ${
                        !request.is_valid
                          ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            {getStatusBadge(request.status)}
                            {request.paid ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                ✓ Оплачено
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                ✗ Не оплачено
                              </span>
                            )}
                            {!request.is_valid && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                ⚠ Недействителен
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            Компания: <span className="font-medium">{request.company}</span>
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Создано: {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 mb-4">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Описание проблемы:
                        </h3>
                        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                          {request.problem}
                        </p>
                      </div>
                      {!request.paid && request.is_valid && (
                        <button
                          onClick={() => handlePayRequest(request.id)}
                          disabled={isLoading}
                          className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Обработка..." : "Оплатить заказ"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

