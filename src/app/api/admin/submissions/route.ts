import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const submissions = await prisma.submission.findMany({
            where: { status: 'pending' },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(submissions);
    } catch (error) {
        console.error('Fetch submissions error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
