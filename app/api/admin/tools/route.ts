import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        await prisma.tool.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete tool error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const tools = await prisma.tool.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(tools);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
