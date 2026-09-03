import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_EXTENSIONS: string[] = [
    'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'gif', 'webp',
    'txt', 'rtf', 'odt', 'zip', 'rar', '7z', 'ppt', 'pptx',
    'xls', 'xlsx', 'csv',
];

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

        const file = formData.get('file') as File | null;

        if (!type || !title || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let fileUrl: string | null = null;

        if (file && file.size > 0 && file.name && file.name !== 'undefined') {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json({ error: 'File too large. Max 20 MB.' }, { status: 400 });
            }

            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                return NextResponse.json({ error: `Unsupported file type (.${ext})` }, { status: 400 });
            }

            const filename = `submission-${Date.now()}-${nanoid(8)}.${ext}`;

            const blob = await put(filename, file, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });

            fileUrl = blob.url;
        }

        const submission = await prisma.submission.create({
            data: {
                type,
                title,
                author: author || 'Аноним',
                group: group || null,
                content: content,
                fileUrl: fileUrl,
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
