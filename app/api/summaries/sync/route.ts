import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const body = await req.json();
        const { summaries } = body;

        if (!summaries || !Array.isArray(summaries)) {
            return NextResponse.json({ error: 'Invalid data format. Expected an array of summaries.' }, { status: 400 });
        }

        const results = await Promise.all(
            summaries.map(async (s: any) => {
                return prisma.aISummary.upsert({
                    where: { uuid: s.uuid },
                    update: {
                        title: s.title,
                        subject: s.subject,
                        course: s.course
                    },
                    create: {
                        uuid: s.uuid,
                        title: s.title,
                        subject: s.subject,
                        course: s.course
                    }
                });
            })
        );

        return NextResponse.json({
            message: `Successfully synced ${results.length} summaries.`,
            count: results.length
        });

    } catch (err: any) {
        console.error('Sync error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function GET() {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const summaries = await prisma.aISummary.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(summaries);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
