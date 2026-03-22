'use client';

import { useState } from 'react';
import { Search, Loader2, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SubmissionStatus {
    title: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export default function CheckStatusPage() {
    const [checkId, setCheckId] = useState('');
    const [status, setStatus] = useState<SubmissionStatus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setStatus(null);
        setLoading(true);

        try {
            const res = await fetch(`/api/submissions/${checkId.trim()}`);
            if (res.ok) {
                const data = await res.json();
                setStatus(data);
            } else if (res.status === 404) {
                setError('Заявка с таким номером не найдена. Проверь правильность ввода.');
            } else {
                setError('Произошла ошибка при проверке. Попробуй позже.');
            }
        } catch (err) {
            setError('Ошибка сети. Проверь соединение.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    icon: CheckCircle2,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    title: 'Принято',
                    desc: 'Твоё предложение уже в системе! Спасибо за вклад.'
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-red-500',
                    bg: 'bg-red-500/10',
                    title: 'Отклонено',
                    desc: 'К сожалению, заявка не прошла модерацию. Возможно, она дублируется или содержит ошибки.'
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-orange-500',
                    bg: 'bg-orange-500/10',
                    title: 'На проверке',
                    desc: 'Админ еще не добрался до твоей заявки. Обычно это занимает немного времени.'
                };
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 py-8">
            <header className="space-y-3 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight">Статус заявки</h1>
                <p className="text-muted-foreground">
                    Введи номер, который ты получил при отправке конспекта или инструмента.
                </p>
            </header>

            <form onSubmit={handleCheck} className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={24} />
                <input
                    type="text"
                    value={checkId}
                    onChange={(e) => setCheckId(e.target.value)}
                    placeholder="Вставь свой checkId (UUID)..."
                    className="w-full bg-card border-2 border-border rounded-2xl py-5 pl-14 pr-32 outline-none focus:border-primary transition-all font-mono text-sm shadow-xl shadow-black/5"
                    required
                />
                <button
                    disabled={loading}
                    type="submit"
                    className="absolute right-3 top-3 bottom-3 bg-primary text-primary-foreground px-6 rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : 'Проверить'}
                </button>
            </form>

            {error && (
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium text-center animate-in fade-in slide-in-from-top-4">
                    {error}
                </div>
            )}

            {status && (
                <div className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Название</p>
                            <h2 className="text-2xl font-black">{status.title}</h2>
                        </div>
                        <div className="px-3 py-1 bg-secondary rounded-lg text-xs font-bold uppercase tracking-widest text-muted-foreground h-fit w-fit">
                            {status.type === 'material' ? 'Конспект' : status.type === 'teacher' ? 'Препод' : 'Инструмент'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                        <div className="space-y-4">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Текущий статус</p>
                            {(() => {
                                const info = getStatusInfo(status.status);
                                const Icon = info.icon;
                                return (
                                    <div className="space-y-3">
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 ${info.bg} ${info.color} rounded-xl font-black border border-current/10`}>
                                            <Icon size={20} />
                                            {info.title}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {info.desc}
                                        </p>
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Создано</p>
                            <div className="space-y-1">
                                <p className="text-lg font-bold">
                                    {new Date(status.createdAt).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                                <p className="text-xs text-muted-foreground">В {new Date(status.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    </div>

                    {status.status === 'approved' && (
                        <div className="pt-6 border-t border-border">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-primary font-black hover:gap-3 transition-all group"
                            >
                                Перейти к материалам
                                <ArrowRight size={18} />
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <div className="text-center pt-8">
                <Link href="/submit" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">
                    Нужно добавить что-то еще?
                </Link>
            </div>
        </div>
    );
}
