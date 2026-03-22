import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user || !(await comparePassword(password, user.passwordHash))) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await signToken({
            id: user.id,
            username: user.username,
            role: 'student'
        });

        const cookieStore = await cookies();
        cookieStore.set('student_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 // 30 days
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, username: user.username }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
