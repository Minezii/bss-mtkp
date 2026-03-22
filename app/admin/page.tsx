'use client';

import { useState, useEffect } from 'react';
import { LogOut, Check, X, Clock, FileText, UserPlus, Wrench, RefreshCcw, Edit3, Save, Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [subjects, setSubjects] = useState<any[]>([]);
    const [showSubjectsModal, setShowSubjectsModal] = useState(false);
    const [newSubject, setNewSubject] = useState('');
    const [stats, setStats] = useState({ materials: 0, teachers: 0, tools: 0 });
    const [activeTab, setActiveTab] = useState<'submissions' | 'materials' | 'tools'>('submissions');
    const [materials, setMaterials] = useState<any[]>([]);
    const [tools, setTools] = useState<any[]>([]);

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

    const fetchSubjects = async () => {
        try {
            const res = await fetch('/api/admin/subjects');
            if (res.ok) {
                const data = await res.json();
                setSubjects(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMaterials = async () => {
        try {
            const res = await fetch('/api/admin/materials');
            if (res.ok) {
                const data = await res.json();
                setMaterials(data);
                setStats(s => ({ ...s, materials: data.length }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTools = async () => {
        try {
            const res = await fetch('/api/admin/tools');
            if (res.ok) {
                const data = await res.json();
                setTools(data);
                setStats(s => ({ ...s, tools: data.length }));
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSubmissions();
        fetchSubjects();
        fetchMaterials();
        fetchTools();
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

    const handleAddSubject = async () => {
        if (!newSubject) return;
        try {
            const res = await fetch('/api/admin/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newSubject }),
            });
            if (res.ok) {
                setNewSubject('');
                fetchSubjects();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSubject = async (id: number) => {
        try {
            const res = await fetch('/api/admin/subjects', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (res.ok) fetchSubjects();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteMaterial = async (id: number) => {
        if (!confirm('Удалить этот конспект навсегда?')) return;
        try {
            const res = await fetch('/api/admin/materials', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (res.ok) fetchMaterials();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTool = async (id: number) => {
        if (!confirm('Удалить этот инструмент навсегда?')) return;
        try {
            const res = await fetch('/api/admin/tools', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (res.ok) fetchTools();
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
            {showSubjectsModal && (
                <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4">
                    <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden p-8 space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black">Управление предметами</h2>
                            <button onClick={() => setShowSubjectsModal(false)} className="p-2 hover:bg-muted rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <input
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                placeholder="Название предмета..."
                                className="flex-grow bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                            />
                            <button onClick={handleAddSubject} className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">
                                Добавить
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto space-y-2 no-scrollbar">
                            {subjects.map((sub) => (
                                <div key={sub.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-xl">
                                    <span className="font-medium">{sub.name}</span>
                                    <button onClick={() => handleDeleteSubject(sub.id)} className="text-destructive hover:bg-destructive/10 p-2 rounded-lg">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight">Панель управления</h1>
                    <p className="text-muted-foreground font-medium italic">БСС МТКП — Административный сектор</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowSubjectsModal(true)}
                        className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-muted px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    >
                        <FileText size={16} />
                        Предметы
                    </button>
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
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="flex p-1 bg-secondary rounded-2xl">
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'submissions' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted'}`}
                        >
                            Заявки ({submissions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('materials')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'materials' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted'}`}
                        >
                            Конспекты ({materials.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('tools')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'tools' ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-muted'}`}
                        >
                            Инструменты ({tools.length})
                        </button>
                    </div>

                    <h2 className="text-xl font-black flex items-center gap-3">
                        {activeTab === 'submissions' && 'Активные заявки'}
                        {activeTab === 'materials' && 'Опубликованные конспекты'}
                        {activeTab === 'tools' && 'Библиотека инструментов'}
                        {activeTab === 'submissions' && submissions.some(s => s.status === 'draft') && (
                            <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-3 py-0.5 rounded-full">
                                + черновики
                            </span>
                        )}
                    </h2>
                </div>

                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/5 -mx-4 md:mx-0">
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left min-w-[600px]">
                            <thead>
                                <tr className="bg-secondary/50 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] border-b border-border">
                                    <th className="px-6 py-5">{activeTab === 'submissions' ? 'Тип' : 'Предмет'}</th>
                                    <th className="px-6 py-5">Название</th>
                                    <th className="px-6 py-5">{activeTab === 'submissions' ? 'Автор' : 'Курс'}</th>
                                    <th className="px-6 py-5">Дата</th>
                                    <th className="px-6 py-5 text-right">Действие</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {activeTab === 'submissions' ? (
                                    submissions.map((sub) => (
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
                                            <td className="px-6 py-5 font-bold">{sub.title}</td>
                                            <td className="px-6 py-5 font-medium text-muted-foreground">{sub.author} {sub.group && `[${sub.group}]`}</td>
                                            <td className="px-6 py-5 text-muted-foreground text-xs">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => router.push(`/admin/edit/${sub.id}`)} className="p-2.5 bg-secondary hover:bg-primary hover:text-white rounded-xl transition-all"><Edit3 size={18} /></button>
                                                    <button onClick={() => handleModeration(sub.id, 'approve')} className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all"><Check size={18} /></button>
                                                    <button onClick={() => handleModeration(sub.id, 'reject')} className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all"><X size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : activeTab === 'materials' ? (
                                    materials.map((m) => (
                                        <tr key={m.id} className="hover:bg-muted/30 transition-colors text-sm group">
                                            <td className="px-6 py-5 font-bold text-primary">{m.subject}</td>
                                            <td className="px-6 py-5 font-bold">{m.title}</td>
                                            <td className="px-6 py-5 font-black text-xs uppercase opacity-60">{m.course} курс</td>
                                            <td className="px-6 py-5 text-muted-foreground text-xs">{new Date(m.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => window.open(m.fileUrl || `/material/${m.id}`, '_blank')} className="p-2.5 bg-secondary hover:bg-primary hover:text-white rounded-xl transition-all"><Eye size={18} /></button>
                                                    <button onClick={() => handleDeleteMaterial(m.id)} className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : activeTab === 'tools' ? (
                                    tools.map((t) => (
                                        <tr key={t.id} className="hover:bg-muted/30 transition-colors text-sm group">
                                            <td className="px-6 py-5 font-bold text-orange-500">{t.category}</td>
                                            <td className="px-6 py-5 font-bold">{t.name}</td>
                                            <td className="px-6 py-5 font-medium text-muted-foreground max-w-[200px] truncate">{t.desc}</td>
                                            <td className="px-6 py-5 text-muted-foreground text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => window.open(t.url, '_blank')} className="p-2.5 bg-secondary hover:bg-primary hover:text-white rounded-xl transition-all"><Eye size={18} /></button>
                                                    <button onClick={() => handleDeleteTool(t.id)} className="p-2.5 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-xl transition-all"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                    {((activeTab === 'submissions' && submissions.length === 0) || (activeTab === 'materials' && materials.length === 0) || (activeTab === 'tools' && tools.length === 0)) && !loading && (
                        <div className="py-24 text-center text-muted-foreground italic font-medium">
                            Тут пока пусто... ☕
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
