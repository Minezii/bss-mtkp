import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const teachers = await prisma.teacher.findMany({
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(teachers);
    } catch (error) {
        console.error('Fetch teachers error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
