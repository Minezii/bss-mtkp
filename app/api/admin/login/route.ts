import { NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { crypto } from 'next/dist/compiled/@edge-runtime/primitives';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: JWT_SECRET environment variable is missing for Admin Login!');
}
const SECRET = new TextEncoder().encode(JWT_SECRET || 'temp_dev_secret_only_for_local_development');


export async function POST(request: Request) {
    try {
        const { login, password } = await request.json();

        // Простая проверка логина
        if (login !== 'admin') {
            return NextResponse.json({ error: 'Неверный логин' }, { status: 401 });
        }

        // Хешируем введенный пароль (SHA-256)
        const encoder = new TextEncoder();
        const data = encoder.encode(password);

        // Use globalThis.crypto for cross-environment compatibility
        const hashBuffer = await (globalThis.crypto || crypto).subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (!process.env.ADMIN_PASSWORD_HASH) {
            console.error('CRITICAL: ADMIN_PASSWORD_HASH environment variable is missing!');
            return NextResponse.json({ error: 'Сервер не настроен (отсутствует HASH)' }, { status: 501 });
        }

        if (hashedPassword !== process.env.ADMIN_PASSWORD_HASH) {
            return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
        }

        // Создаем JWT токен (валиден 24 часа)
        const token = await new SignJWT({ role: 'admin' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(SECRET);

        const response = NextResponse.json({ success: true });

        // Устанавливаем куку
        response.cookies.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 1 день
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
    }
}
