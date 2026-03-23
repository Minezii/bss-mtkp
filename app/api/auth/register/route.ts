import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { username: rawUsername, password } = await request.json();
        const username = rawUsername?.toLowerCase().trim();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                username,
                passwordHash
            }
        });

        return NextResponse.json({
            success: true,
            user: { id: user.id, username: user.username }
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
