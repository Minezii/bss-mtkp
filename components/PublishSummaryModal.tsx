'use client';

import { useState, useEffect } from 'react';
import { X, Globe, Check, RefreshCcw } from 'lucide-react';

interface PublishSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    summaryData: {
        uuid: string;
        title: string;
    };
}

export default function PublishSummaryModal({ isOpen, onClose, onSuccess, summaryData }: PublishSummaryModalProps) {
    const [subject, setSubject] = useState('');
    const [course, setCourse] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchSubjects();
        }
    }, [isOpen]);

    const fetchSubjects = async () => {
        try {
            const res = await fetch('/api/teachers'); // Subjects are often tied to teachers or materials
            // In a real app, I'd have a dedicated /api/subjects
            // For now, let's just use some defaults or fetch from materials
            const resMat = await fetch('/api/materials');
            if (resMat.ok) {
                const data = await resMat.json();
                const uniqueSubjects = Array.from(new Set(data.map((m: any) => m.subject))) as string[];
                setSubjects(uniqueSubjects);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePublish = async () => {
        if (!subject) {
            setError('Пожалуйста, укажите предмет');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/summaries/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summaries: [{
                        uuid: summaryData.uuid,
                        title: summaryData.title,
                        subject: subject,
                        course: course
                    }]
                })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                setError('Не удалось опубликовать конспект. Попробуйте позже.');
            }
        } catch (err) {
            setError('Ошибка при отправке данных.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-lg rounded-[2.5rem] border border-border shadow-2xl p-8 md:p-10 relative animate-in zoom-in-95 duration-300">
                <button
                    onClick={onClose}
                    className="absolute right-6 top-6 p-2 hover:bg-secondary rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 text-primary">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Globe size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Опубликовать на сайт</h2>
                            <p className="text-muted-foreground text-sm">Этот конспект станет доступен всем студентам в общем списке.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-secondary/50 rounded-2xl border border-border/50">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Название</p>
                        <p className="font-bold">{summaryData.title}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Предмет</label>
                            <input
                                list="subjects-list"
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Например: Математический анализ"
                                className="w-full bg-secondary border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary transition-all outline-none"
                            />
                            <datalist id="subjects-list">
                                {subjects.map(s => <option key={s} value={s} />)}
                            </datalist>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Курс</label>
                            <div className="grid grid-cols-4 gap-3">
                                {[1, 2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setCourse(num)}
                                        className={`py-3 rounded-2xl font-bold transition-all border-2 ${course === num
                                            ? 'bg-primary border-primary text-primary-foreground'
                                            : 'bg-secondary border-transparent text-foreground hover:bg-muted'}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-destructive/10 text-destructive rounded-2xl text-sm font-medium flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePublish}
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-5 rounded-[1.5rem] font-bold text-lg hover:scale-[1.02] transition-all active:scale-[0.98] shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                    >
                        {loading ? (
                            <RefreshCcw size={24} className="animate-spin" />
                        ) : (
                            <>
                                <Check size={24} />
                                Опубликовать
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function AlertCircle({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
    );
}
