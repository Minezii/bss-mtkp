'use client';

import { useState } from 'react';
import {
    Type,
    Search,
    Clipboard,
    RotateCcw,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Zap,
    SpellCheck
} from 'lucide-react';
import Link from 'next/link';

interface YandexError {
    code: number;
    pos: number;
    row: number;
    col: number;
    len: number;
    word: string;
    s: string[];
}

export default function SpellCheckPage() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<YandexError[]>([]);
    const [checked, setChecked] = useState(false);

    const checkSpelling = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setChecked(false);
        try {
            // Yandex.Speller API call (using POST for longer texts)
            const response = await fetch('https://speller.yandex.net/services/spellservice.json/checkText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `text=${encodeURIComponent(text)}`,
            });
            if (response.ok) {
                const data = await response.json();
                setErrors(data);
                setChecked(true);
            }
        } catch (error) {
            console.error('Spell check error:', error);
        } finally {
            setLoading(false);
        }
    };

    const applySuggestion = (errorIndex: number, suggestion: string) => {
        const error = errors[errorIndex];
        const newText = text.slice(0, error.pos) + suggestion + text.slice(error.pos + error.len);

        // Adjust positions for remaining errors
        const diff = suggestion.length - error.len;
        const newErrors = errors
            .filter((_, i) => i !== errorIndex)
            .map(err => {
                if (err.pos > error.pos) {
                    return { ...err, pos: err.pos + diff };
                }
                return err;
            });

        setText(newText);
        setErrors(newErrors);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    const reset = () => {
        setText('');
        setErrors([]);
        setChecked(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <Link
                href="/tools"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
            >
                <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <ArrowLeft size={18} />
                </div>
                <span className="font-bold">Назад к инструментам</span>
            </Link>

            <header className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-500/20">
                    <SpellCheck size={14} fill="currentColor" />
                    Авторский инструмент
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    Проверка орфографии
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                    Быстрая проверка грамотности русского языка. Опечатки, лишние буквы и сложные слова больше не проблема.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-6">
                <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl ring-1 ring-black/5">
                    <div className="p-1">
                        <textarea
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                setChecked(false);
                                setErrors([]);
                            }}
                            placeholder="Вставьте сюда ваш текст для проверки..."
                            className="w-full min-h-[300px] bg-transparent p-8 outline-none text-lg resize-none placeholder:text-muted-foreground/50 transition-all focus:min-h-[400px]"
                        />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-secondary/30 border-t border-border">
                        <div className="flex gap-4">
                            <button
                                onClick={checkSpelling}
                                disabled={loading || !text.trim()}
                                className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/30"
                            >
                                {loading ? (
                                    <RotateCcw className="animate-spin" size={20} />
                                ) : (
                                    <Zap size={20} fill="currentColor" />
                                )}
                                {loading ? 'Проверяем...' : 'Проверить текст'}
                            </button>
                            <button
                                onClick={reset}
                                className="p-3 bg-card border border-border rounded-2xl hover:bg-secondary transition-colors"
                            >
                                <RotateCcw size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <button
                            onClick={copyToClipboard}
                            className="bg-card border border-border px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-secondary transition-colors"
                        >
                            <Clipboard size={18} />
                            Копировать
                        </button>
                    </div>
                </div>

                {checked && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                        {errors.length === 0 ? (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex items-center gap-6">
                                <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/40">
                                    <CheckCircle2 size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-emerald-600">Ошибок не найдено!</h3>
                                    <p className="text-emerald-600/70 font-medium">Текст выглядит грамотным. Можно смело отправлять.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <AlertCircle className="text-orange-500" size={24} />
                                    <h3 className="text-xl font-black">
                                        Найдено <span className="text-orange-500">{errors.length}</span> опечаток
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {errors.map((error, idx) => (
                                        <div key={idx} className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-md group border-l-4 border-l-orange-500">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Найдено в слове:</span>
                                                <div className="px-3 py-1 bg-orange-500/10 text-orange-600 rounded-full text-xs font-bold">
                                                    позиция {error.pos}
                                                </div>
                                            </div>
                                            <div className="text-2xl font-black line-through text-muted-foreground/40">{error.word}</div>
                                            <div className="flex flex-wrap gap-2">
                                                {error.s.map((suggestion, sIdx) => (
                                                    <button
                                                        key={sIdx}
                                                        onClick={() => applySuggestion(idx, suggestion)}
                                                        className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 shadow-md"
                                                    >
                                                        {suggestion}
                                                    </button>
                                                ))}
                                                {error.s.length === 0 && (
                                                    <div className="text-sm text-muted-foreground italic">Вариантов не найдено</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <section className="bg-secondary/30 rounded-3xl p-8 border border-border flex gap-6 items-start">
                <div className="p-3 bg-background rounded-2xl border border-border">
                    <Search className="text-primary" size={24} />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold">Как это работает?</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Инструмент проверяет орфографию для русского и английского языков, находя опечатки и предлагая варианты замены в один клик.
                    </p>
                </div>
            </section>
        </div>
    );
}
