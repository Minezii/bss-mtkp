import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, signToken, hashPassword } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { username: rawUsername, password } = await request.json();
        const username = rawUsername?.toLowerCase().trim();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const { valid, needsUpgrade } = await comparePassword(password, user.passwordHash);

        if (!valid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Seamless migration: re-hash and update if using legacy iteration count
        if (needsUpgrade) {
            console.log(`Upgrading password hash for user: ${user.username}`);
            const newHash = await hashPassword(password);
            await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash }
            });
        }


        const token = await signToken({
            id: user.id,
            username: user.username,
            role: 'student'
        });

        const cookieStore = await cookies();
        cookieStore.set('student_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production' || request.url.startsWith('https'),
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/'
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
