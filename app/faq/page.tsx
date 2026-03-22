'use client';

import { HelpCircle, Calendar, DollarSign, Info, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const scholarshipSchedule = [
    { month: 'Январь', range: '02.02.2026 – 13.02.2026' },
    { month: 'Февраль', range: '02.03.2026 – 17.03.2026' },
    { month: 'Март', range: '27.03.2026 – 15.04.2026' },
    { month: 'Апрель', range: '24.04.2026 – 15.05.2026' },
    { month: 'Май', range: '29.05.2026 – 16.06.2026' },
    { month: 'Июнь', range: '19.06.2026 – 05.07.2026' },
    { month: 'Июль', range: '29.07.2026 – 17.08.2026' },
    { month: 'Август', range: '28.08.2026 – 10.09.2026' },
    { month: 'Сентябрь', range: '02.10.2026 – 20.10.2026' },
    { month: 'Октябрь', range: '29.10.2026 – 13.11.2026' },
    { month: 'Ноябрь', range: '27.11.2026 – 11.12.2026' },
    { month: 'Декабрь', range: '16.12.2026 – 25.12.2026' },
];

const faqs = [
    {
        q: 'Как получить повышенную стипендию?',
        a: 'Для получения повышенной государственной академической стипендии (ПГАС) необходимо иметь достижения в одной или нескольких областях: учебной, научно-исследовательской, общественной, культурно-творческой или спортивной. Подача заявок обычно происходит в начале каждого семестра.'
    },
    {
        q: 'Где найти расписание занятий?',
        a: 'Актуальное расписание всегда доступно на официальном стенде в корпусе, а также в электронном виде через официальные ресурсы колледжа. Мы также работаем над интеграцией расписания прямо в этот портал.'
    },
    {
        q: 'Что делать, если я потерял пропуск?',
        a: 'Вам необходимо обратиться в бюро пропусков или к дежурному администратору для оформления временного пропуска и подачи заявления на восстановление постоянного. Обычно это занимает от 1 до 3 рабочих дней.'
    }
];

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-border rounded-2xl overflow-hidden bg-card transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-secondary/50 transition-colors"
            >
                <span className="font-bold text-lg">{question}</span>
                <ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="p-5 pt-0 text-muted-foreground leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
};

export default function FAQPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <header className="space-y-4 text-center py-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm uppercase tracking-widest mb-4">
                    <HelpCircle size={18} />
                    Помощь студенту
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">Часто задаваемые вопросы</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Здесь собраны ответы на самые популярные вопросы студентов и важные графики выплат.
                </p>
            </header>

            {/* Scholarship Schedule Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-green-500/10 text-green-500 rounded-xl">
                        <DollarSign size={24} />
                    </div>
                    <h2 className="text-2xl font-bold">График выплаты стипендии (2026)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scholarshipSchedule.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <Calendar size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="font-bold">{item.month}</span>
                            </div>
                            <div className="text-sm font-mono bg-secondary px-3 py-1 rounded-lg">
                                {item.range}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                    <Info className="text-primary shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-muted-foreground">
                        <span className="font-bold text-primary">Обратите внимание:</span> Указанные даты являются ориентировочными сроками зачисления средств на банковские карты. В случае задержек обращайтесь в бухгалтерию.
                    </p>
                </div>
            </section>

            {/* General FAQ Section */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                        <MessageSquare size={24} />
                    </div>
                    <h2 className="text-2xl font-bold">Общие вопросы</h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <AccordionItem key={idx} question={faq.q} answer={faq.a} />
                    ))}
                </div>
            </section>
        </div>
    );
}

import { MessageSquare } from 'lucide-react';
