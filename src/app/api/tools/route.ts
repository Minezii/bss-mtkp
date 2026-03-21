import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const tools = await prisma.tool.findMany({
            orderBy: { category: 'asc' },
        });

        return NextResponse.json(tools);
    } catch (error) {
        console.error('Fetch tools error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
