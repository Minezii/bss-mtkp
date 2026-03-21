import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const teachers = await prisma.teacher.findMany({
            orderBy: { name: 'asc' },
        });

        return NextResponse.json(teachers);
    } catch (error) {
        console.error('Fetch teachers error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
