import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ checkId: string }> }
) {
    const prisma = (await import('@/lib/prisma')).default;
    const { checkId } = await params;

    try {
        const submission = await prisma.submission.findUnique({
            where: { checkId },
            select: {
                title: true,
                type: true,
                status: true,
                createdAt: true,
            }
        });

        if (!submission) {
            return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
        }

        return NextResponse.json(submission);
    } catch (error: any) {
        console.error('Check status error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
