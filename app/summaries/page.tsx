'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, ArrowRight, Sparkles, BookText } from 'lucide-react';

export default function SummariesEntryPage() {
    const [inputValue, setInputValue] = useState('');
    const router = useRouter();

    const extractUuid = (str: string) => {
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
        const match = str.match(uuidRegex);
        return match ? match[0] : str.trim();
    };

    const handleOpen = (e: React.FormEvent) => {
        e.preventDefault();
        const extracted = extractUuid(inputValue);
        if (extracted) {
            router.push(`/summary/${extracted}`);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-sm uppercase tracking-widest mb-4">
                    <Sparkles size={16} />
                    AI Конспекты
                </div>

                <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                    Открой конспект в <span className="text-primary italic">один клик</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    Вставь ссылку на конспект или его UUID, чтобы просмотреть его в удобном формате.
                </p>

                <form onSubmit={handleOpen} className="relative group max-w-lg mx-auto w-full pt-4">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-all duration-500 rounded-full" />
                    <div className="relative flex flex-col sm:flex-row gap-3 p-2 bg-card border border-border rounded-3xl shadow-2xl">
                        <div className="flex-grow relative">
                            <BookText className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Вставьте ссылку на конспект..."
                                className="w-full bg-secondary/50 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary transition-all font-mono text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Открыть
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                    {[
                        { title: 'Красиво', desc: 'Удобная верстка для чтения', icon: Sparkles },
                        { title: 'Быстро', desc: 'Мгновенная загрузка через API', icon: ArrowRight },
                        { title: 'Доступно', desc: 'Работает на всех устройствах', icon: BookOpen }
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-secondary/30 rounded-3xl border border-border/50 text-left space-y-2">
                            <item.icon className="text-primary mb-2" size={24} />
                            <h3 className="font-bold text-lg">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
