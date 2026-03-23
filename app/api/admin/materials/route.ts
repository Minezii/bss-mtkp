import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request) {
    try {
        const { id, type } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        if (type === 'ai') {
            await prisma.aISummary.delete({
                where: { id: parseInt(id) }
            });
        } else {
            await prisma.material.delete({
                where: { id: parseInt(id) }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete material error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const [materials, aiSummaries] = await Promise.all([
            prisma.material.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.aISummary.findMany({ orderBy: { createdAt: 'desc' } })
        ]);

        const combined = [
            ...materials.map(m => ({ ...m, type: 'manual' })),
            ...aiSummaries.map(s => ({
                ...s,
                type: 'ai',
                category: 'ИИ Конспект',
                course: s.course ? `${s.course}` : '?' // Normalize for display
            }))
        ].sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json(combined);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
