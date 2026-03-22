'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Share2, BookOpen, Clock, AlertCircle, RefreshCcw, ListChecks, Sparkles, Zap } from 'lucide-react';
import SummaryRenderer from '@/components/SummaryRenderer';

export default function SummaryPage() {
    const params = useParams();
    const router = useRouter();
    const uuid = params.uuid as string;

    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (uuid) {
            fetchSummary();
        }
    }, [uuid]);

    const fetchSummary = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`https://d5d3kh6vigfafsdv1ukv.4b4k4pg5.apigw.yandexcloud.net/summaries/${uuid}`);
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            } else {
                setError('Не удалось загрузить конспект. Возможно, ссылка неверна или срок её действия истек.');
            }
        } catch (err) {
            console.error(err);
            setError('Ошибка при подключении к серверу. Проверьте интернет-соединение.');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                title: 'Конспект МТКП',
                url: window.location.href
            });
        } catch (err) {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Ссылка скопирована в буфер обмена!');
        }
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Navigation */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors flex items-center gap-2 font-bold text-sm"
                    >
                        <ChevronLeft size={20} />
                        Назад
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShare}
                            className="p-2 hover:bg-secondary rounded-full transition-colors"
                            title="Поделиться"
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 pt-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-muted-foreground">
                        <RefreshCcw size={48} className="animate-spin mb-4 text-primary" />
                        <p className="font-bold text-lg">Генерируем красоту...</p>
                        <p className="text-sm">Это может занять пару секунд</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                            <AlertCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-4">Упс! Что-то пошло не так</h2>
                        <p className="text-muted-foreground mb-8 leading-relaxed">
                            {error}
                        </p>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Вернуться на главную
                        </button>
                    </div>
                ) : summary ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 mb-8 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            <span className="flex items-center gap-1.5 py-1.5 px-3 bg-secondary rounded-full">
                                <BookOpen size={14} />
                                Автоматический конспект
                            </span>
                            <span className="flex items-center gap-1.5 py-1.5 px-3 bg-secondary rounded-full text-primary">
                                <Sparkles size={14} />
                                AI Generated
                            </span>
                            <span className="flex items-center gap-1.5 py-1.5 px-3 bg-secondary rounded-full">
                                <Clock size={14} />
                                {new Date(summary.message?.time || Date.now()).toLocaleDateString('ru-RU')}
                            </span>
                        </div>

                        {/* Title from root JSON */}
                        {summary.name && (
                            <h1 className="text-4xl md:text-5xl font-black mb-12 tracking-tight leading-tight">
                                {summary.name}
                            </h1>
                        )}

                        {/* Tasks Section */}
                        {summary.tasks && summary.tasks.length > 0 && (
                            <div className="mb-12 p-8 bg-primary/5 border border-primary/10 rounded-3xl space-y-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <ListChecks size={24} className="text-primary" />
                                    Задачи конспекта
                                </h2>
                                <div className="space-y-4">
                                    {summary.tasks.map((task: any) => (
                                        <div key={task.id} className="flex items-start gap-3 bg-background/50 p-4 rounded-2xl border border-border/50">
                                            <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary/30 flex items-center justify-center">
                                                <div className="w-2 h-2 bg-primary rounded-full" />
                                            </div>
                                            <p className="text-sm md:text-base font-medium leading-relaxed">
                                                {task.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <SummaryRenderer blocks={summary.message?.blocks || []} />

                        {/* Footer / Outro */}
                        <div className="mt-20 pt-10 border-t border-border flex flex-col items-center gap-6">
                            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Конец конспекта</p>

                            <div className="flex flex-col items-center gap-2">
                                <div className="px-6 py-2.5 bg-[#5865F2]/10 rounded-full border border-[#5865F2]/20 flex items-center gap-3 shadow-lg shadow-[#5865F2]/5 group hover:scale-105 transition-transform cursor-default">
                                    <Zap size={18} className="text-[#5865F2] fill-[#5865F2]/20" />
                                    <span className="font-black text-[#5865F2] tracking-[0.15em] text-sm uppercase">POWERED BY ИРМИС</span>
                                </div>
                            </div>

                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="inline-flex items-center gap-2 text-primary font-bold hover:underline mt-4"
                            >
                                Вернуться к началу
                            </button>
                        </div>
                    </div>
                ) : null}
            </main>
        </div>
    );
}
