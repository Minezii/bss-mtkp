'use client';

import { useState, useEffect } from 'react';
import { X, MessageSquare, ThumbsUp, ThumbsDown, User, Calendar } from 'lucide-react';
import StarRating from './StarRating';

interface CommentsModalProps {
    teacherId: number;
    teacherName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function CommentsModal({ teacherId, teacherName, isOpen, onClose }: CommentsModalProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchReviews();
        }
    }, [isOpen, teacherId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/teachers/${teacherId}/reviews`);
            if (res.ok) {
                const data = await res.json();
                setReviews(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            style={{ WebkitBackdropFilter: 'blur(8px)' }}
        >
            <div className="relative w-full max-w-2xl h-[90vh] md:h-[80vh] bg-card border border-border rounded-3xl p-5 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="mb-4 md:mb-6 pr-8">
                    <h2 className="text-xl md:text-2xl font-bold mb-1">Отзывы студентов</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Преподаватель: <span className="text-foreground font-bold">{teacherName}</span></p>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 space-y-4 no-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <MessageSquare className="animate-pulse mb-4" size={48} />
                            <p className="font-bold uppercase tracking-widest text-xs">Загружаем отзывы...</p>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-20 bg-secondary/30 rounded-2xl border-2 border-dashed border-border">
                            <p className="text-muted-foreground">Отзывов пока нет. Будь первым!</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-secondary/40 border border-border/50 rounded-2xl p-4 md:p-6 space-y-3 md:space-y-4">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex-shrink-0 flex items-center justify-center text-primary">
                                            <User size={18} className="md:w-5 md:h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-xs md:text-sm truncate">{review.user.username}</p>
                                            <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">{review.user.group || 'Студент'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                        <StarRating rating={review.rating} size={12} />
                                        <div className="flex items-center gap-1 text-[9px] md:text-[10px] text-muted-foreground font-bold whitespace-nowrap">
                                            <Calendar size={10} className="md:w-3 md:h-3" />
                                            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>
                                </div>

                                {review.content && (
                                    <p className="text-sm leading-relaxed text-foreground/90 italic">
                                        "{review.content}"
                                    </p>
                                )}

                                <div className="flex items-center gap-4 pt-2 border-t border-border/30">
                                    <div className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest ${review.isRecommended ? 'text-green-500' : 'text-red-500'}`}>
                                        {review.isRecommended ? (
                                            <>
                                                <ThumbsUp size={14} />
                                                <span>Рекомендую</span>
                                            </>
                                        ) : (
                                            <>
                                                <ThumbsDown size={14} />
                                                <span>Не советую</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
