'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User as UserIcon, Heart, Eye, MessageSquare, Calendar, ArrowLeft, Loader2, Quote, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import StarRating from '@/components/StarRating';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [likeLoading, setLikeLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('bss_user');
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
        fetchProfile();
    }, [username]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/user/${username}`);
            const data = await res.json();
            if (data.user) {
                setProfile(data.user);
            } else {
                // router.push('/404');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleLike = async () => {
        if (!currentUser) return;
        setLikeLoading(true);
        try {
            const res = await fetch(`/api/user/${username}/like`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setProfile((prev: any) => ({
                    ...prev,
                    isLiked: data.liked,
                    _count: {
                        ...prev._count,
                        likes: data.liked ? prev._count.likes + 1 : prev._count.likes - 1
                    }
                }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLikeLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    if (!profile) return (
        <div className="text-center py-20">
            <h1 className="text-2xl font-bold">Пользователь не найден</h1>
            <Link href="/" className="text-primary hover:underline mt-4 inline-block">Вернуться на главную</Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">Назад</span>
                </button>
                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                    Публичный профиль
                </div>
            </header>

            {/* Profile Header (Banner & Avatar) */}
            <section className="relative">
                {/* Banner */}
                <div className="h-48 md:h-64 w-full rounded-[2.5rem] bg-secondary relative overflow-hidden border-4 border-transparent">
                    {profile.bannerUrl ? (
                        <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary flex items-center justify-center">
                            <div className="text-primary/20 font-black text-6xl md:text-8xl select-none uppercase tracking-tighter">
                                {profile.displayName || profile.username}
                            </div>
                        </div>
                    )}
                </div>

                {/* Avatar Overlay */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-card border-4 border-background shadow-2xl relative overflow-hidden flex-shrink-0">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt={profile.displayName || profile.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary">
                                <UserIcon size={64} />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Social Stats Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-24 md:pt-2">
                <div className="hidden md:block w-44 flex-shrink-0" /> {/* Avatar Spacer */}

                <div className="flex items-center justify-center md:justify-start gap-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 px-8 shadow-sm">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-primary">{profile._count.likes}</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Лайков</span>
                    </div>
                    <div className="w-px h-8 bg-border/50" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-primary">{profile._count.views}</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Просмотров</span>
                    </div>
                    <div className="w-px h-8 bg-border/50" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-primary">{profile._count.reviews}</span>
                        <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Отзывов</span>
                    </div>
                </div>

                <div className="flex justify-center md:justify-end">
                    <button
                        onClick={toggleLike}
                        disabled={likeLoading || !currentUser || currentUser.id === profile.id}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all active:scale-95 border-2 ${profile.isLiked
                            ? 'bg-rose-500/10 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/20'
                            : 'bg-secondary/50 border-transparent text-muted-foreground hover:border-rose-500/50'
                            } disabled:opacity-50 disabled:active:scale-100 font-bold`}
                    >
                        <Heart size={20} fill={profile.isLiked ? "currentColor" : "none"} />
                        <span>{profile.isLiked ? 'Понравилось' : 'Лайкнуть'}</span>
                    </button>
                </div>
            </div>

            {/* Profile Info */}
            <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div className="space-y-2 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-4">
                            <h1 className="text-4xl font-black tracking-tight">{profile.displayName || profile.username}</h1>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground font-bold uppercase text-xs tracking-widest">
                            <CheckCircle2 size={14} className="text-primary" />
                            {profile.group || 'Студент МТКП'}
                        </div>
                    </div>

                    {profile.quote && (
                        <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
                            <Quote className="absolute -top-4 -left-4 text-primary/5 group-hover:text-primary/10 transition-colors" size={160} />
                            <p className="text-lg md:text-xl font-medium leading-relaxed italic relative z-10 text-foreground/90">
                                "{profile.quote}"
                            </p>
                        </div>
                    )}

                    {/* Recent Reviews */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <MessageSquare className="text-primary" size={24} />
                            <h2 className="text-2xl font-black tracking-tight">Отзывы на преподавателей</h2>
                        </div>

                        {profile.reviews.length === 0 ? (
                            <div className="bg-secondary/30 border-2 border-dashed border-border rounded-[2rem] p-12 text-center">
                                <p className="text-muted-foreground font-bold">Студент еще не оставил ни одного отзыва.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {profile.reviews.map((review: any) => (
                                    <div key={review.id} className="bg-card border border-border rounded-3xl p-6 hover:shadow-xl transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Отзыв для</p>
                                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{review.teacher.name}</h3>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <StarRating rating={review.rating} size={14} />
                                                <span className="text-[10px] font-bold text-muted-foreground">
                                                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm italic text-foreground/80 leading-relaxed mb-4">"{review.content}"</p>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${review.isRecommended ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {review.isRecommended ? 'Рекомендует' : 'Не рекомендует'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-[2rem] p-8 space-y-6 shadow-xl">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                                    <Calendar size={14} /> На сайте с
                                </div>
                                <span className="font-black">{new Date(profile.createdAt).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
