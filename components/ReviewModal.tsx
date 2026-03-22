'use client';

import { useState } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';
import StarRating from './StarRating';

interface ReviewModalProps {
    teacherId: number;
    teacherName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReviewModal({ teacherId, teacherName, isOpen, onClose, onSuccess }: ReviewModalProps) {
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [isRecommended, setIsRecommended] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/teachers/${teacherId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, content, isRecommended })
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                const data = await res.json();
                setError(data.error || 'Ошибка при отправке');
            }
        } catch (err) {
            setError('Ошибка сети');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-2">Ваш отзыв</h2>
                <p className="text-muted-foreground mb-6 font-medium">Преподаватель: <span className="text-foreground">{teacherName}</span></p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-sm font-bold">Оценка в звездах</label>
                        <StarRating
                            rating={rating}
                            interactive
                            size={32}
                            onRatingChange={setRating}
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold">Вы рекомендуете этого преподавателя?</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsRecommended(true)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all border-2 ${isRecommended
                                        ? 'bg-green-500/10 border-green-500 text-green-500'
                                        : 'bg-secondary border-transparent text-muted-foreground'
                                    }`}
                            >
                                <ThumbsUp size={20} /> Да
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsRecommended(false)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all border-2 ${!isRecommended
                                        ? 'bg-red-500/10 border-red-500 text-red-500'
                                        : 'bg-secondary border-transparent text-muted-foreground'
                                    }`}
                            >
                                <ThumbsDown size={20} /> Нет
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold">Ваш комментарий (по желанию)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-secondary border-none rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                            placeholder="Напишите, что вы думаете об этом преподавателе..."
                        />
                    </div>

                    {error && (
                        <p className="text-destructive text-sm font-bold text-center">{error}</p>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {loading ? 'Отправка...' : 'Опубликовать'}
                    </button>
                </form>
            </div>
        </div>
    );
}
