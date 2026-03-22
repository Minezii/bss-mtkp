import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    const { getCurrentUser } = await import('@/lib/auth');
    try {
        const user = await getCurrentUser();
        const formData = await request.formData();
        const type = formData.get('type') as string;
        const title = formData.get('title') as string;
        const author = formData.get('name') as string;
        const content = formData.get('desc') as string;
        const group = formData.get('group') as string;

        // We'll store the filename in fileUrl for now since we don't have actual storage
        const file = formData.get('file') as File | null;
        const fileUrl = file ? `[attached: ${file.name}]` : null;

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
                userId: user?.id || null,
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
