import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const submissions = await prisma.submission.findMany({
            where: {
                status: { in: ['pending', 'draft'] }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(submissions);
    } catch (error) {
        console.error('Fetch submissions error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
