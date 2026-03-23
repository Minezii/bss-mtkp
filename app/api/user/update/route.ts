import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username, avatarUrl, bannerUrl, quote } = await request.json();

        console.log('Updating user:', currentUser.id, { username, quote });

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.id },
            data: {
                username: username || undefined,
                avatarUrl: avatarUrl === null ? null : (avatarUrl || undefined),
                bannerUrl: bannerUrl === null ? null : (bannerUrl || undefined),
                quote: quote === null ? null : (quote || undefined),
            },
        });

        return NextResponse.json({
            success: true,
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                avatarUrl: updatedUser.avatarUrl,
                bannerUrl: updatedUser.bannerUrl,
                quote: updatedUser.quote
            }
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 });
    }
}
