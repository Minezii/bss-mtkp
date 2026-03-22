'use client';

import { useEffect, useRef } from 'react';
import { Send, Globe, Quote } from 'lucide-react';
// @ts-ignore
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

interface Block {
    type: string;
    data: any;
}

interface SummaryRendererProps {
    data: {
        blocks: Block[];
    };
}

export default function SummaryRenderer({ data }: SummaryRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            try {
                renderMathInElement(containerRef.current, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false },
                    ],
                    throwOnError: false,
                });
            } catch (err) {
                console.error("KaTeX rendering error:", err);
            }
        }
    }, [data]);

    if (!data?.blocks) return (
        <div className="py-20 text-center text-muted-foreground bg-secondary/10 rounded-3xl border border-dashed border-border">
            <p className="font-medium">Конспект пуст или ожидает обработки</p>
        </div>
    );

    return (
        <div ref={containerRef} className="space-y-8 pb-20 mt-8">
            {data.blocks.map((block, index) => {
                switch (block.type) {
                    case 'header':
                        const level = block.data.level || 2;
                        const headerContent = <span dangerouslySetInnerHTML={{ __html: block.data.text }} />;
                        const hClasses = {
                            1: 'text-4xl font-black mt-16 mb-8 text-foreground pb-4 border-b-4 border-primary/20',
                            2: 'text-3xl font-black mt-12 mb-6 text-foreground/90 flex items-center gap-3',
                            3: 'text-2xl font-black mt-8 mb-4 text-foreground/80'
                        }[level as 1 | 2 | 3] || 'text-xl font-bold';

                        if (level === 1) return <h1 key={index} className={hClasses}>{headerContent}</h1>;
                        if (level === 3) return <h3 key={index} className={hClasses}>{headerContent}</h3>;
                        return (
                            <h2 key={index} className={`${hClasses} relative`}>
                                <span className="absolute -left-4 top-0 bottom-0 w-1 bg-primary rounded-full hidden md:block" />
                                {headerContent}
                            </h2>
                        );

                    case 'paragraph':
                        return (
                            <p key={index} className="text-lg leading-relaxed text-foreground/85 font-medium" dangerouslySetInnerHTML={{ __html: block.data.text }} />
                        );

                    case 'list':
                        return (
                            <ul key={index} className={`space-y-3 ${block.data.style === 'ordered' ? 'list-decimal' : 'list-none'} ml-6 my-6`}>
                                {block.data.items.map((item: any, i: number) => {
                                    const content = typeof item === 'string' ? item : item.content;
                                    return (
                                        <li key={i} className="flex gap-3 text-lg leading-relaxed group">
                                            {block.data.style !== 'ordered' && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0 group-hover:scale-150 transition-transform" />}
                                            <span className="flex-1" dangerouslySetInnerHTML={{ __html: content }} />
                                        </li>
                                    );
                                })}
                            </ul>
                        );

                    case 'delimiter':
                        return (
                            <div key={index} className="flex justify-center py-12">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary/20" />
                                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                                    <div className="w-2 h-2 rounded-full bg-primary/20" />
                                </div>
                            </div>
                        );

                    case 'code':
                        return (
                            <div key={index} className="relative group my-8">
                                <pre className="bg-[#0D1117] text-[#E6EDF3] p-6 rounded-2xl overflow-x-auto border border-white/5 font-mono text-sm leading-relaxed shadow-2xl">
                                    <code>{block.data.code}</code>
                                </pre>
                                <div className="absolute top-4 right-4 text-xs font-bold text-white/30 uppercase tracking-widest group-hover:text-white/60 transition-colors">Code</div>
                            </div>
                        );

                    case 'quote':
                        return (
                            <blockquote key={index} className="relative px-10 py-8 my-10 bg-secondary/30 rounded-3xl border-l-8 border-primary italic shadow-sm overflow-hidden">
                                <Quote size={40} className="absolute -top-2 -left-2 text-primary opacity-10 rotate-180" />
                                <p className="text-xl font-medium leading-relaxed z-10 relative" dangerouslySetInnerHTML={{ __html: block.data.text }} />
                                {block.data.caption && <cite className="block mt-4 text-sm font-bold text-muted-foreground not-italic uppercase tracking-widest">— {block.data.caption}</cite>}
                            </blockquote>
                        );

                    case 'anyButton':
                        return (
                            <div key={index} className="my-12 flex justify-center">
                                <a
                                    href={block.data.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#5865F2] text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-105 transition-all active:scale-95 shadow-xl shadow-[#5865F2]/20 flex items-center gap-3 no-underline group"
                                >
                                    <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    {block.data.text}
                                </a>
                            </div>
                        );

                    case 'linkTool':
                        return (
                            <div key={index} className="mb-10 p-6 bg-secondary/20 rounded-3xl border border-border/50 hover:bg-secondary/40 transition-all group overflow-hidden relative">
                                <a href={block.data.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 no-underline">
                                    <div className="flex-grow min-w-0 z-10">
                                        <h4 className="font-black text-xl mb-2 group-hover:text-primary transition-colors line-clamp-1">{block.data.meta?.title || block.data.link}</h4>
                                        {block.data.meta?.description && <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{block.data.meta.description}</p>}
                                        <div className="flex items-center gap-2 mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                            <Globe size={14} />
                                            <span>{new URL(block.data.link).hostname}</span>
                                        </div>
                                    </div>
                                    {block.data.meta?.image?.url && (
                                        <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden hidden sm:block shadow-lg group-hover:scale-105 transition-transform">
                                            <img src={block.data.meta.image.url} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </a>
                            </div>
                        );

                    default:
                        console.log("Unknown block type:", block.type);
                        return null;
                }
            })}
        </div>
    );
}
