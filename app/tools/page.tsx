'use client';

import { useState, useEffect } from 'react';
import {
    Calculator,
    Type,
    Terminal,
    Atom,
    PlusCircle,
    Zap,
    ChevronRight,
    RefreshCcw
} from 'lucide-react';


import Link from 'next/link';

const baseCategories = [
    { title: 'Математика', icon: Calculator, color: 'bg-blue-500/10 text-blue-500' },
    { title: 'Работа с текстом', icon: Type, color: 'bg-emerald-500/10 text-emerald-500' },
    { title: 'Программирование', icon: Terminal, color: 'bg-orange-500/10 text-orange-500' },
    { title: 'Естественные науки', icon: Atom, color: 'bg-purple-500/10 text-purple-500' }
];

export default function ToolsPage() {
    const [tools, setTools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTools = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/tools');
            if (res.ok) {
                const data = await res.json();
                setTools(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTools();
    }, []);

    const categorizedTools = baseCategories.map(cat => ({
        ...cat,
        tools: tools.filter(t => t.category === cat.title || (cat.title === 'Естественные науки' && t.category === 'Разное'))
    }));

    return (
        <div className="space-y-12 pb-20">
            <header className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    <Zap size={14} fill="currentColor" />
                    Powered by БСС
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Полезные инструменты</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Собрали всё самое нужное для учебы: от сложных решалок по матану до проверки твоих курсовых на плагиат.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground group">
                        <RefreshCcw size={48} className="animate-spin mb-4 text-primary" />
                        <p className="font-bold">Настраиваем оборудование...</p>
                    </div>
                ) : (
                    categorizedTools.map((category) => {
                        const Icon = category.icon;
                        return (
                            <section key={category.title} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${category.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold">{category.title}</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {category.tools.map((tool: any) => (
                                        <div
                                            key={tool.name}
                                            onClick={() => tool.url && window.open(tool.url, '_blank')}
                                            className="group flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
                                        >
                                            <div className="space-y-1">
                                                <h3 className="font-bold group-hover:text-primary transition-colors">{tool.name}</h3>
                                                <p className="text-xs text-muted-foreground">{tool.desc}</p>
                                            </div>
                                            <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                        </div>
                                    ))}
                                    {category.tools.length === 0 && (
                                        <div className="p-4 bg-secondary/30 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground italic">
                                            Пока пусто. Есть идеи?
                                        </div>
                                    )}
                                </div>
                            </section>
                        );
                    })
                )}
            </div>

            {/* Suggest Tool CTA */}
            <section className="bg-secondary/50 rounded-3xl p-8 md:p-12 border border-border flex flex-col md:flex-row items-center justify-between gap-8 mt-16">
                <div className="space-y-3 text-center md:text-left">
                    <h2 className="text-3xl font-black">Знаешь крутой сервис?</h2>
                    <p className="text-muted-foreground">
                        Если ты пользуешься удобной софтиной или сайтом, который помогает в учебе — поделись с остальными!
                    </p>
                </div>
                <Link
                    href="/submit"
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-primary/20 whitespace-nowrap"
                >
                    <PlusCircle size={24} />
                    Предложить свой инструмент
                </Link>
            </section>
        </div>
    );
}
