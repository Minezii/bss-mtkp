'use client';

import { CheckCircle2, Circle } from 'lucide-react';

interface Block {
    type: string;
    data: any;
}

interface SummaryRendererProps {
    blocks: Block[];
}

export default function SummaryRenderer({ blocks }: SummaryRendererProps) {
    if (!blocks || !Array.isArray(blocks)) return null;

    const renderBlock = (block: Block, index: number) => {
        switch (block.type) {
            case 'header':
                const level = block.data.level || 2;
                const headerClasses = {
                    1: 'text-3xl md:text-4xl font-black mt-12 mb-6 tracking-tight',
                    2: 'text-2xl md:text-3xl font-extrabold mt-10 mb-4 tracking-tight text-primary',
                    3: 'text-xl md:text-2xl font-bold mt-8 mb-3 tracking-tight',
                    4: 'text-lg md:text-xl font-bold mt-6 mb-2',
                    5: 'text-base md:text-lg font-bold mt-4 mb-2',
                    6: 'text-sm md:text-base font-bold mt-4 mb-1 uppercase tracking-wider text-muted-foreground'
                }[level as number] || 'text-2xl font-bold mt-8 mb-4';

                const Tag = `h${level}` as any;
                return (
                    <Tag key={index} className={headerClasses} dangerouslySetInnerHTML={{ __html: block.data.text }} />
                );

            case 'paragraph':
                return (
                    <p
                        key={index}
                        className="text-base md:text-lg leading-relaxed text-foreground/90 mb-6 last:mb-0"
                        dangerouslySetInnerHTML={{ __html: block.data.text }}
                    />
                );

            case 'list':
                const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                return (
                    <ListTag key={index} className={`mb-6 space-y-3 ${block.data.style === 'ordered' ? 'list-decimal' : 'list-disc'} list-outside ml-6 text-foreground/90`}>
                        {block.data.items.map((item: any, i: number) => {
                            // Support string items or object items (Nested List or newer Editor.js format)
                            const content = typeof item === 'string' ? item : (item.content || item.text || '');
                            return (
                                <li key={i} className="pl-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
                            );
                        })}
                    </ListTag>
                );

            case 'checklist':
                return (
                    <div key={index} className="mb-6 space-y-3">
                        {block.data.items.map((item: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 text-foreground/90 leading-relaxed group">
                                <div className="mt-1 flex-shrink-0">
                                    {item.checked ? (
                                        <CheckCircle2 size={20} className="text-primary fill-primary/10" />
                                    ) : (
                                        <Circle size={20} className="text-muted-foreground" />
                                    )}
                                </div>
                                <span dangerouslySetInnerHTML={{ __html: item.text }} />
                            </div>
                        ))}
                    </div>
                );

            case 'quote':
                return (
                    <blockquote key={index} className="relative mb-8 mt-8 border-l-4 border-primary pl-6 py-2 italic font-medium text-lg md:text-xl text-primary/90 bg-primary/5 rounded-r-2xl">
                        <p className="mb-2" dangerouslySetInnerHTML={{ __html: block.data.text }} />
                        {block.data.caption && (
                            <cite className="text-sm font-bold opacity-70 not-italic block mt-2">— {block.data.caption}</cite>
                        )}
                    </blockquote>
                );

            case 'code':
                return (
                    <div key={index} className="relative mb-8 overflow-hidden rounded-2xl bg-[#0d1117] group">
                        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                            <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Source Code</span>
                        </div>
                        <pre className="p-6 md:p-8 overflow-x-auto no-scrollbar font-mono text-sm md:text-base leading-relaxed text-white">
                            <code dangerouslySetInnerHTML={{ __html: block.data.code }} />
                        </pre>
                    </div>
                );

            case 'table':
                return (
                    <div key={index} className="mb-8 overflow-hidden border border-border rounded-2xl bg-card">
                        <div className="overflow-x-auto no-scrollbar">
                            <table className="w-full text-sm md:text-base border-collapse">
                                <tbody>
                                    {block.data.content.map((row: string[], ri: number) => (
                                        <tr key={ri} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                                            {row.map((cell: string, ci: number) => (
                                                <td key={ci} className={`p-4 ${ri === 0 && block.data.withHeadings ? 'bg-secondary font-bold text-foreground' : 'text-foreground/80'} border-r border-border last:border-0`} dangerouslySetInnerHTML={{ __html: cell }} />
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'image':
                return (
                    <figure key={index} className="mb-10 space-y-3">
                        <div className="overflow-hidden rounded-3xl border border-border/50 shadow-xl shadow-foreground/5 bg-secondary/20">
                            <img
                                src={block.data.file?.url || block.data.url}
                                alt={block.data.caption || 'Image'}
                                className="w-full h-auto object-cover max-h-[600px]"
                            />
                        </div>
                        {block.data.caption && (
                            <figcaption className="text-center text-sm md:text-base text-muted-foreground font-medium italic border-b border-primary/20 pb-2 w-fit mx-auto">
                                {block.data.caption}
                            </figcaption>
                        )}
                    </figure>
                );

            case 'delimiter':
                return (
                    <hr key={index} className="my-12 border-t-2 border-dashed border-border flex justify-around before:content-['***'] before:text-muted-foreground before:tracking-[1em] after:content-none border-none text-center" />
                );

            case 'warning':
                return (
                    <div key={index} className="mb-8 p-6 bg-yellow-500/10 border-l-4 border-yellow-500 rounded-r-2xl space-y-2">
                        <p className="font-bold text-yellow-600 dark:text-yellow-400">{block.data.title || 'Внимание'}</p>
                        <p className="text-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.data.message }} />
                    </div>
                );

            default:
                console.log(`Unknown block type: ${block.type}`, block);
                return null;
        }
    };

    return (
        <article className="max-w-none">
            {blocks.map((block, index) => renderBlock(block, index))}
        </article>
    );
}
