import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const teachers = await prisma.teacher.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { reviews: true } } }
        });
        return NextResponse.json(teachers);
    } catch (error) {
        console.error('Fetch teachers error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, imageUrl, subjects } = body;

        if (!name || !subjects) {
            return NextResponse.json({ error: 'Missing required fields: name, subjects' }, { status: 400 });
        }

        const teacher = await prisma.teacher.create({
            data: {
                name,
                imageUrl: imageUrl || null,
                subjects,
            }
        });
        return NextResponse.json(teacher);
    } catch (error) {
        console.error('Create teacher error:', error);
        return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, imageUrl, subjects } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing teacher id' }, { status: 400 });
        }

        const teacher = await prisma.teacher.update({
            where: { id: parseInt(id) },
            data: {
                ...(name !== undefined && { name }),
                ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
                ...(subjects !== undefined && { subjects }),
            }
        });
        return NextResponse.json(teacher);
    } catch (error) {
        console.error('Update teacher error:', error);
        return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        await prisma.teacher.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete teacher error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
