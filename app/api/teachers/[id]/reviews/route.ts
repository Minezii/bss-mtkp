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
                    select: { username: true, group: true, avatarUrl: true }
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

        const {
            content,
            lecturesRating,
            examsRating,
            clarityRating,
            fairnessRating,
            isRecommended
        } = await request.json();

        // Validate individual ratings (0-5 range now allowed for inverted metrics)
        const ratings = [lecturesRating, examsRating, clarityRating, fairnessRating];
        if (ratings.some(r => r < 0 || r > 5)) {
            return NextResponse.json({ error: 'All ratings must be between 0 and 5' }, { status: 400 });
        }

        // Calculate overall rating for this review (average of 4) 
        // We invert strictness metrics (1 becomes 5, 5 becomes 1) so that "least strict" is weighted positively.
        const avgRating = Math.round(((6 - lecturesRating) + (6 - examsRating) + clarityRating + fairnessRating) / 4);

        const userId = user.id;

        // Upsert review
        await prisma.review.upsert({
            where: {
                userId_teacherId: { userId, teacherId }
            },
            update: {
                content,
                rating: avgRating,
                lecturesRating,
                examsRating,
                clarityRating,
                fairnessRating,
                isRecommended
            },
            create: {
                userId,
                teacherId,
                content,
                rating: avgRating,
                lecturesRating,
                examsRating,
                clarityRating,
                fairnessRating,
                isRecommended
            }
        });

        // Recalculate teacher ratings
        const stats = await prisma.review.aggregate({
            where: { teacherId },
            _avg: {
                rating: true,
                lecturesRating: true,
                examsRating: true,
                clarityRating: true,
                fairnessRating: true
            },
            _count: { _all: true }
        });

        await prisma.teacher.update({
            where: { id: teacherId },
            data: {
                overallRating: stats._avg?.rating || 0,
                lecturesRating: stats._avg?.lecturesRating || 0,
                examsRating: stats._avg?.examsRating || 0,
                clarityRating: stats._avg?.clarityRating || 0,
                fairnessRating: stats._avg?.fairnessRating || 0,
                reviewsCount: stats._count?._all || 0
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Review error:', error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }
}
