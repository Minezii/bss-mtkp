'use client';

import { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';
import StarRating from './StarRating';

interface ReviewModalProps {
    teacherId: number;
    teacherName: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: any;
}

export default function ReviewModal({ teacherId, teacherName, isOpen, onClose, onSuccess, user }: ReviewModalProps) {
    const [ratings, setRatings] = useState({
        lectures: 0,
        exams: 0,
        clarity: 0,
        fairness: 0
    });
    const [content, setContent] = useState('');
    const [isRecommended, setIsRecommended] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isOpen && teacherId && user) {
            fetchExistingReview();
        } else if (!isOpen) {
            // Reset when closing
            setRatings({ lectures: 0, exams: 0, clarity: 0, fairness: 0 });
            setContent('');
            setIsRecommended(true);
            setIsEditing(false);
        }
    }, [isOpen, teacherId, user]);

    const fetchExistingReview = async () => {
        try {
            const res = await fetch(`/api/teachers/${teacherId}/reviews`);
            if (res.ok) {
                const reviews = await res.json();
                const myReview = reviews.find((r: any) => r.userId === user.id);
                if (myReview) {
                    setRatings({
                        lectures: myReview.lecturesRating,
                        exams: myReview.examsRating,
                        clarity: myReview.clarityRating,
                        fairness: myReview.fairnessRating
                    });
                    setContent(myReview.content || '');
                    setIsRecommended(myReview.isRecommended);
                    setIsEditing(true);
                }
            }
        } catch (err) {
            console.error('Failed to fetch existing review:', err);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (Object.values(ratings).some(r => r === 0)) {
            setError('Пожалуйста, оцените по всем критериям');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/teachers/${teacherId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    lecturesRating: ratings.lectures,
                    examsRating: ratings.exams,
                    clarityRating: ratings.clarity,
                    fairnessRating: ratings.fairness,
                    isRecommended
                })
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

    const RatingField = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
        <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
            <StarRating rating={value} onRatingChange={onChange} interactive={true} size={24} />
        </div>
    );

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            style={{ WebkitBackdropFilter: 'blur(8px)' }}
        >
            <div className="relative w-full max-w-xl bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] no-scrollbar">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl md:text-2xl font-bold mb-2">Оставить отзыв</h2>
                <p className="text-muted-foreground text-sm md:text-base mb-6 md:mb-8">Преподаватель: <span className="text-foreground font-bold">{teacherName}</span></p>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <RatingField
                            label="Душка на парах"
                            value={ratings.lectures}
                            onChange={(v) => setRatings({ ...ratings, lectures: v })}
                        />
                        <RatingField
                            label="Душка на сессии"
                            value={ratings.exams}
                            onChange={(v) => setRatings({ ...ratings, exams: v })}
                        />
                        <RatingField
                            label="Понятность"
                            value={ratings.clarity}
                            onChange={(v) => setRatings({ ...ratings, clarity: v })}
                        />
                        <RatingField
                            label="Справедливость"
                            value={ratings.fairness}
                            onChange={(v) => setRatings({ ...ratings, fairness: v })}
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
                        {loading ? 'Отправка...' : (isEditing ? 'Изменить отзыв' : 'Опубликовать')}
                    </button>
                </form>
            </div>
        </div>
    );
}
