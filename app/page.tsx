'use client';

import { useState, useEffect } from 'react';
import {
  BookOpen,
  Users,
  Wrench,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      title: "База преподавателей",
      description: "Честные отзывы и рейтинги преподавателей от студентов всех курсов.",
      icon: Users,
      href: "/teachers",
      color: "blue"
    },
    {
      title: "Учебные материалы",
      description: "Конспекты, лабы и готовые домашние задания в одном месте.",
      icon: BookOpen,
      href: "/teachers", // Materials were originally directed to teachers for filtering
      color: "indigo"
    },
    {
      title: "Инструменты",
      description: "Полезные калькуляторы и сервисы для упрощения учебного процесса.",
      icon: Wrench,
      href: "/tools",
      color: "slate"
    }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center space-y-8 relative z-10">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-pulse">
              <Sparkles size={16} />
              <span>Версия 2.0 уже доступна</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              БСС <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">МТКП</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Единая точка входа для студентов МТКП. <br />
              Всё, что нужно для учебы, в одном удобном интерфейсе.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/teachers"
                className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-blue-600/20 hover:scale-105"
              >
                Начать обучение
                <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                href="/submit"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-semibold transition-all duration-300 border border-slate-700"
              >
                Поделиться материалом
              </Link>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-600/30 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/30 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8 px-4">
        {features.map((feature, index) => (
          <Link
            key={index}
            href={feature.href}
            className="group p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-600/10 flex items-center justify-center mb-6 border border-${feature.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
              <feature.icon className={`text-${feature.color}-400`} size={28} />
            </div>

            <h3 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
              {feature.title}
            </h3>

            <p className="text-slate-400 group-hover:text-slate-300 transition-colors leading-relaxed">
              {feature.description}
            </p>
          </Link>
        ))}
      </section>

      {/* Stats Section */}
      <section className="rounded-[40px] bg-slate-900/80 border border-slate-800 p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-600/5" />
        <div className="grid md:grid-cols-3 gap-12 text-center relative z-10">
          {[
            { label: "Студентов", value: "500+", icon: GraduationCap },
            { label: "Материалов", value: "1000+", icon: BookOpen },
            { label: "Обновлено сегодня", value: "24/7", icon: CheckCircle2 }
          ].map((stat, i) => (
            <div key={i} className="space-y-3">
              <div className="inline-flex p-3 rounded-xl bg-slate-800 mb-2">
                <stat.icon size={24} className="text-blue-400" />
              </div>
              <div className="text-4xl font-bold text-white">{stat.value}</div>
              <div className="text-slate-400 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Admin Quick Access (for demo purposes) */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link
          href="/admin"
          className="flex items-center space-x-2 px-4 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full text-slate-400 hover:text-white hover:border-blue-500 transition-all shadow-2xl"
        >
          <LayoutDashboard size={16} />
          <span className="text-sm font-medium">Панель управления</span>
        </Link>
      </div>
    </div>
  );
}
