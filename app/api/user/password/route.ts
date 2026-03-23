import { NextResponse } from 'next/server';
import { getCurrentUser, comparePassword, hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
    const prisma = (await import('@/lib/prisma')).default;
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { currentPassword, newPassword, confirmPassword } = await request.json();

        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
            return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        const newPasswordHash = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: currentUser.id },
            data: { passwordHash: newPasswordHash },
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 });
    }
}
