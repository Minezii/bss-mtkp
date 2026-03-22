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
    RefreshCcw,
    GraduationCap,
    Clock,
    Plus,
    Trash2
} from 'lucide-react';
import Link from 'next/link';

const baseCategories = [
    { title: 'Математика', icon: Calculator, color: 'bg-blue-500/10 text-blue-500 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]' },
    { title: 'Работа с текстом', icon: Type, color: 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]' },
    { title: 'Программирование', icon: Terminal, color: 'bg-orange-500/10 text-orange-500 shadow-[0_0_15px_-3px_rgba(249,115,22,0.3)]' },
    { title: 'Естественные науки', icon: Atom, color: 'bg-purple-500/10 text-purple-500 shadow-[0_0_15px_-3px_rgba(168,85,247,0.3)]' }
];

export default function ToolsPage() {
    const [tools, setTools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // GPA Calculator State
    const [grades, setGrades] = useState<number[]>([5, 4, 5]);
    const [newGrade, setNewGrade] = useState<string>('');

    // Session Countdown State (Target: May 20, 2026 as example)
    const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number }>({ days: 0, hours: 0 });

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

        // Calculate countdown
        const target = new Date('2026-05-20T00:00:00');
        const now = new Date();
        const diff = target.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft({ days: Math.max(0, days), hours: Math.max(0, hours) });
    }, []);

    const addGrade = () => {
        const val = parseInt(newGrade);
        if (val >= 2 && val <= 5) {
            setGrades([...grades, val]);
            setNewGrade('');
        }
    };

    const removeGrade = (index: number) => {
        setGrades(grades.filter((_, i) => i !== index));
    };

    const avgGPA = (grades.reduce((a, b) => a + b, 0) / (grades.length || 1)).toFixed(2);

    const categorizedTools = baseCategories.map(cat => ({
        ...cat,
        tools: tools.filter(t => t.category === cat.title)
    }));

    return (
        <div className="space-y-12 pb-20">
            <header className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-primary/20">
                    <Zap size={14} fill="currentColor" />
                    Powered by БСС
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                    Инструментарий
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                    Собрали всё самое нужное для учебы: от сложных решалок до полезных калькуляторов.
                </p>
            </header>

            {/* Interactive Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* GPA Calculator Widget */}
                <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
                        <GraduationCap size={120} />
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                                <Calculator size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">Калькулятор Ср. Балла</h2>
                                <p className="text-sm text-muted-foreground">Твой путь к повышенной стипендии</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {grades.map((g, i) => (
                                <button
                                    key={i}
                                    onClick={() => removeGrade(i)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg transition-all hover:scale-110 hover:shadow-lg ${g === 5 ? 'bg-emerald-500 text-white' :
                                        g === 4 ? 'bg-blue-500 text-white' :
                                            g === 3 ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                            <div className="flex gap-2 items-center ml-2 border-l border-border pl-4">
                                <input
                                    type="number"
                                    min="2"
                                    max="5"
                                    value={newGrade}
                                    onChange={(e) => setNewGrade(e.target.value)}
                                    placeholder="2-5"
                                    className="w-16 h-10 bg-secondary rounded-xl px-3 outline-none focus:ring-2 ring-primary/50 text-center font-bold"
                                    onKeyPress={(e) => e.key === 'Enter' && addGrade()}
                                />
                                <button
                                    onClick={addGrade}
                                    className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 flex items-end justify-between border-t border-border">
                            <div className="space-y-1">
                                <div className="text-4xl font-black text-primary">{avgGPA}</div>
                                <div className="text-xs uppercase tracking-widest font-black text-muted-foreground">Текущий средний балл</div>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${parseFloat(avgGPA) >= 4.5 ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' :
                                parseFloat(avgGPA) >= 4.0 ? 'bg-blue-500/20 text-blue-500 border border-blue-500/20' :
                                    'bg-orange-500/20 text-orange-500 border border-orange-500/20'
                                }`}>
                                {parseFloat(avgGPA) >= 4.5 ? 'Отлично' : parseFloat(avgGPA) >= 4.0 ? 'Хорошо' : 'Нужно поднажать'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Countdown Widget */}
                <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                        <Clock size={100} />
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <h2 className="font-black text-xl">До сессии</h2>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-black tabular-nums">XX</span>
                            <span className="text-xl font-medium opacity-80">дней</span>
                        </div>
                        <p className="text-sm font-medium opacity-70">
                            Копи конспекты и готовь зачетку, <br />дата скоро будет.
                        </p>
                    </div>

                    <div className="mt-8 relative z-10">
                        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-1000"
                                style={{ width: `0%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Existing Tools List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
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
                                            className="group flex items-center justify-between p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer"
                                        >
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{tool.name}</h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
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
            <section className="bg-card rounded-[2.5rem] p-8 md:p-12 border border-border flex flex-col md:flex-row items-center justify-between gap-8 mt-16 shadow-lg shadow-black/5">
                <div className="space-y-3 text-center md:text-left">
                    <h2 className="text-3xl font-black">Знаешь крутой сервис?</h2>
                    <p className="text-muted-foreground">
                        Если ты пользуешься удобной софтиной или сайтом, который помогает в учебе — поделись с остальными!
                    </p>
                </div>
                <Link
                    href="/submit"
                    className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-primary/30 whitespace-nowrap active:scale-95"
                >
                    <PlusCircle size={24} />
                    Предложить свой инструмент
                </Link>
            </section>
        </div>
    );
}
