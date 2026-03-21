'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, LogIn, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/admin');
                router.refresh(); // Чтобы Middleware сразу увидел новую куку
            } else {
                setError(data.error || 'Ошибка входа');
            }
        } catch (err) {
            setError('Не удалось связаться с сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-card border border-border p-8 rounded-3xl shadow-xl">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 text-primary rounded-2xl mb-2">
                        <ShieldAlert size={32} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">Вход для Админа</h1>
                    <p className="text-sm text-muted-foreground italic">
                        Только для персонала БСС МТКП. Посторонним вход запрещен.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Логин</label>
                            <input
                                required
                                type="text"
                                value={login}
                                onChange={(e) => setLogin(e.target.value)}
                                className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="admin"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Пароль</label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-secondary border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl text-sm font-bold animate-shake">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-4 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            <>
                                <LogIn size={20} />
                                Войти в систему
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
