import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
    const prisma = (await import('@/lib/prisma')).default;
    const userPayload = await getCurrentUser();

    if (!userPayload) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userPayload.id },
        select: {
            id: true,
            username: true,
            group: true,
            avatarUrl: true,
            bannerUrl: true,
            quote: true,
        }
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
}
