'use client';

import { useState } from 'react';
import { X, User, Lock, Users } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (res.ok) {
                if (!isLogin) {
                    // Switch to login after registration
                    setIsLogin(true);
                    setFormData({ ...formData, password: '', confirmPassword: '' });
                    alert('Регистрация успешна! Теперь вы можете войти.');
                } else {
                    localStorage.setItem('bss_user', JSON.stringify(data.user));
                    onSuccess(data.user);
                    onClose();
                }
            } else {
                setError(data.error || 'Произошла ошибка');
            }
        } catch (err) {
            setError('Ошибка сети');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
            style={{ WebkitBackdropFilter: 'blur(8px)' }}
        >
            <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center">
                    {isLogin ? 'Вход в аккаунт' : 'Регистрация студента'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Никнейм</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                required
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-secondary border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="Ivanov22"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold ml-1">Пароль</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                required
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-secondary border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-sm font-bold ml-1">Подтвердите пароль</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    required
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full bg-secondary border-none rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <p className="text-destructive text-sm font-bold text-center px-2">{error}</p>
                    )}

                    <button
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Создать аккаунт'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                    {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="ml-2 font-bold text-primary hover:underline"
                    >
                        {isLogin ? 'Регистрация' : 'Войти'}
                    </button>
                </p>
            </div>
        </div>
    );
}
