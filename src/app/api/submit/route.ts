import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, title, author, content, fileUrl } = body;

        if (!type || !title || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const submission = await prisma.submission.create({
            data: {
                type,
                title,
                author: author || 'Аноним',
                content,
                fileUrl: fileUrl || null,
                status: 'pending',
            },
        });

        return NextResponse.json({ success: true, submission });
    } catch (error) {
        console.error('Submission error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
