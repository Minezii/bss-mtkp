'use client';

import { useRef, useEffect } from "react";
import katex from "katex";
// @ts-ignore
import renderMathInElement from "katex/contrib/auto-render";
import "katex/dist/katex.min.css";

interface SummaryRendererProps {
    data: any;
}

// Custom AnyButton tool for Editor.js (Added to support Telegram links from the bot)
class AnyButtonTool {
    static get isReadOnly() { return true; }
    data: any;
    constructor({ data }: { data: any }) {
        this.data = data;
    }
    render() {
        const div = document.createElement('div');
        div.className = 'my-10 flex justify-center';
        const a = document.createElement('a');
        a.href = this.data.link;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'bg-[#5865F2] text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all active:scale-95 shadow-lg shadow-[#5865F2]/20 flex items-center gap-2 no-underline';
        a.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg> <span>${this.data.text}</span>`;
        div.appendChild(a);
        return div;
    }
}

export default function SummaryRenderer({ data }: SummaryRendererProps) {
    const editorRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const renderAllFormulas = (container: HTMLElement) => {
        renderMathInElement(container, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
            ],
            throwOnError: false,
        });

        container
            .querySelectorAll(".katex")
            .forEach((el) => makeFormulaEditable(el as HTMLElement));
    };

    const makeFormulaEditable = (el: HTMLElement) => {
        if (el.dataset.editable) return;

        el.addEventListener("dblclick", () => {
            const latex = el.getAttribute("data-tex");

            const input = document.createElement("input");
            input.value = latex || "";
            input.style.width = "100%";

            el.replaceWith(input);
            input.focus();

            input.addEventListener("blur", () => {
                const newLatex = input.value;

                const span = document.createElement("span");
                span.setAttribute("data-tex", newLatex);
                span.classList.add("katex-placeholder");

                input.replaceWith(span);

                try {
                    katex.render(newLatex, span, { throwOnError: false });
                } catch {
                    span.textContent = newLatex;
                }

                makeFormulaEditable(span);
            });
        });

        el.dataset.editable = "true";
    };

    useEffect(() => {
        if (!containerRef.current || !data) return;

        const initEditor = async () => {
            try {
                // @ts-ignore
                const EditorJS = (await import("@editorjs/editorjs")).default;
                // @ts-ignore
                const Header = (await import("@editorjs/header")).default;
                // @ts-ignore
                const List = (await import("@editorjs/list")).default;
                // @ts-ignore
                const Paragraph = (await import("@editorjs/paragraph")).default;
                // @ts-ignore
                const Delimiter = (await import("@editorjs/delimiter")).default;
                // @ts-ignore
                const CodeTool = (await import("@editorjs/code")).default;
                // @ts-ignore
                const Quote = (await import("@editorjs/quote")).default;
                // @ts-ignore
                const Marker = (await import("@editorjs/marker")).default;
                // @ts-ignore
                const InlineCode = (await import("@editorjs/inline-code")).default;
                // @ts-ignore
                const Table = (await import("@editorjs/table")).default;

                if (!editorRef.current) {
                    const editor = new EditorJS({
                        holder: containerRef.current as any,
                        readOnly: true,
                        autofocus: true,
                        data: data,
                        tools: {
                            table: Table,
                            header: { class: Header, inlineToolbar: true },
                            list: { class: List, inlineToolbar: true },
                            paragraph: { class: Paragraph, inlineToolbar: true },
                            quote: { class: Quote, inlineToolbar: true },
                            delimiter: Delimiter,
                            code: CodeTool,
                            marker: Marker,
                            inlineCode: InlineCode,
                            anyButton: AnyButtonTool as any,
                        },
                        onReady: () => {
                            if (containerRef.current) {
                                renderAllFormulas(containerRef.current);
                            }
                        },
                    });

                    editorRef.current = editor;
                }
            } catch (err) {
                console.error("Failed to initialize EditorJS:", err);
            }
        };

        if (typeof window !== "undefined") {
            initEditor();
        }

        return () => {
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [data]);

    return (
        <div className="prose prose-blue dark:prose-invert max-w-none">
            <style dangerouslySetInnerHTML={{
                __html: `
                .ce-block__content { max-width: 100% !important; margin: 0 !important; }
                .codex-editor__redactor { padding-bottom: 0 !important; margin-right: 0 !important; }
                .ce-header { font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; }
                .ce-paragraph { font-size: 1.125rem; line-height: 1.75; color: hsl(var(--foreground) / 0.9); }
                .ce-code__textarea { background: #0d1117 !important; color: #e6edf3 !important; border-radius: 1rem !important; }
                .ce-table { border-collapse: collapse; margin: 2rem 0; width: 100%; border: 1px solid hsl(var(--border) / 0.5); }
                .ce-table__cell { border: 1px solid hsl(var(--border) / 0.5); padding: 0.75rem; }
                .tc-row--header { background: hsl(var(--secondary) / 0.5); font-weight: bold; }
                .katex-placeholder { display: inline-block; min-width: 1em; }
            `}} />
            <div id="editorjs" ref={containerRef} className="min-h-[200px]" />
        </div>
    );
}
