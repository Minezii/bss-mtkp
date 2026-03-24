'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
    Calculator,
    Plus,
    Trash2,
    Eye,
    EyeOff,
    ArrowLeft,
    ChevronRight,
    Search,
    Maximize2,
    RotateCcw,
    MousePointer2,
    Zap,
    Palette
} from 'lucide-react';
import Link from 'next/link';

interface Plot {
    id: string;
    expression: string;
    color: string;
    visible: boolean;
}

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function GraphCalcPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [plots, setPlots] = useState<Plot[]>([
        { id: '1', expression: 'x^2', color: COLORS[0], visible: true }
    ]);
    const [viewport, setViewport] = useState({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
    const [isDragging, setIsDragging] = useState(false);
    const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

    const addPlot = () => {
        const nextColor = COLORS[plots.length % COLORS.length];
        setPlots([...plots, { id: Math.random().toString(36).substr(2, 9), expression: '', color: nextColor, visible: true }]);
    };

    const removePlot = (id: string) => {
        if (plots.length > 1) {
            setPlots(plots.filter(p => p.id !== id));
        }
    };

    const updatePlot = (id: string, updates: Partial<Plot>) => {
        setPlots(plots.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const evaluate = (expression: string, x: number) => {
        try {
            // Very basic sanitation and replacement
            const sanitized = expression
                .replace(/\^/g, '**')
                .replace(/sin/g, 'Math.sin')
                .replace(/cos/g, 'Math.cos')
                .replace(/tan/g, 'Math.tan')
                .replace(/exp/g, 'Math.exp')
                .replace(/log/g, 'Math.log')
                .replace(/sqrt/g, 'Math.sqrt')
                .replace(/abs/g, 'Math.abs')
                .replace(/pi/g, 'Math.PI')
                .replace(/e/g, 'Math.E');

            // eslint-disable-next-line no-new-func
            const fn = new Function('x', `return ${sanitized}`);
            return fn(x);
        } catch (e) {
            return NaN;
        }
    };

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        const xToPixel = (x: number) => (x - viewport.xMin) * (width / (viewport.xMax - viewport.xMin));
        const yToPixel = (y: number) => height - (y - viewport.yMin) * (height / (viewport.yMax - viewport.yMin));

        // Draw Grid
        ctx.strokeStyle = '#e2e8f0'; // slate-200
        ctx.lineWidth = 1;

        // Vertical lines
        const xStep = Math.pow(10, Math.floor(Math.log10(viewport.xMax - viewport.xMin)) - 1);
        for (let x = Math.floor(viewport.xMin / xStep) * xStep; x <= viewport.xMax; x += xStep) {
            ctx.beginPath();
            ctx.moveTo(xToPixel(x), 0);
            ctx.lineTo(xToPixel(x), height);
            ctx.stroke();
        }

        // Horizontal lines
        const yStep = Math.pow(10, Math.floor(Math.log10(viewport.yMax - viewport.yMin)) - 1);
        for (let y = Math.floor(viewport.yMin / yStep) * yStep; y <= viewport.yMax; y += yStep) {
            ctx.beginPath();
            ctx.moveTo(0, yToPixel(y));
            ctx.lineTo(width, yToPixel(y));
            ctx.stroke();
        }

        // Draw Axes
        ctx.strokeStyle = '#64748b'; // slate-500
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(xToPixel(0), 0);
        ctx.lineTo(xToPixel(0), height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, yToPixel(0));
        ctx.lineTo(width, yToPixel(0));
        ctx.stroke();

        // Draw Plots
        plots.forEach(plot => {
            if (!plot.visible || !plot.expression) return;

            ctx.beginPath();
            ctx.strokeStyle = plot.color;
            ctx.lineWidth = 3;
            ctx.lineJoin = 'round';

            let first = true;
            for (let px = 0; px <= width; px += 2) {
                const x = viewport.xMin + (px / width) * (viewport.xMax - viewport.xMin);
                const y = evaluate(plot.expression, x);

                if (!isNaN(y) && isFinite(y)) {
                    const py = yToPixel(y);
                    if (first) {
                        ctx.moveTo(px, py);
                        first = false;
                    } else {
                        ctx.lineTo(px, py);
                    }
                } else {
                    first = true;
                }
            }
            ctx.stroke();
        });

        // Highlight Roots (Simplified sampler)
        plots.forEach(plot => {
            if (!plot.visible || !plot.expression) return;
            ctx.fillStyle = plot.color;

            for (let px = 0; px <= width; px += 5) {
                const x = viewport.xMin + (px / width) * (viewport.xMax - viewport.xMin);
                const y1 = evaluate(plot.expression, x);
                const x2 = viewport.xMin + ((px + 1) / width) * (viewport.xMax - viewport.xMin);
                const y2 = evaluate(plot.expression, x2);

                if (y1 * y2 <= 0 && !isNaN(y1) && !isNaN(y2)) {
                    // Crossing zero detected
                    ctx.beginPath();
                    ctx.arc(px, yToPixel(0), 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = 'white';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
        });
    };

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = canvasRef.current.parentElement?.clientWidth || 800;
                canvasRef.current.height = canvasRef.current.parentElement?.clientHeight || 600;
                draw();
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, [plots, viewport]);

    useEffect(() => {
        draw();
    }, [plots, viewport]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const zoom = e.deltaY > 0 ? 1.1 : 0.9;
        const dx = (viewport.xMax - viewport.xMin) * (zoom - 1);
        const dy = (viewport.yMax - viewport.yMin) * (zoom - 1);
        setViewport({
            xMin: viewport.xMin - dx / 2,
            xMax: viewport.xMax + dx / 2,
            yMin: viewport.yMin - dy / 2,
            yMax: viewport.yMax + dy / 2
        });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.x;
        const dy = e.clientY - lastPos.y;

        const unitsPerPixelX = (viewport.xMax - viewport.xMin) / (canvasRef.current?.width || 1);
        const unitsPerPixelY = (viewport.yMax - viewport.yMin) / (canvasRef.current?.height || 1);

        setViewport({
            xMin: viewport.xMin - dx * unitsPerPixelX,
            xMax: viewport.xMax - dx * unitsPerPixelX,
            yMin: viewport.yMin + dy * unitsPerPixelY,
            yMax: viewport.yMax + dy * unitsPerPixelY
        });
        setLastPos({ x: e.clientX, y: e.clientY });
    };

    const resetViewport = () => {
        setViewport({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 pb-4">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link
                        href="/tools"
                        className="p-2 bg-secondary rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                            Графический калькулятор
                        </h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Математический инструмент БСС</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={resetViewport}
                        className="p-3 bg-card border border-border rounded-xl hover:bg-secondary transition-colors"
                        title="Сбросить вид"
                    >
                        <RotateCcw size={20} className="text-muted-foreground" />
                    </button>
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-2 rounded-xl text-xs font-black border border-blue-500/20">
                        <Zap size={14} fill="currentColor" />
                        Beta
                    </div>
                </div>
            </header>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Sidebar - Function List */}
                <aside className="w-80 bg-card border border-border rounded-[2rem] flex flex-col shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
                        <h2 className="font-black text-lg">Функции</h2>
                        <button
                            onClick={addPlot}
                            className="p-2 bg-primary text-primary-foreground rounded-lg hover:scale-110 active:scale-95 transition-all"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {plots.map((plot, idx) => (
                            <div key={plot.id} className="p-4 bg-secondary/30 rounded-2xl border border-border space-y-3 group transition-all hover:border-primary/20">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: plot.color, boxShadow: `0 0 10px ${plot.color}44` }}
                                    />
                                    <input
                                        type="text"
                                        value={plot.expression}
                                        onChange={(e) => updatePlot(plot.id, { expression: e.target.value })}
                                        placeholder={`y = f(x)`}
                                        className="flex-1 bg-transparent border-none outline-none font-bold text-lg placeholder:text-muted-foreground/30 placeholder:font-normal"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <div className="flex gap-1">
                                        {COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => updatePlot(plot.id, { color: c })}
                                                className={`w-5 h-5 rounded-md transition-all hover:scale-110 ${plot.color === c ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => updatePlot(plot.id, { visible: !plot.visible })}
                                            className="p-1.5 hover:bg-background rounded-lg text-muted-foreground"
                                        >
                                            {plot.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                        <button
                                            onClick={() => removePlot(plot.id)}
                                            className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-muted-foreground"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 bg-secondary/10 text-[10px] text-muted-foreground uppercase font-black tracking-tighter text-center">
                        Используйте: x, sin, cos, tan, sqrt, ^
                    </div>
                </aside>

                {/* Main Graph Area */}
                <main className="flex-1 relative bg-white border border-border rounded-[2.5rem] shadow-2xl overflow-hidden group cursor-crosshair">
                    <canvas
                        ref={canvasRef}
                        onWheel={handleWheel}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                        className="w-full h-full block"
                    />

                    {/* Viewport Info Overlay */}
                    <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-white/90 backdrop-blur border border-border px-4 py-2 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="flex items-center gap-2 border-r border-border pr-3">
                            <span className="text-[10px] font-black text-muted-foreground uppercase">X</span>
                            <span className="font-bold tabular-nums text-sm">[{viewport.xMin.toFixed(1)}, {viewport.xMax.toFixed(1)}]</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-muted-foreground uppercase">Y</span>
                            <span className="font-bold tabular-nums text-sm">[{viewport.yMin.toFixed(1)}, {viewport.yMax.toFixed(1)}]</span>
                        </div>
                    </div>

                    {/* Tutorial Hint */}
                    <div className="absolute top-6 right-6 flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-xl animate-bounce">
                        <MousePointer2 size={14} />
                        Тяни холст и крути колесо
                    </div>
                </main>
            </div>
        </div>
    );
}
