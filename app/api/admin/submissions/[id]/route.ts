import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const prisma = (await import('@/lib/prisma')).default;

    try {
        const submission = await prisma.submission.findUnique({
            where: { id: parseInt(id) }
        });

        if (!submission) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(submission);
    } catch (error) {
        console.error('Fetch submission error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
