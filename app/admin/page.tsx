'use client';

import { useState, useEffect } from 'react';
import { LogOut, Check, X, Clock, FileText, UserPlus, Wrench, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ materials: 0, teachers: 0, tools: 0 });
    const router = useRouter();

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/submissions');
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
        fetchSubmissions();
        // In a real app, we'd fetch stats here too
    }, []);

    const handleModeration = async (id: number, action: 'approve' | 'reject') => {
        try {
            const res = await fetch('/api/admin/moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action }),
            });

            if (res.ok) {
                setSubmissions(submissions.filter(s => s.id !== id));
            } else {
                alert('Ошибка при модерации');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.refresh();
        router.push('/admin/login');
    };

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight">Панель управления</h1>
                    <p className="text-muted-foreground font-medium italic">БСС МТКП — Административный сектор</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchSubmissions}
                        className="p-2 bg-secondary text-secondary-foreground rounded-xl hover:bg-muted transition-all"
                        title="Обновить"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    >
                        <LogOut size={16} />
                        Выйти
                    </button>
                </div>
            </header>

            <section className="space-y-6">
                <h2 className="text-2xl font-extrabold flex items-center gap-3">
                    Новые заявки
                    <span className="bg-primary text-primary-foreground text-sm px-3 py-0.5 rounded-full shadow-lg">
                        {submissions.length}
                    </span>
                </h2>

                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/5 -mx-4 md:mx-0">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="bg-secondary/50 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] border-b border-border">
                                    <th className="px-6 py-5">Тип</th>
                                    <th className="px-6 py-5">Название / Тема</th>
                                    <th className="px-6 py-5">Автор</th>
                                    <th className="px-6 py-5">Дата</th>
                                    <th className="px-6 py-5 text-right">Действие</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {submissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-muted/30 transition-colors text-sm group">
                                        <td className="px-6 py-5">
                                            <div className="p-2 bg-secondary rounded-lg w-fit group-hover:bg-primary/5 transition-colors">
                                                {sub.type === 'material' && <FileText size={18} className="text-blue-500" />}
                                                {sub.type === 'teacher' && <UserPlus size={18} className="text-emerald-500" />}
                                                {sub.type === 'tool' && <Wrench size={18} className="text-orange-500" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-foreground">{sub.title}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1 max-w-[200px]">{sub.content}</div>
                                        </td>
                                        <td className="px-6 py-5 text-muted-foreground font-medium">{sub.author}</td>
                                        <td className="px-6 py-5 text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleModeration(sub.id, 'approve')}
                                                    className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-90 shadow-sm"
                                                    title="Одобрить"
                                                >
                                                    <Check size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleModeration(sub.id, 'reject')}
                                                    className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all active:scale-90 shadow-sm"
                                                    title="Отклонить"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {submissions.length === 0 && !loading && (
                        <div className="py-24 text-center text-muted-foreground italic font-medium">
                            Все заявки обработаны. Отдыхай, админ! ☕
                        </div>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Всего конспектов', value: stats.materials, icon: FileText },
                    { label: 'Всего преподов', value: stats.teachers, icon: UserPlus },
                    { label: 'Всего решалок', value: stats.tools, icon: Wrench },
                ].map(stat => (
                    <div key={stat.label} className="bg-secondary/30 border border-border/50 rounded-2xl p-6 space-y-2">
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span className="text-xs font-black uppercase tracking-widest">{stat.label}</span>
                            <stat.icon size={16} />
                        </div>
                        <p className="text-3xl font-black">{stat.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
