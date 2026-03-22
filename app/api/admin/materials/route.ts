import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        }

        await prisma.material.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete material error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const materials = await prisma.material.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(materials);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
