import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const body = await request.json();
        const { type, title, author, content, fileUrl, group } = body;

        if (!type || !title || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const submission = await prisma.submission.create({
            data: {
                type,
                title,
                author: author || 'Аноним',
                group: group || null,
                content: content,
                fileUrl: fileUrl || null,
                status: 'pending',
            },
        });

        return NextResponse.json({ success: true, checkId: submission.checkId });
    } catch (error: any) {
        console.error('Submission error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
