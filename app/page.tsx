"use client";

import { useState } from "react";

type RegistrationType = "engineer" | "manager" | "leader" | "customer" | null;

export default function Home() {
  const [selectedType, setSelectedType] = useState<RegistrationType>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    company: "",
    position: "",
    experience: "",
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Здесь будет логика отправки формы
    alert(`Регистрация ${registrationTypes.find(t => t.id === selectedType)?.title} завершена!`);
  };

  const getFormFields = () => {
    const baseFields = [
      { name: "name", label: "ФИО", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Пароль", type: "password", required: true },
      { name: "confirmPassword", label: "Подтвердите пароль", type: "password", required: true },
      { name: "phone", label: "Телефон", type: "tel", required: true },
    ];

    switch (selectedType) {
      case "engineer":
        return [
          ...baseFields,
          { name: "company", label: "Компания", type: "text", required: true },
          { name: "position", label: "Должность", type: "text", required: true },
          { name: "experience", label: "Опыт работы (лет)", type: "number", required: true },
        ];
      case "manager":
        return [
          ...baseFields,
          { name: "company", label: "Компания", type: "text", required: true },
          { name: "position", label: "Должность", type: "text", required: true },
        ];
      case "leader":
        return [
          ...baseFields,
          { name: "company", label: "Компания", type: "text", required: true },
          { name: "position", label: "Должность", type: "text", required: true },
        ];
      case "customer":
        return [
          ...baseFields,
          { name: "company", label: "Название компании", type: "text", required: true },
        ];
      default:
        return [];
    }
  };

  if (selectedType) {
    const selectedRegistration = registrationTypes.find(t => t.id === selectedType);
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
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
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                    phone: "",
                    company: "",
                    position: "",
                    experience: "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {getFormFields().map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData]}
                    onChange={handleInputChange}
                    required={field.required}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                  />
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType(null);
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      confirmPassword: "",
                      phone: "",
                      company: "",
                      position: "",
                      experience: "",
                    });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-6 py-3 ${selectedRegistration?.color} text-white rounded-lg font-medium ${selectedRegistration?.hoverColor} transition-colors shadow-lg`}
                >
                  Зарегистрироваться
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
              onClick={() => setSelectedType(type.id)}
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
      </div>
    </div>
  );
}
