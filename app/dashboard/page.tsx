"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    email: string;
    company: string;
    userType: string;
  } | null>(null);

  useEffect(() => {
    // Получаем данные пользователя из localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } else {
      // Если нет данных пользователя, перенаправляем на страницу входа
      router.push("/");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
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

  const userTypeLabels: Record<string, string> = {
    engineer: "Инженер",
    manager: "Менеджер",
    leader: "Руководитель",
    customer: "Заказчик",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Панель управления
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Добро пожаловать, {user.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Тип аккаунта: {userTypeLabels[user.userType] || user.userType}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Выйти
            </button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Информация
            </h2>
            <p className="text-blue-700 dark:text-blue-400">
              Страница для {userTypeLabels[user.userType] || user.userType} находится в разработке.
            </p>
            <p className="text-blue-700 dark:text-blue-400 mt-2">
              Компания: {user.company}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

