import { NextResponse } from 'next/server';

export async function GET() {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(subjects);
    } catch (error) {
        console.error('Fetch subjects error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const { name } = await request.json();
        if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

        const subject = await prisma.subject.create({
            data: { name }
        });
        return NextResponse.json(subject);
    } catch (error) {
        console.error('Create subject error:', error);
        return NextResponse.json({ error: 'Subject already exists or error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const { id } = await request.json();
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        await prisma.subject.delete({
            where: { id: parseInt(id) }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete subject error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
