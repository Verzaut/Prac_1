"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RegistrationType = "engineer" | "manager" | "leader" | "customer" | null;
type ViewMode = "login" | "registration-select" | "registration-form";

export default function Home() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("login");
  const [selectedType, setSelectedType] = useState<RegistrationType>(null);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registrationData, setRegistrationData] = useState({
    email: "",
    password: "",
    company: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const registrationTypes = [
    {
      id: "engineer" as const,
      title: "Регистрация для инженеров",
      description: "Для специалистов технических направлений",
      icon: "🔧",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
    },
    {
      id: "manager" as const,
      title: "Регистрация для менеджеров",
      description: "Для управляющих проектами и командами",
      icon: "👔",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
    },
    {
      id: "leader" as const,
      title: "Регистрация для руководителей",
      description: "Для директоров и топ-менеджмента",
      icon: "👑",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
    },
    {
      id: "customer" as const,
      title: "Регистрация для заказчиков",
      description: "Для клиентов и заказчиков услуг",
      icon: "💼",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
    },
  ];

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegistrationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegistrationData({
      ...registrationData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка при входе');
        return;
      }

      // Сохраняем данные пользователя в localStorage
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setSuccess(`Добро пожаловать, ${data.user.email}!`);
      
      // Перенаправляем на соответствующую страницу в зависимости от типа пользователя
      setTimeout(() => {
        if (data.user.userType === "customer") {
          router.push("/customer");
        } else if (data.user.userType === "engineer") {
          router.push("/engineer");
        } else if (data.user.userType === "manager") {
          router.push("/manager");
        } else if (data.user.userType === "leader") {
          router.push("/leader");
        } else {
          // Для других типов пользователей можно создать отдельные страницы
          router.push("/dashboard");
        }
      }, 1000);
    } catch (err) {
      setError('Произошла ошибка при подключении к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registrationData.email,
          password: registrationData.password,
          company: registrationData.company,
          userType: selectedType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка при регистрации');
        return;
      }

      setSuccess('Регистрация успешно завершена! Выполняется вход...');
      
      // Автоматически входим после регистрации
      setTimeout(async () => {
        try {
          const loginResponse = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: registrationData.email,
              password: registrationData.password,
            }),
          });

          const loginData = await loginResponse.json();

          if (loginResponse.ok) {
            // Сохраняем данные пользователя в localStorage
            localStorage.setItem("user", JSON.stringify(loginData.user));
            
            // Перенаправляем на соответствующую страницу
            if (loginData.user.userType === "customer") {
              router.push("/customer");
            } else if (loginData.user.userType === "engineer") {
              router.push("/engineer");
            } else if (loginData.user.userType === "manager") {
              router.push("/manager");
            } else if (loginData.user.userType === "leader") {
              router.push("/leader");
            } else {
              router.push("/dashboard");
            }
          } else {
            // Если автоматический вход не удался, переходим на страницу входа
            setRegistrationData({ email: "", password: "", company: "" });
            setSelectedType(null);
            setViewMode("login");
            setSuccess(null);
            setError("Регистрация успешна, но автоматический вход не удался. Пожалуйста, войдите вручную.");
          }
        } catch (err) {
          // Если автоматический вход не удался, переходим на страницу входа
          setRegistrationData({ email: "", password: "", company: "" });
          setSelectedType(null);
          setViewMode("login");
          setSuccess(null);
          setError("Регистрация успешна, но автоматический вход не удался. Пожалуйста, войдите вручную.");
        }
      }, 1500);
    } catch (err) {
      setError('Произошла ошибка при подключении к серверу');
    } finally {
      setIsLoading(false);
    }
  };

  // Форма регистрации (только email и пароль)
  if (viewMode === "registration-form" && selectedType) {
    const selectedRegistration = registrationTypes.find(t => t.id === selectedType);
  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedRegistration?.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedRegistration?.title}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedRegistration?.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedType(null);
                  setViewMode("registration-select");
                  setRegistrationData({ email: "", password: "", company: "" });
                  setError(null);
                  setSuccess(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="space-y-6">
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
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={registrationData.email}
                  onChange={handleRegistrationInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Пароль
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={registrationData.password}
                  onChange={handleRegistrationInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Введите пароль"
                />
              </div>

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
                  value={registrationData.company}
                  onChange={handleRegistrationInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Название компании"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType(null);
                    setViewMode("registration-select");
                    setRegistrationData({ email: "", password: "", company: "" });
                    setError(null);
                    setSuccess(null);
                  }}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 px-6 py-3 ${selectedRegistration?.color} text-white rounded-lg font-medium ${selectedRegistration?.hoverColor} transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Выбор типа регистрации
  if (viewMode === "registration-select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Регистрация
          </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Выберите тип регистрации, который подходит вам
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  setViewMode("registration-form");
                  setError(null);
                  setSuccess(null);
                }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${type.color} text-white rounded-lg p-4 text-3xl group-hover:scale-110 transition-transform`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {type.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {type.description}
                    </p>
                  </div>
                  <svg
                    className="w-6 h-6 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => {
                setViewMode("login");
                setSelectedType(null);
                setError(null);
                setSuccess(null);
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              ← Вернуться к входу
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Форма входа (по умолчанию)
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Вход в аккаунт
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Войдите в свой аккаунт
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
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
                htmlFor="login-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                id="login-email"
                name="email"
                value={loginData.email}
                onChange={handleLoginInputChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Пароль
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                id="login-password"
                name="password"
                value={loginData.password}
                onChange={handleLoginInputChange}
                required
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Введите пароль"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Нет аккаунта?{" "}
              <button
                onClick={() => {
                  setViewMode("registration-select");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Зарегистрироваться
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
