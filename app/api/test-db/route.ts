import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prisma = (await import('@/lib/prisma')).default;

        // Try a simple query
        const count = await prisma.submission.count();

        return NextResponse.json({
            success: true,
            message: 'Database connection successful',
            count,
            env: {
                has_db_url: !!process.env.DATABASE_URL,
                node_env: process.env.NODE_ENV
            }
        });
    } catch (error: any) {
        console.error('Diagnostic error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack,
            code: error.code
        }, { status: 500 });
    }
}
