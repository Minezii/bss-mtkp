'use client';

import { useState, useEffect } from 'react';
import { LogOut, Check, X, Clock, FileText, UserPlus, Wrench, RefreshCcw, Edit3, Save, Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EditorModal = ({ submission, onClose, onSave, onApprove }: any) => {
    const [title, setTitle] = useState(submission.title || '');
    const [content, setContent] = useState(submission.content || '');
    const [group, setGroup] = useState(submission.group || '');
    const [category, setCategory] = useState(submission.category || 'Конспект');
    const [course, setCourse] = useState(1);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (group) {
            const match = group.match(/\d/);
            if (match) {
                const semester = parseInt(match[0]);
                setCourse(Math.ceil(semester / 2));
            }
        }
    }, [group]);

    return (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-card border border-border w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
                <header className="p-6 md:p-8 border-b border-border flex justify-between items-center bg-secondary/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                            <Edit3 size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">Редактирование заявки</h2>
                            <p className="text-muted-foreground text-sm font-medium italic">Проверь, поправь и выкладывай</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-muted rounded-full transition-colors active:scale-90">
                        <X size={24} />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto p-6 md:p-10 scrollbar-thin">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Editor Forms */}
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Основная информация</label>
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold ml-1">Заголовок / Имя</label>
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-secondary border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold ml-1">Описание / Текст / Предметы</label>
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            rows={5}
                                            className="w-full bg-secondary border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                                        />
                                    </div>
                                    {submission.type === 'material' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold ml-1">Группа</label>
                                                <input
                                                    value={group}
                                                    onChange={(e) => setGroup(e.target.value)}
                                                    placeholder="ТИП 11"
                                                    className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold ml-1">Категория</label>
                                                <select
                                                    value={category}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none font-bold"
                                                >
                                                    <option>Конспект</option>
                                                    <option>Лекция</option>
                                                    <option>Шпаргалка</option>
                                                    <option>Разное</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Live Preview */}
                        <div className="space-y-6">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                <Eye size={12} /> Предпросмотр карточки
                            </label>

                            <div className="p-8 bg-secondary/10 rounded-[2rem] border border-dashed border-border flex items-center justify-center min-h-[300px]">
                                {submission.type === 'material' && (
                                    <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-xl">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-primary text-primary-foreground rounded-xl">
                                                <FileText size={24} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-1 rounded">
                                                {category}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 line-clamp-2">{title || 'Без названия'}</h3>
                                        <p className="text-muted-foreground text-sm mb-6">
                                            Предмет: <span className="text-foreground font-medium">{content || '...'}</span>
                                        </p>
                                        <div className="flex justify-between items-center pt-4 border-t border-border">
                                            <span className="text-xs font-black px-2 py-1 bg-primary/10 text-primary rounded-md">
                                                {course} курс
                                            </span>
                                            {group && <span className="text-[10px] font-black text-muted-foreground italic">{group}</span>}
                                        </div>
                                    </div>
                                )}

                                {submission.type === 'teacher' && (
                                    <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-6 shadow-xl">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center text-muted-foreground">
                                                <UserPlus size={32} />
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="text-lg font-bold">{title || 'Имя преподавателя'}</h3>
                                                <p className="text-[10px] font-black text-primary uppercase">Общее отделение</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-1.5">
                                            {content.split(',').map((s: string, i: number) => (
                                                <span key={i} className="px-2 py-0.5 bg-muted rounded text-[10px] font-bold uppercase">{s.trim() || 'Предмет'}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {submission.type === 'tool' && (
                                    <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 shadow-xl flex items-center gap-4">
                                        <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                                            <Wrench size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{title || 'Инструмент'}</h3>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{content || 'Описание...'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-[10px] text-muted-foreground italic italic">Примерно так это будет выглядеть в общем списке</p>
                        </div>
                    </div>
                </div>

                <footer className="p-6 md:p-8 border-t border-border flex flex-col sm:flex-row justify-end gap-4 bg-secondary/10">
                    <button
                        onClick={() => onSave({ title, content, group, category, course })}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-2xl font-black transition-all hover:bg-muted active:scale-95"
                    >
                        <Save size={20} />
                        В черновики
                    </button>
                    <button
                        onClick={() => onApprove({ title, content, group, category, course })}
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                    >
                        <Check size={20} />
                        Одобрить и выложить
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default function AdminDashboard() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSubmission, setEditingSubmission] = useState<any | null>(null);
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

    const handleModeration = async (id: number, action: 'approve' | 'reject' | 'save_draft', updatedData?: any) => {
        try {
            const res = await fetch('/api/admin/moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action, updatedData }),
            });

            if (res.ok) {
                if (action === 'save_draft') {
                    setSubmissions(submissions.map(s => s.id === id ? { ...s, ...updatedData, status: 'draft' } : s));
                    setEditingSubmission(null);
                } else {
                    setSubmissions(submissions.filter(s => s.id !== id));
                    setEditingSubmission(null);
                }
            } else {
                alert('Ошибка при выполнении');
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
            {editingSubmission && (
                <EditorModal
                    submission={editingSubmission}
                    onClose={() => setEditingSubmission(null)}
                    onSave={(data: any) => handleModeration(editingSubmission.id, 'save_draft', data)}
                    onApprove={(data: any) => handleModeration(editingSubmission.id, 'approve', data)}
                />
            )}

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
                                    <tr key={sub.id} className={`hover:bg-muted/30 transition-colors text-sm group ${sub.status === 'draft' ? 'bg-orange-500/5' : ''}`}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-secondary rounded-lg group-hover:bg-primary/5 transition-colors">
                                                    {sub.type === 'material' && <FileText size={18} className="text-blue-500" />}
                                                    {sub.type === 'teacher' && <UserPlus size={18} className="text-emerald-500" />}
                                                    {sub.type === 'tool' && <Wrench size={18} className="text-orange-500" />}
                                                </div>
                                                {sub.status === 'draft' && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest bg-orange-500 text-white px-1.5 py-0.5 rounded">Черновик</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-foreground">{sub.title}</div>
                                            <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1 max-w-[200px]">{sub.content}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-muted-foreground font-medium">{sub.author}</div>
                                            {sub.group && <div className="text-[10px] font-black text-primary mt-1">{sub.group}</div>}
                                        </td>
                                        <td className="px-6 py-5 text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingSubmission(sub)}
                                                    className="p-2.5 bg-secondary text-secondary-foreground hover:bg-primary hover:text-white rounded-xl transition-all active:scale-90"
                                                    title="Редактировать"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleModeration(sub.id, 'approve')}
                                                    className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-90"
                                                    title="Быстрое одобрение"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleModeration(sub.id, 'reject')}
                                                    className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all active:scale-90"
                                                    title="Отклонить"
                                                >
                                                    <X size={18} />
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
        </div>
    );
}
