'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, Wrench, Menu, X, Rocket, Moon, Sun, User, LogOut, GraduationCap, HelpCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import AuthModal from './AuthModal';
import { ChevronDown } from 'lucide-react';

const mainNavItems = [
    { name: 'Материалы', href: '/', icon: GraduationCap },
    { name: 'Преподаватели', href: '/teachers', icon: Users },
    { name: 'Ирмис', href: '/summaries', icon: BookOpen },
    { name: 'Инструменты', href: '/tools', icon: Wrench },
];

const moreNavItems = [
    { name: 'Вопросы', href: '/faq', icon: HelpCircle },
    { name: 'Статус', href: '/check-status', icon: Rocket },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedUser = localStorage.getItem('bss_user');
        if (savedUser) setUser(JSON.parse(savedUser));

        const handleClickOutside = (event: MouseEvent) => {
            if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
                setIsMoreOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('bss_user');
        setUser(null);
        window.location.reload();
    };

    const handleAuthSuccess = (userData: any) => {
        localStorage.setItem('bss_user', JSON.stringify(userData));
        setUser(userData);
        window.location.reload();
    };

    return (
        <>
            <nav className="sticky top-0 z-50 glass border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-2 group shrink-0">
                                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-110 transition-all duration-200">
                                    <Rocket size={20} />
                                </div>
                                <span className="text-xl font-bold tracking-tight transition-colors duration-200">БСС МТКП</span>
                            </Link>

                            {/* Main Desktop Nav */}
                            <div className="hidden xl:flex items-center space-x-1">
                                {mainNavItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isActive
                                                ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                                                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                                }`}
                                        >
                                            <Icon size={18} />
                                            {item.name}
                                        </Link>
                                    );
                                })}

                                {/* More Dropdown */}
                                <div className="relative" ref={moreRef}>
                                    <button
                                        onClick={() => setIsMoreOpen(!isMoreOpen)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${isMoreOpen || moreNavItems.some(i => i.href === pathname)
                                            ? 'bg-secondary text-foreground'
                                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                                            }`}
                                    >
                                        Еще
                                        <ChevronDown size={14} className={`transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isMoreOpen && (
                                        <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                                            {moreNavItems.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = pathname === item.href;
                                                return (
                                                    <Link
                                                        key={item.href}
                                                        href={item.href}
                                                        onClick={() => setIsMoreOpen(false)}
                                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive
                                                            ? 'bg-primary/10 text-primary'
                                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                                            }`}
                                                    >
                                                        <Icon size={18} />
                                                        {item.name}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="hidden md:flex items-center space-x-4">
                            {user ? (
                                <div className="flex items-center gap-2 pr-2 border-r border-border">
                                    <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 bg-secondary hover:bg-muted transition-colors rounded-full text-sm font-bold border border-transparent hover:border-border">
                                        <User size={16} className="text-primary" />
                                        {user.username}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-muted-foreground hover:text-destructive transition-colors bg-secondary/30 rounded-full hover:bg-destructive/10"
                                        title="Выйти"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm font-black hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                                >
                                    Войти
                                </button>
                            )}

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleTheme}
                                    className="p-2.5 rounded-xl bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-90"
                                    aria-label="Переключить тему"
                                >
                                    {mounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
                                </button>
                                <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-30 select-none">
                                    v1.0.0
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-2">
                            {user && (
                                <Link href="/profile" className="flex items-center gap-2 px-2 py-1 bg-secondary rounded-full text-xs font-bold">
                                    <User size={14} className="text-primary" />
                                    {user.username}
                                </Link>
                            )}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                aria-label="Переключить тему"
                            >
                                {mounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
                            </button>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-muted-foreground hover:text-foreground p-2"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav >

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />

            {/* Mobile Nav Drawer - Outside sticky nav for Safari compatibility */}
            <div
                className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'
                    }`}
                style={{ isolation: 'isolate' }}
            >
                {/* Backdrop with explicit Webkit support */}
                <div
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300"
                    style={{ WebkitBackdropFilter: 'blur(4px)' }}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Drawer Content with solid background and higher z-index */}
                <div
                    className={`absolute right-0 top-0 h-full w-[280px] bg-background border-l border-border shadow-2xl transition-transform duration-300 ease-out z-50 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
                        }`}
                >
                    <div className="flex flex-col h-full p-6">
                        <div className="flex justify-between items-center mb-10">
                            <span className="text-lg font-bold">Меню</span>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 bg-secondary rounded-xl text-muted-foreground"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 flex-grow">
                            {[...mainNavItems, ...moreNavItems].map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-bold transition-all ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                            }`}
                                    >
                                        <div className={`${isActive ? 'text-primary-foreground' : 'text-primary'}`}>
                                            <Icon size={24} />
                                        </div>
                                        {item.name}
                                    </Link>
                                );
                            })}

                            <div className="pt-4 border-t border-border/50">
                                {user ? (
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-bold text-destructive hover:bg-destructive/10 transition-all"
                                    >
                                        <LogOut size={24} />
                                        Выйти
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            setIsAuthModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-bold bg-primary text-primary-foreground shadow-lg active:scale-95 transition-all"
                                    >
                                        <User size={24} />
                                        Войти в аккаунт
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-border">
                            <p className="text-xs text-muted-foreground font-medium text-center">
                                БСС МТКП v1.0.0
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
