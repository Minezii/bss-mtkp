'use server';

import prisma from '@/lib/prisma';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
    pdf: ['pdf'],
    doc: ['doc', 'docx'],
    image: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
    text: ['txt', 'rtf', 'odt'],
    archive: ['zip', 'rar', '7z'],
    presentation: ['ppt', 'pptx'],
    spreadsheet: ['xls', 'xlsx', 'csv'],
};

function getAllAllowedMimeTypes(): string[] {
    const map: Record<string, string> = {
        pdf: 'application/pdf',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        txt: 'text/plain',
        rtf: 'text/rtf',
        odt: 'application/vnd.oasis.opendocument.text',
        zip: 'application/zip',
        rar: 'application/vnd.rar',
        '7z': 'application/x-7z-compressed',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv',
    };
    return Object.values(map);
}

function getAllAllowedExtensions(): string[] {
    return Object.values(ALLOWED_EXTENSIONS).flat();
}

export async function submitAction(formData: FormData) {
    try {
        const type = formData.get('type') as string;
        const title = formData.get('title') as string;
        const author = formData.get('name') as string;
        const content = formData.get('desc') as string;
        const group = formData.get('group') as string;

        const file = formData.get('file') as File | null;
        const link = formData.get('link') as string;

        if (!type || !title || !content) {
            return { error: 'Missing required fields' };
        }

        let fileUrl: string | null = null;

        if (link && type === 'tool') {
            fileUrl = link;
        } else if (file && file.size > 0 && file.name && file.name !== 'undefined') {
            if (file.size > MAX_FILE_SIZE) {
                return { error: 'Файл слишком большой. Максимум 20 МБ.' };
            }

            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            const allowedExts = getAllAllowedExtensions();
            if (!allowedExts.includes(ext)) {
                return { error: `Неподдерживаемый формат файла (.${ext}). Допустимы: ${allowedExts.slice(0, 8).join(', ')}...` };
            }

            const randomId = nanoid(8);
            const filename = `submission-${Date.now()}-${randomId}.${ext}`;

            const blob = await put(filename, file, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN,
            });

            fileUrl = blob.url;
        }

        const { getCurrentUser } = await import('@/lib/auth');
        const user = await getCurrentUser();

        const submission = await prisma.submission.create({
            data: {
                type,
                title,
                author: author || 'Аноним',
                group: group || null,
                content: content,
                fileUrl: fileUrl,
                status: 'pending',
                checkId: crypto.randomUUID(),
                userId: user?.id || null,
            },
        });

        return { success: true, checkId: submission.checkId };
    } catch (error: any) {
        console.error('Submission action error:', error);
        return { error: error.message || 'Internal Server Error' };
    }
}
