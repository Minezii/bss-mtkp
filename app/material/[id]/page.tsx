'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, RefreshCcw, Clock, BookOpen, FileText, Download } from 'lucide-react';
import SummaryRenderer from '@/components/SummaryRenderer';
import { parseAttachedFilename, isHttpUrl } from '@/lib/materialLink';

export default function MaterialPage() {
    const params = useParams();
    const router = useRouter();
    const [material, setMaterial] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchMaterial = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/materials/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                setMaterial(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchMaterial();
        }
    }, [params.id]);

    const parseMarkdownToBlocks = (md: string) => {
        const lines = md.split('\n');
        const blocks: any[] = [];
        let currentList: any[] = [];

        const flushList = () => {
            if (currentList.length > 0) {
                blocks.push({
                    type: 'list',
                    data: { style: 'unordered', items: [...currentList] }
                });
                currentList = [];
            }
        };

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('# ')) {
                flushList();
                blocks.push({ type: 'header', data: { level: 1, text: trimmed.replace('# ', '') } });
            } else if (trimmed.startsWith('## ')) {
                flushList();
                blocks.push({ type: 'header', data: { level: 2, text: trimmed.replace('## ', '') } });
            } else if (trimmed.startsWith('- ')) {
                currentList.push(trimmed.replace('- ', ''));
            } else if (trimmed === '') {
                flushList();
            } else {
                flushList();
                blocks.push({ type: 'paragraph', data: { text: trimmed } });
            }
        });

        flushList();
        return { blocks };
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <RefreshCcw className="animate-spin text-primary" size={40} />
        </div>
    );

    if (!material) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold mb-4">Конспект не найден</h1>
            <button onClick={() => router.back()} className="text-primary hover:underline">Вернуться назад</button>
        </div>
    );

    const attachedName = parseAttachedFilename(material.fileUrl);
    const hasDownloadableFile = isHttpUrl(material.fileUrl);

    const downloadFilename = attachedName || material.fileUrl?.split('/').pop()?.split('?')[0] || 'file';

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="h-16 md:h-20" />

            <main className="max-w-4xl mx-auto px-6 pt-12">
                <button
                    onClick={() => router.back()}
                    className="group mb-12 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Назад к каталогу</span>
                </button>

                <div className="mb-16 space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-xs uppercase tracking-widest border border-primary/20">
                        <BookOpen size={14} />
                        {material.category || 'Конспект'}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        {material.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 pt-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock size={18} />
                            <span className="font-medium">{new Date(material.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Предмет:</span>
                            <span className="font-bold">{material.subject}</span>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="px-3 py-1 bg-secondary rounded-lg font-bold text-xs uppercase">
                            {material.course} курс
                        </div>
                    </div>
                </div>

                {hasDownloadableFile && (
                    <div className="mb-12">
                        <a
                            href={material.fileUrl}
                            download={downloadFilename}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 p-6 bg-primary/5 border border-primary/10 rounded-3xl hover:bg-primary/10 hover:border-primary/20 transition-all"
                        >
                            <div className="p-3 bg-primary text-primary-foreground rounded-2xl shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                <Download size={22} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-lg text-primary group-hover:underline break-all">
                                    {attachedName || 'Скачать файл'}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Нажми, чтобы скачать
                                </p>
                            </div>
                            <Download size={20} className="text-muted-foreground group-hover:text-primary group-hover:translate-y-0.5 transition-all shrink-0" />
                        </a>
                    </div>
                )}

                {attachedName && !hasDownloadableFile && (
                    <div className="mb-12 p-6 bg-secondary/30 border border-border rounded-3xl flex items-start gap-4">
                        <div className="p-3 bg-primary text-primary-foreground rounded-2xl shrink-0">
                            <FileText size={22} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-lg break-all">{attachedName}</p>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                Файл был приложен при отправке, но не сохранён на сервере. Скачать его отсюда нельзя.
                            </p>
                        </div>
                    </div>
                )}

                {material.content ? (
                    <div className="prose prose-invert max-w-none">
                        <SummaryRenderer data={parseMarkdownToBlocks(material.content)} />
                    </div>
                ) : !attachedName && !hasDownloadableFile ? (
                    <p className="text-muted-foreground">У этого конспекта пока нет содержимого для просмотра.</p>
                ) : null}

                <div className="mt-20 pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-1 text-center md:text-left">
                        <h3 className="text-lg font-bold">Понравился конспект?</h3>
                        <p className="text-sm text-muted-foreground">Поделись ссылкой со своими друзьями и одногруппниками!</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
