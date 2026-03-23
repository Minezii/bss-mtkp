import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username, avatarUrl, bannerUrl } = await request.json();

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                username: username || undefined,
                avatarUrl: avatarUrl || undefined,
                bannerUrl: bannerUrl || undefined,
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                avatarUrl: updatedUser.avatarUrl,
                bannerUrl: updatedUser.bannerUrl
            }
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 });
    }
}
