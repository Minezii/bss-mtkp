'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Share2,
    Globe,
    Send,
    BookOpen,
    RefreshCcw,
    Sparkles,
    ArrowRight,
    ListChecks,
    ChevronLeft,
    Clock,
    Zap
} from 'lucide-react';
import SummaryRenderer from '@/components/SummaryRenderer';
import PublishSummaryModal from '@/components/PublishSummaryModal';

const LOADING_PHRASES = [
    "Загрузка конспекта...",
    "Почти готово...",
    "Обработка данных...",
    "Секундочку...",
    "Генерируем красоту...",
    "Ищем знания...",
];

export default function SummaryPage() {
    const { uuid } = useParams() as { uuid: string };
    const router = useRouter();

    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [justPublished, setJustPublished] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentPhraseIndex((prev) => {
                    let next;
                    do {
                        next = Math.floor(Math.random() * LOADING_PHRASES.length);
                    } while (next === prev);
                    return next;
                });
                setFade(true);
            }, 250);
        }, 2000);
        return () => clearInterval(interval);
    }, [loading]);

    useEffect(() => {
        if (uuid) {
            fetchSummary();
            checkPublicationStatus();
        }
    }, [uuid]);

    const checkPublicationStatus = async () => {
        try {
            const res = await fetch('/api/summaries/sync');
            if (res.ok) {
                const data = await res.json();
                const exists = data.some((s: any) => s.uuid === uuid);
                if (exists) setIsPublished(true);
            }
        } catch (err) {
            console.error('Error checking publication status:', err);
        } finally {
            setCheckingStatus(false);
        }
    };

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
                        {!checkingStatus && !isPublished && (
                            <button
                                onClick={() => setIsPublishModalOpen(true)}
                                disabled={loading || !summary}
                                className="p-3 rounded-2xl border-2 border-primary bg-primary text-primary-foreground transition-all flex items-center gap-2 font-bold text-sm hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                            >
                                <Globe size={20} />
                                <span className="hidden md:inline">На сайт для всех</span>
                            </button>
                        )}

                        <button
                            onClick={handleShare}
                            className="p-3 bg-secondary rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all text-secondary-foreground"
                            title="Поделиться"
                        >
                            <Share2 size={24} />
                        </button>
                    </div>
                </div>
                {justPublished && (
                    <div className="max-w-4xl mx-auto px-4 mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-3xl text-green-500 animate-in slide-in-from-top-4 duration-500 flex items-center justify-center gap-3 font-bold">
                        <Check size={20} />
                        Конспект теперь доступен всем на главной странице!
                    </div>
                )}
            </header>

            <main className="max-w-4xl mx-auto px-4 pt-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-8 animate-bounce">
                            <Sparkles size={32} className="text-primary" />
                        </div>
                        <div className={`text-lg font-medium transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"}`}>
                            {LOADING_PHRASES[currentPhraseIndex]}
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
                            <ArrowRight size={32} className="rotate-180" />
                        </div>
                        <h2 className="text-2xl font-black mb-2">Конспект не найден</h2>
                        <p className="text-muted-foreground mb-8">
                            Похоже, UUID неверный или конспект был удален.
                        </p>
                        <button
                            onClick={() => router.push('/summaries')}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                        >
                            Попробовать другой
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <h1
                            className="text-3xl md:text-5xl font-black mb-4 leading-tight ce-header"
                            style={{ fontFamily: 'Inter, var(--font-inter), sans-serif' }}
                        >
                            {summary?.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3 mb-8 text-sm font-bold text-muted-foreground uppercase tracking-wider">
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

                        {summary && <SummaryRenderer data={summary.message} />}

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
                )}
            </main>

            <PublishSummaryModal
                isOpen={isPublishModalOpen}
                onClose={() => setIsPublishModalOpen(false)}
                onSuccess={() => {
                    setIsPublished(true);
                    setJustPublished(true);
                }}
                summaryData={{
                    uuid: uuid as string,
                    title: summary?.name || 'AI Конспект'
                }}
            />
        </div >
    );
}

function Check({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
    );
}
