import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const { id, action, updatedData } = await request.json();

        if (!id || !action) {
            return NextResponse.json({ error: 'Missing id or action' }, { status: 400 });
        }

        const submission = await prisma.submission.findUnique({ where: { id } });

        if (!submission) {
            return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        // Apply edits if provided
        const finalData = {
            title: updatedData?.title || submission.title,
            content: updatedData?.content || submission.content,
            subject: updatedData?.subject || submission.subject,
            group: updatedData?.group || submission.group,
            type: updatedData?.type || submission.type,
            fileUrl: updatedData?.fileUrl || submission.fileUrl,
            imageUrl: updatedData?.imageUrl || submission.imageUrl,
            category: updatedData?.category || 'Разное',
            course: updatedData?.course || 1,
        };

        if (action === 'save_draft') {
            await prisma.submission.update({
                where: { id },
                data: {
                    title: finalData.title,
                    content: finalData.content,
                    subject: finalData.subject,
                    group: finalData.group,
                    imageUrl: finalData.imageUrl,
                    status: 'draft'
                }
            });
            return NextResponse.json({ success: true, message: 'Saved as draft' });
        }

        if (action === 'approve') {
            if (submission.type === 'material') {
                // Auto-calculate course if not explicitly provided
                let course = finalData.course;
                if (!updatedData?.course && finalData.group) {
                    const match = finalData.group.match(/\d/);
                    if (match) {
                        const semester = parseInt(match[0]);
                        course = Math.ceil(semester / 2);
                    }
                }

                await prisma.material.create({
                    data: {
                        title: finalData.title,
                        group: finalData.group,
                        course: course,
                        category: finalData.category,
                        subject: finalData.subject || 'Неизвестно',
                        fileUrl: finalData.fileUrl,
                        content: finalData.content, // Copy markdown content
                    },
                });
            } else if (submission.type === 'teacher') {
                await prisma.teacher.create({
                    data: {
                        name: finalData.title,
                        imageUrl: finalData.imageUrl,
                        subjects: finalData.content || '',
                    },
                });
            }
            else if (submission.type === 'tool') {
                await prisma.tool.create({
                    data: {
                        name: finalData.title,
                        desc: finalData.content || '',
                        category: finalData.category,
                        url: finalData.fileUrl,
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
