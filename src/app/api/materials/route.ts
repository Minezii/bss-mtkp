import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');

    try {
        const materials = await prisma.material.findMany({
            where: course && course !== 'all' ? { course: parseInt(course) } : {},
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(materials);
    } catch (error) {
        console.error('Fetch materials error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
