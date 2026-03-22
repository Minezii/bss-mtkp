'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, Clock, XCircle, ArrowRight, UserPlus, LogIn, LayoutGrid, FileText, User, Wrench, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AuthModal from '@/components/AuthModal';

interface SubmissionStatus {
    id: number;
    checkId: string;
    title: string;
    type: string;
    status: 'pending' | 'approved' | 'rejected' | 'draft';
    resultId?: number;
    createdAt: string;
}

export default function CheckStatusPage() {
    const [user, setUser] = useState<any>(null);
    const [submissions, setSubmissions] = useState<SubmissionStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Legacy check states
    const [checkId, setCheckId] = useState('');
    const [manualStatus, setManualStatus] = useState<SubmissionStatus | null>(null);
    const [manualLoading, setManualLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUserSubmissions = async () => {
        try {
            const res = await fetch('/api/submissions/user');
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const savedUser = localStorage.getItem('bss_user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            fetchUserSubmissions();
        } else {
            setLoading(false);
        }
    }, []);

    const handleManualCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setManualStatus(null);
        setManualLoading(true);

        try {
            const res = await fetch(`/api/submissions/${checkId.trim()}`);
            if (res.ok) {
                const data = await res.json();
                setManualStatus(data);
            } else if (res.status === 404) {
                setError('Заявка не найдена. Проверь ID.');
            } else {
                setError('Ошибка при проверке.');
            }
        } catch (err) {
            setError('Ошибка сети.');
        } finally {
            setManualLoading(false);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'approved':
                return {
                    icon: CheckCircle2,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    label: 'Принято',
                };
            case 'rejected':
                return {
                    icon: XCircle,
                    color: 'text-red-500',
                    bg: 'bg-red-500/10',
                    label: 'Отклонено',
                };
            default:
                return {
                    icon: Clock,
                    color: 'text-orange-500',
                    bg: 'bg-orange-500/10',
                    label: 'Ожидает',
                };
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 py-8 px-4">
            <header className="space-y-4 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">Отслеживание</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Узнай, как обстоят дела с твоими предложениями. Мы ценим каждый твой вклад!
                </p>
            </header>

            {!user ? (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                    {/* Guest Prompt */}
                    <div className="lg:col-span-3 bg-primary/5 border-2 border-primary/20 rounded-[2.5rem] p-8 md:p-12 space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <UserPlus size={120} className="text-primary" />
                        </div>

                        <div className="space-y-4 relative z-10">
                            <h2 className="text-3xl font-black tracking-tight">Стань частью БСС</h2>
                            <p className="text-muted-foreground leading-relaxed text-lg">
                                Создай аккаунт, чтобы автоматически отслеживать все свои будущие заявки без ввода кодов.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="flex-grow bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl shadow-primary/20 active:scale-95"
                            >
                                <LogIn size={24} />
                                Войти / Создать
                            </button>
                        </div>
                    </div>

                    {/* Manual Check Field */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-card border border-border rounded-[2rem] p-8 space-y-6 shadow-xl">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Search size={20} className="text-primary" />
                                    Разовая проверка
                                </h3>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Если нет аккаунта</p>
                            </div>

                            <form onSubmit={handleManualCheck} className="space-y-4">
                                <input
                                    type="text"
                                    value={checkId}
                                    onChange={(e) => setCheckId(e.target.value)}
                                    placeholder="UUID заявки..."
                                    className="w-full bg-secondary/50 border-none rounded-xl py-4 px-5 outline-none focus:ring-2 focus:ring-primary transition-all font-mono text-xs"
                                    required
                                />
                                <button
                                    disabled={manualLoading}
                                    type="submit"
                                    className="w-full bg-secondary text-secondary-foreground py-4 rounded-xl font-black text-sm hover:bg-muted transition-all flex items-center justify-center gap-2"
                                >
                                    {manualLoading ? <Loader2 className="animate-spin" size={18} /> : 'Проверить ID'}
                                </button>
                            </form>

                            {error && (
                                <p className="text-red-500 text-xs font-bold text-center bg-red-500/5 py-3 rounded-lg border border-red-500/10">
                                    {error}
                                </p>
                            )}
                        </div>

                        {manualStatus && (
                            <div className="bg-card border border-border rounded-[2rem] p-6 animate-in slide-in-from-bottom-4 flex items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="font-black text-sm line-clamp-1">{manualStatus.title}</h4>
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const info = getStatusInfo(manualStatus.status);
                                            const Icon = info.icon;
                                            return (
                                                <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${info.color}`}>
                                                    <Icon size={12} />
                                                    {info.label}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-secondary rounded-xl text-primary">
                                        {manualStatus.type === 'material' ? <FileText size={20} /> : manualStatus.type === 'teacher' ? <User size={20} /> : <Wrench size={20} />}
                                    </div>
                                    {manualStatus.status === 'approved' && (
                                        <Link
                                            href={
                                                manualStatus.type === 'material' ? `/material/${manualStatus.resultId}` :
                                                    manualStatus.type === 'teacher' ? `/teachers` : `/tools`
                                            }
                                            className="p-2 bg-primary text-primary-foreground rounded-lg hover:scale-105 transition-transform"
                                        >
                                            <ChevronRight size={18} />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Всего заявок', value: submissions.length, icon: LayoutGrid, color: 'text-blue-500' },
                            { label: 'Одобрено', value: submissions.filter(s => s.status === 'approved').length, icon: CheckCircle2, color: 'text-emerald-500' },
                            { label: 'На проверке', value: submissions.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-orange-500' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-card border border-border rounded-3xl p-6 flex flex-col justify-between h-32 hover:border-primary/30 transition-colors">
                                <div className="flex justify-between items-center text-muted-foreground">
                                    <span className="text-[10px] font-black uppercase tracking-widest">{stat.label}</span>
                                    <stat.icon size={16} className={stat.color} />
                                </div>
                                <span className="text-4xl font-black">{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-border flex justify-between items-center">
                            <h2 className="text-xl font-black">Твои материалы</h2>
                            <Link href="/submit" className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Добавить еще +</Link>
                        </div>

                        {submissions.length > 0 ? (
                            <div className="divide-y divide-border">
                                {submissions.map((sub) => {
                                    const info = getStatusInfo(sub.status);
                                    const StatusIcon = info.icon;
                                    return (
                                        <div key={sub.id} className="p-6 md:p-8 hover:bg-muted/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-6">
                                                <div className="p-4 bg-secondary rounded-2xl group-hover:bg-primary/5 transition-colors text-primary">
                                                    {sub.type === 'material' ? <FileText size={24} /> : sub.type === 'teacher' ? <User size={24} /> : <Wrench size={24} />}
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-lg font-black group-hover:text-primary transition-colors">{sub.title}</h3>
                                                    <p className="text-xs text-muted-foreground font-bold flex items-center gap-2">
                                                        {new Date(sub.createdAt).toLocaleDateString('ru-RU')}
                                                        <span className="opacity-30">•</span>
                                                        {sub.type === 'material' ? 'Конспект' : sub.type === 'teacher' ? 'Преподаватель' : 'Инструмент'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-6">
                                                <div className={`flex items-center gap-2 px-4 py-2 ${info.bg} ${info.color} rounded-xl font-black text-xs border border-current/10 whitespace-nowrap`}>
                                                    <StatusIcon size={14} />
                                                    {info.label}
                                                </div>
                                                {sub.status === 'approved' && (
                                                    <Link
                                                        href={
                                                            sub.type === 'material' ? `/material/${sub.resultId}` :
                                                                sub.type === 'teacher' ? `/teachers` : `/tools`
                                                        }
                                                        className="p-2.5 bg-secondary rounded-xl hover:bg-primary hover:text-white transition-all"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-24 text-center space-y-4">
                                <div className="p-4 bg-secondary rounded-full w-fit mx-auto text-muted-foreground">
                                    <LayoutGrid size={40} />
                                </div>
                                <p className="text-muted-foreground font-bold italic">Ты еще ничего не отправлял. Пора это исправить!</p>
                                <Link
                                    href="/submit"
                                    className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-black transition-all hover:scale-105 active:scale-95"
                                >
                                    Отправить первую заявку
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={(userData) => {
                    localStorage.setItem('bss_user', JSON.stringify(userData));
                    setUser(userData);
                    fetchUserSubmissions();
                    setIsAuthModalOpen(false);
                }}
            />
        </div>
    );
}
