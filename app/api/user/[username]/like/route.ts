import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const targetUser = await prisma.user.findUnique({
            where: { username: params.username },
            select: { id: true }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (currentUser.id === targetUser.id) {
            return NextResponse.json({ error: 'You cannot like your own profile' }, { status: 400 });
        }

        // Check if already liked
        const existingLike = await prisma.profileLike.findUnique({
            where: {
                userId_profileId: {
                    userId: currentUser.id,
                    profileId: targetUser.id
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.profileLike.delete({
                where: { id: existingLike.id }
            });
            return NextResponse.json({ success: true, liked: false });
        } else {
            // Like
            await prisma.profileLike.create({
                data: {
                    userId: currentUser.id,
                    profileId: targetUser.id
                }
            });
            return NextResponse.json({ success: true, liked: true });
        }
    } catch (error) {
        console.error('Toggle like error:', error);
        return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
    }
}
