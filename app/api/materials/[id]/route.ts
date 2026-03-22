import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const material = await prisma.material.findUnique({
            where: { id }
        });

        if (!material) {
            return NextResponse.json({ error: 'Material not found' }, { status: 404 });
        }

        return NextResponse.json(material);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
