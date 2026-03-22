'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    X, Check, Save, Eye, FileText, UserPlus, Wrench,
    Bold, Italic, List, Link as LinkIcon, Heading1, Heading2,
    ChevronLeft, Image as ImageIcon, Search, Trash2, RefreshCcw
} from 'lucide-react';

export default function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [group, setGroup] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('Конспект');
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

    // Subjects management
    const [allSubjects, setAllSubjects] = useState<any[]>([]);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [course, setCourse] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [subRes, subjsRes] = await Promise.all([
                    fetch(`/api/admin/submissions/${id}`),
                    fetch('/api/admin/subjects')
                ]);

                if (subRes.ok) {
                    const data = await subRes.json();
                    setSubmission(data);
                    setTitle(data.title || '');
                    setContent(data.content || '');
                    setGroup(data.group || '');
                    setImageUrl(data.imageUrl || '');
                    setCategory(data.category || 'Конспект');
                    if (data.type === 'teacher' && data.content) {
                        setSelectedSubjects(data.content.split(',').map((s: string) => s.trim()));
                    }
                }

                if (subjsRes.ok) {
                    setAllSubjects(await subjsRes.json());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (group) {
            const match = group.match(/\d/);
            if (match) {
                const semester = parseInt(match[0]);
                setCourse(Math.ceil(semester / 2));
            }
        }
    }, [group]);

    const handleAction = async (action: 'approve' | 'save_draft') => {
        setIsSaving(true);
        try {
            const updatedData = {
                title,
                content: submission.type === 'teacher' ? selectedSubjects.join(', ') : content,
                group,
                imageUrl,
                category,
                course
            };

            const res = await fetch('/api/admin/moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: parseInt(id), action, updatedData }),
            });

            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                alert('Ошибка при сохранении');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const insertText = (before: string, after: string = '') => {
        const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selected = text.substring(start, end);
        const replacement = before + selected + after;

        setContent(text.substring(0, start) + replacement + text.substring(end));

        // Refocus and set cursor (next tick)
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <RefreshCcw className="animate-spin text-primary" size={40} />
        </div>
    );

    if (!submission) return <div>Заявка не найдена</div>;

    const filteredSubjects = allSubjects.filter(s =>
        s.name.toLowerCase().includes(subjectSearch.toLowerCase()) &&
        !selectedSubjects.includes(s.name)
    );

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-xl transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black flex items-center gap-2">
                            {submission.type === 'material' && <FileText size={20} className="text-blue-500" />}
                            {submission.type === 'teacher' && <UserPlus size={20} className="text-emerald-500" />}
                            {submission.type === 'tool' && <Wrench size={20} className="text-orange-500" />}
                            Редактирование
                        </h1>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID: {id}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => handleAction('save_draft')}
                        disabled={isSaving}
                        className="bg-secondary text-secondary-foreground px-6 py-2.5 rounded-xl font-black text-sm hover:bg-muted transition-all active:scale-95 disabled:opacity-50"
                    >
                        В черновики
                    </button>
                    <button
                        onClick={() => handleAction('approve')}
                        disabled={isSaving}
                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-black text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
                    >
                        Опубликовать
                    </button>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto p-6 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left Side: Editor */}
                    <div className="space-y-8">
                        {/* Meta Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Заголовок</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-secondary border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                                />
                            </div>
                            {submission.type === 'material' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Группа</label>
                                    <input
                                        value={group}
                                        onChange={(e) => setGroup(e.target.value)}
                                        placeholder="ТИП 11"
                                        className="w-full bg-secondary border-none rounded-2xl py-4 px-5 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                            )}
                            {submission.type === 'teacher' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Ссылка на фото</label>
                                    <div className="relative">
                                        <input
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-secondary border-none rounded-2xl py-4 pl-12 pr-5 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Formatting Toolbar & Content */}
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                                {submission.type === 'teacher' ? 'Предметы' : 'Содержимое'}
                            </label>

                            {submission.type === 'teacher' ? (
                                <div className="space-y-4">
                                    <div className="flex flex-wrap gap-2 p-4 bg-secondary/30 border border-border rounded-2xl min-h-[60px]">
                                        {selectedSubjects.map((s, i) => (
                                            <span key={i} className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                                {s}
                                                <button onClick={() => setSelectedSubjects(selectedSubjects.filter((_, idx) => idx !== i))}>
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                        {selectedSubjects.length === 0 && <span className="text-muted-foreground italic text-sm">Предметы не выбраны</span>}
                                    </div>
                                    <div className="relative">
                                        <input
                                            value={subjectSearch}
                                            onChange={(e) => setSubjectSearch(e.target.value)}
                                            placeholder="Поиск предмета..."
                                            className="w-full bg-secondary border-none rounded-2xl py-4 pl-12 pr-5 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />

                                        {subjectSearch && filteredSubjects.length > 0 && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-2xl shadow-2xl z-10 max-h-60 overflow-y-auto no-scrollbar">
                                                {filteredSubjects.map(s => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => {
                                                            setSelectedSubjects([...selectedSubjects, s.name]);
                                                            setSubjectSearch('');
                                                        }}
                                                        className="w-full text-left px-5 py-3 hover:bg-secondary transition-colors font-medium border-b border-border last:border-0"
                                                    >
                                                        {s.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-border rounded-[2rem] overflow-hidden bg-card shadow-xl shadow-black/5">
                                    <div className="flex items-center gap-1 p-2 bg-secondary/50 border-b border-border overflow-x-auto no-scrollbar">
                                        <button onClick={() => insertText('# ', '')} className="p-2.5 hover:bg-muted rounded-xl" title="H1"><Heading1 size={18} /></button>
                                        <button onClick={() => insertText('## ', '')} className="p-2.5 hover:bg-muted rounded-xl" title="H2"><Heading2 size={18} /></button>
                                        <div className="w-px h-6 bg-border mx-1" />
                                        <button onClick={() => insertText('**', '**')} className="p-2.5 hover:bg-muted rounded-xl" title="Жирный"><Bold size={18} /></button>
                                        <button onClick={() => insertText('*', '*')} className="p-2.5 hover:bg-muted rounded-xl" title="Курсив"><Italic size={18} /></button>
                                        <div className="w-px h-6 bg-border mx-1" />
                                        <button onClick={() => insertText('- ', '')} className="p-2.5 hover:bg-muted rounded-xl" title="Список"><List size={18} /></button>
                                        <button onClick={() => insertText('[', '](url)')} className="p-2.5 hover:bg-muted rounded-xl" title="Ссылка"><LinkIcon size={18} /></button>
                                    </div>
                                    <textarea
                                        id="editor-textarea"
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        rows={15}
                                        placeholder="Начни писать здесь..."
                                        className="w-full bg-transparent border-none p-6 focus:ring-0 outline-none resize-none font-mono text-sm leading-relaxed"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Preview */}
                    <div className="space-y-6">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                            <Eye size={12} /> Предпросмотр карточки
                        </label>

                        <div className="p-10 bg-secondary/10 rounded-[3rem] border border-dashed border-border flex items-center justify-center min-h-[500px]">
                            {submission.type === 'material' && (
                                <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-8 shadow-2xl hover:scale-[1.02] transition-transform">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-primary text-primary-foreground rounded-2xl">
                                            <FileText size={32} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-secondary px-3 py-1.5 rounded-full">
                                            {category}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black mb-3 line-clamp-2 leading-tight">{title || 'Заголовок'}</h3>
                                    <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
                                        Предмет: <span className="text-foreground font-bold">{content || '...'}</span>
                                    </p>
                                    <div className="flex justify-between items-center pt-6 border-t border-border">
                                        <span className="text-[10px] font-black px-4 py-2 bg-primary/10 text-primary rounded-full uppercase tracking-widest">
                                            {course} курс
                                        </span>
                                        {group && <span className="text-xs font-bold text-muted-foreground italic">{group}</span>}
                                    </div>
                                </div>
                            )}

                            {submission.type === 'teacher' && (
                                <div className="w-full max-w-sm bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl overflow-hidden hover:scale-[1.02] transition-transform">
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center text-muted-foreground overflow-hidden border border-border">
                                            {imageUrl ? (
                                                <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserPlus size={40} />
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-xl font-black leading-tight">{title || 'Имя преподавателя'}</h3>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Общее отделение</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider ml-1">Ведет предметы:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSubjects.map((s, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-muted rounded-xl text-[10px] font-bold uppercase tracking-tight">{s}</span>
                                            ))}
                                            {selectedSubjects.length === 0 && <span className="text-muted-foreground italic text-xs">...</span>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {submission.type === 'tool' && (
                                <div className="w-full max-w-sm bg-card border border-border rounded-3xl p-8 shadow-2xl flex items-center gap-6 hover:scale-[1.02] transition-transform">
                                    <div className="p-4 bg-orange-500/10 text-orange-500 rounded-2xl shadow-inner shadow-orange-500/5">
                                        <Wrench size={32} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-black text-xl leading-tight">{title || 'Инструмент'}</h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{content || 'Описание...'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
