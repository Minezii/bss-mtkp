'use server';

import prisma from '@/lib/prisma';

export async function submitAction(formData: FormData) {
    try {
        const type = formData.get('type') as string;
        const title = formData.get('title') as string;
        const author = formData.get('name') as string;
        const content = formData.get('desc') as string;
        const group = formData.get('group') as string;

        // Extract file only if it was actually selected and is under the size limit
        const file = formData.get('file') as File | null;
        const fileUrl = (file && file.size > 0 && file.name !== 'undefined') ? `[attached: ${file.name}]` : null;

        if (!type || !title || !content) {
            return { error: 'Missing required fields' };
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
                checkId: crypto.randomUUID(),
            },
        });

        return { success: true, checkId: submission.checkId };
    } catch (error: any) {
        console.error('Submission action error:', error);
        return { error: error.message || 'Internal Server Error' };
    }
}
