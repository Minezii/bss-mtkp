import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const { id, action } = await request.json();

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
        }

        const submission = await prisma.submission.findUnique({ where: { id } });

        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        if (action === 'approve') {
            // Logic for moving data to the target table
            if (submission.type === 'material') {
                await prisma.material.create({
                    data: {
                        title: submission.title,
                        course: 1, // Default or parsed from title/content
                        category: 'Разное',
                        subject: submission.content || 'Неизвестно',
                        fileUrl: submission.fileUrl,
                    },
                });
            } else if (submission.type === 'teacher') {
                await prisma.teacher.create({
                    data: {
                        name: submission.title,
                        department: 'Общее',
                        subjects: submission.content || '',
                    },
                });
            } else if (submission.type === 'tool') {
                await prisma.tool.create({
                    data: {
                        name: submission.title,
                        desc: submission.content || '',
                        category: 'Разное',
                        url: submission.fileUrl,
                    },
                });
            }

            await prisma.submission.update({
                where: { id },
                data: { status: 'approved' },
            });
        } else if (action === 'reject') {
            await prisma.submission.update({
                where: { id },
                data: { status: 'rejected' },
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Moderation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
