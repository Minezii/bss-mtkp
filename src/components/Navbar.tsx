'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, Wrench, Menu, X, Rocket } from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { name: 'Студентам', href: '/', icon: BookOpen },
    { name: 'Преподаватели', href: '/teachers', icon: Users },
    { name: 'Инструменты', href: '/tools', icon: Wrench },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 glass border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                <Rocket size={20} />
                            </div>
                            <span className="text-xl font-bold tracking-tight">БСС МТКП</span>
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
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-muted-foreground hover:text-foreground p-2"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Drawer */}
            <div
                className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'
                    }`}
            >
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Drawer Content */}
                <div
                    className={`absolute right-0 top-0 h-full w-[280px] bg-card border-l border-border shadow-2xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
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
        </nav>
    );
}
