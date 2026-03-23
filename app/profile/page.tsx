'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Camera, Image as ImageIcon, Save, Lock, ArrowLeft, Loader2, CheckCircle2, AlertCircle, X, ExternalLink, Quote } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    // Form states
    const [username, setUsername] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [quote, setQuote] = useState('');

    // Previews
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('bss_user');
        if (!savedUser) {
            router.push('/');
            return;
        }
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setUsername(parsed.username);
        setAvatarPreview(parsed.avatarUrl || null);
        setBannerPreview(parsed.bannerUrl || null);
        setQuote(parsed.quote || '');

        // Fetch fresh data to get avatar/banner urls if not in localstorage
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.user) {
                    const fullUser = data.user;
                    setUser(fullUser);
                    setUsername(fullUser.username);
                    setAvatarPreview(fullUser.avatarUrl || null);
                    setBannerPreview(fullUser.bannerUrl || null);
                    setQuote(fullUser.quote || '');
                }
            })
            .finally(() => setLoading(false));
    }, [router]);

    const handleFileUpload = async (file: File, type: 'avatar' | 'banner') => {
        if (file.size > 4.5 * 1024 * 1024) {
            setMessage({ text: 'Файл слишком большой (макс. 4.5MB)', type: 'error' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const res = await fetch('/api/user/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                if (type === 'avatar') setAvatarPreview(data.url);
                else setBannerPreview(data.url);
                setMessage({ text: 'Изображение загружено', type: 'success' });
            } else {
                setMessage({ text: data.error || 'Ошибка загрузки', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Ошибка сети', type: 'error' });
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/user/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    avatarUrl: avatarPreview,
                    bannerUrl: bannerPreview,
                    quote
                }),
            });
            const data = await res.json();
            if (data.success) {
                const updated = { ...user, ...data.user };
                localStorage.setItem('bss_user', JSON.stringify(updated));
                setUser(updated);
                setMessage({ text: 'Профиль обновлен', type: 'success' });
            } else {
                setMessage({ text: data.error || 'Ошибка обновления', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Ошибка сети', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ text: 'Пароли не совпадают', type: 'error' });
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/user/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ text: 'Пароль успешно изменен', type: 'success' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setMessage({ text: data.error || 'Ошибка при смене пароля', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Ошибка сети', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold">На главную</span>
                </Link>
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                    <Link
                        href={`/profile/${user?.username}`}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-secondary hover:bg-muted text-foreground rounded-2xl text-xs font-bold transition-all active:scale-95 border border-border/50 shadow-sm"
                    >
                        <ExternalLink size={14} />
                        Посмотреть свой профиль
                    </Link>
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
                        Настройки аккаунта v1.0.0
                    </div>
                </div>
            </div>

            {/* Profile Header (Banner & Avatar) */}
            <section className="relative">
                {/* Banner */}
                <div
                    className="h-48 md:h-64 w-full rounded-[2.5rem] bg-secondary relative overflow-hidden cursor-pointer border-4 border-transparent hover:border-primary/20 transition-all group/banner"
                    onClick={() => bannerInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) handleFileUpload(file, 'banner');
                    }}
                >
                    {bannerPreview ? (
                        <div className="relative w-full h-full">
                            <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setBannerPreview(null);
                                }}
                                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-20"
                                title="Удалить баннер"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground opacity-40 group-hover/banner:opacity-100 transition-opacity">
                            <ImageIcon size={48} />
                            <p className="font-bold text-sm mt-2 uppercase tracking-widest">Перетащите баннер сюда</p>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                        <ImageIcon className="mr-2" /> Сменить баннер
                    </div>
                </div>
                <input
                    type="file"
                    ref={bannerInputRef}
                    hidden
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'banner')}
                />

                {/* Avatar Overlay */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0">
                    <div
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-card border-4 border-background shadow-2xl relative overflow-hidden cursor-pointer group/avatar"
                        onClick={(e) => {
                            e.stopPropagation();
                            avatarInputRef.current?.click();
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const file = e.dataTransfer.files[0];
                            if (file) handleFileUpload(file, 'avatar');
                        }}
                    >
                        {avatarPreview ? (
                            <div className="relative w-full h-full">
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setAvatarPreview(null);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors z-20"
                                    title="Удалить фото"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <User size={64} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold p-4 text-center">
                            <Camera className="mb-1" />
                            Сменить фото
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={avatarInputRef}
                        hidden
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'avatar')}
                    />
                </div>
            </section>

            <div className="pt-20 md:pt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Edit Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <User size={20} />
                            </div>
                            <h2 className="text-xl font-black">Личные данные</h2>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Имя пользователя (Никнейм)</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-secondary border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary outline-none font-bold"
                                    placeholder="Ваше имя..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">О себе (Цитата)</label>
                                <div className="relative">
                                    <Quote className="absolute left-6 top-6 text-muted-foreground opacity-30" size={24} />
                                    <textarea
                                        value={quote}
                                        onChange={(e) => setQuote(e.target.value)}
                                        className="w-full bg-secondary border-none rounded-3xl py-6 pl-16 pr-6 focus:ring-2 focus:ring-primary outline-none font-medium text-sm min-h-[120px] resize-none"
                                        placeholder="Расскажите немного о себе или оставьте крутую цитату..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                Сохранить изменения
                            </button>
                        </form>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Password Change Form */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-[2rem] p-8 shadow-xl space-y-6">
                        <div className="flex items-center gap-3 border-b border-border pb-4">
                            <div className="p-2 bg-primary/10 text-primary rounded-xl">
                                <Lock size={20} />
                            </div>
                            <h2 className="text-xl font-black">Безопасность</h2>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Текущий пароль</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Новый пароль</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Повторите новый пароль</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-secondary text-foreground hover:bg-muted py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <span>Обновить пароль</span>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
