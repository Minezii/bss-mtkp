import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');

    try {
        const materials = await prisma.material.findMany({
            where: course && course !== 'all' ? { course: parseInt(course) } : {},
            orderBy: { createdAt: 'desc' },
        });

        console.log(`[API] Found ${materials.length} materials`);
        return NextResponse.json(materials);
    } catch (error: any) {
        console.error('Fetch materials error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
