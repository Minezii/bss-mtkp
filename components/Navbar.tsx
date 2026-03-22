'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, Wrench, Menu, X, Rocket, Moon, Sun, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import AuthModal from './AuthModal';

const navItems = [
    { name: 'Студентам', href: '/', icon: BookOpen },
    { name: 'Преподаватели', href: '/teachers', icon: Users },
    { name: 'Инструменты', href: '/tools', icon: Wrench },
    { name: 'Статус заявки', href: '/check-status', icon: Rocket },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Fetch user on mount
    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth/login', { method: 'GET' }); // I need to add a GET handler to login or separate /me
            // For now, let's just use a simple flag in localStorage or similar for UI responsiveness, 
            // but the real check should be API-based.
            // I'll create /api/auth/me instead.
        } catch (err) { }
    };

    useEffect(() => {
        setMounted(true);
        // Simple check for presence of cookie by calling a dummy endpoint or just checking localStorage
        const savedUser = localStorage.getItem('bss_user');
        if (savedUser) setUser(JSON.parse(savedUser));
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
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-110 transition-all duration-200">
                                    <Rocket size={20} />
                                </div>
                                <span className="text-xl font-bold tracking-tight transition-colors duration-200">БСС МТКП</span>
                            </Link>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center space-x-4">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {item.name}
                                    </Link>
                                );
                            })}

                            <div className="h-6 w-px bg-border mx-2" />

                            {user ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-full text-sm font-bold">
                                        <User size={16} className="text-primary" />
                                        {user.username}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                        title="Выйти"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAuthModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-bold hover:opacity-90 transition-all active:scale-95"
                                >
                                    Войти
                                </button>
                            )}

                            <button
                                onClick={toggleTheme}
                                className="p-2 ml-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                                aria-label="Переключить тему"
                            >
                                {mounted && (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />)}
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center gap-2">
                            {user && (
                                <div className="flex items-center gap-2 px-2 py-1 bg-secondary rounded-full text-xs font-bold">
                                    <User size={14} className="text-primary" />
                                    {user.username}
                                </div>
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
            </nav>

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
                            {navItems.map((item) => {
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
                        </div>

                        <div className="mt-auto pt-6 border-t border-border">
                            <p className="text-xs text-muted-foreground font-medium text-center">
                                БСС МТКП v0.1.0
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
