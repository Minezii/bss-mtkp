import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const teacherId = parseInt(params.id);
        const reviews = await prisma.review.findMany({
            where: { teacherId },
            include: {
                user: {
                    select: { username: true, group: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const teacherId = parseInt(params.id);
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content, rating, isRecommended } = await request.json();

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        // Upsert review
        await prisma.review.upsert({
            where: {
                userId_teacherId: {
                    userId: user.id,
                    teacherId: teacherId
                }
            },
            update: {
                content,
                rating,
                isRecommended
            },
            create: {
                userId: user.id,
                teacherId: teacherId,
                content,
                rating,
                isRecommended
            }
        });

        // Recalculate teacher ratings
        const stats = await prisma.review.aggregate({
            where: { teacherId },
            _avg: {
                rating: true
            },
            _count: {
                _all: true
            }
        });

        await prisma.teacher.update({
            where: { id: teacherId },
            data: {
                overallRating: stats._avg.rating || 0,
                reviewsCount: stats._count._all || 0
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Review error:', error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
