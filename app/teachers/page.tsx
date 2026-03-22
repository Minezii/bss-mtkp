'use client';

import { useState, useEffect } from 'react';
import { Search, Star, MessageSquare, Filter, User, RefreshCcw, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import StarRating from '@/components/StarRating';
import ReviewModal from '@/components/ReviewModal';
import CommentsModal from '@/components/CommentsModal';
import AuthModal from '@/components/AuthModal';

const departments: string[] = ["Информатика", "Радиоаппаратостроение", "Социально-экономическое", "Общеобразовательное"];

const RatingBar = ({ label, value }: { label: string; value: number }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-tight">
            <span>{label}</span>
            <span className="text-foreground">{value.toFixed(1)} / 5</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(value / 5) * 100}%` }}
            />
        </div>
    </div>
);

export default function TeachersPage() {
    const router = useRouter();
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState<string | 'all'>('all');

    const [user, setUser] = useState<any>(null);
    const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/teachers');
            if (res.ok) {
                const data = await res.json();
                setTeachers(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
        const savedUser = localStorage.getItem('bss_user');
        if (savedUser) setUser(JSON.parse(savedUser));
    }, []);

    const handleRateClick = (teacher: any) => {
        if (!user) {
            setIsAuthModalOpen(true);
        } else {
            setSelectedTeacher(teacher);
            setIsReviewModalOpen(true);
        }
    };

    const handleCommentsClick = (teacher: any) => {
        setSelectedTeacher(teacher);
        setIsCommentsModalOpen(true);
    };

    const filteredTeachers = teachers.filter((t: any) => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.subjects.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === 'all' || t.department === selectedDept;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="space-y-10">
            <header className="space-y-4">
                <h1 className="text-4xl font-extrabold tracking-tight">Преподаватели МТКП</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Честные отзывы и независимые оценки студентов. Оставь свой отзыв, чтобы помочь остальным.
                </p>
            </header>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center sticky top-16 md:top-20 z-40 bg-background/80 backdrop-blur-md py-4 transition-all -mx-4 px-4 md:mx-0 md:px-0 border-b border-border/50 md:border-none">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <input
                        type="text"
                        placeholder="Поиск преподавателя..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-secondary border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                    <Filter size={18} className="text-muted-foreground ml-2 min-w-[18px]" />
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="bg-secondary border-none rounded-xl py-2.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-primary cursor-pointer active:scale-95 transition-transform"
                    >
                        <option value="all">Все отделения</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                {loading ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground group">
                        <RefreshCcw size={48} className="animate-spin mb-4 text-primary" />
                        <p className="font-bold">Ведём опрос студентов...</p>
                    </div>
                ) : (
                    filteredTeachers.map((teacher) => (
                        <div
                            key={teacher.id}
                            className="bg-card border border-border rounded-3xl p-5 md:p-8 hover:shadow-2xl transition-all relative overflow-hidden group"
                        >
                            <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                                <div className="flex-shrink-0 flex justify-center sm:block">
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground group-hover:bg-primary/5 transition-colors overflow-hidden border border-border">
                                        {teacher.imageUrl ? (
                                            <img src={teacher.imageUrl} alt={teacher.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} />
                                        )}
                                    </div>
                                </div>

                                <div className="flex-grow space-y-4">
                                    <div className="text-center sm:text-left">
                                        <h2 className="text-xl md:text-2xl font-bold group-hover:text-primary transition-colors">{teacher.name}</h2>
                                        <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-wider">{teacher.department}</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                        {teacher.subjects && teacher.subjects.split(',').map((subject: string) => (
                                            <span key={subject} className="px-2.5 py-1 bg-muted rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-tight">
                                                {subject.trim()}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-border/50">
                                        <RatingBar label="Душка на парах" value={teacher.lecturesRating} />
                                        <RatingBar label="Душка на сессии" value={teacher.examsRating} />
                                        <RatingBar label="Понятность" value={teacher.clarityRating} />
                                        <RatingBar label="Справедливость" value={teacher.fairnessRating} />
                                    </div>

                                    <div className="flex items-center justify-between pt-6">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <StarRating rating={Math.round(teacher.overallRating)} size={18} />
                                                <span className="text-lg font-black">{teacher.overallRating.toFixed(1)}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-bold uppercase">Общий рейтинг</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleCommentsClick(teacher)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-xl text-muted-foreground text-sm font-bold hover:bg-secondary/80 transition-colors active:scale-95"
                                            >
                                                <MessageSquare size={16} />
                                                {teacher.reviewsCount}
                                            </button>
                                            <button
                                                onClick={() => handleRateClick(teacher)}
                                                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                                            >
                                                Оценить
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {teacher.overallRating >= 4.5 && (
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="bg-yellow-400 text-yellow-950 px-4 py-1 rounded-bl-2xl font-bold text-xs uppercase tracking-widest shadow-lg">
                                        ТОП
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {!loading && filteredTeachers.length === 0 && (
                <div className="text-center py-24 bg-secondary/50 rounded-3xl border-2 border-dashed border-border">
                    <p className="text-muted-foreground text-lg">Преподаватель не найден. Попробуйте уточнить поиск.</p>
                </div>
            )}

            {selectedTeacher && (
                <>
                    <ReviewModal
                        teacherId={selectedTeacher.id}
                        teacherName={selectedTeacher.name}
                        isOpen={isReviewModalOpen}
                        onClose={() => {
                            setIsReviewModalOpen(false);
                            // setSelectedTeacher(null); // Keep it for a bit to avoid flicker if needed
                        }}
                        onSuccess={fetchTeachers}
                    />
                    <CommentsModal
                        teacherId={selectedTeacher.id}
                        teacherName={selectedTeacher.name}
                        isOpen={isCommentsModalOpen}
                        onClose={() => setIsCommentsModalOpen(false)}
                    />
                </>
            )}

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={() => {
                    const savedUser = localStorage.getItem('bss_user');
                    if (savedUser) setUser(JSON.parse(savedUser));
                    window.location.reload();
                }}
            />
        </div>
    );
}
