import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        const username = params.username.toLowerCase();
        const currentUser = await getCurrentUser();

        // 1. Fetch user by username
        const targetUser = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,

                bannerUrl: true,
                quote: true,
                group: true,
                createdAt: true,
                _count: {
                    select: {
                        likes: true,
                        views: true,
                        reviews: true
                    }
                }
            }
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Track unique view if logged in
        if (currentUser && currentUser.id !== targetUser.id) {
            try {
                await prisma.profileView.upsert({
                    where: {
                        viewerId_profileId: {
                            viewerId: currentUser.id,
                            profileId: targetUser.id
                        }
                    },
                    update: {}, // Don't update if already viewed
                    create: {
                        viewerId: currentUser.id,
                        profileId: targetUser.id
                    }
                });
            } catch (e) {
                // Ignore view increment errors (e.g. concurrent requests)
            }
        }

        // 3. Check if current user liked this profile
        let isLiked = false;
        if (currentUser) {
            const like = await prisma.profileLike.findUnique({
                where: {
                    userId_profileId: {
                        userId: currentUser.id,
                        profileId: targetUser.id
                    }
                }
            });
            isLiked = !!like;
        }

        // 4. Fetch user's reviews
        const reviews = await prisma.review.findMany({
            where: { userId: targetUser.id },
            include: {
                teacher: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        return NextResponse.json({
            user: {
                ...targetUser,
                isLiked,
                reviews
            }
        });
    } catch (error) {
        console.error('Fetch public profile error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}
