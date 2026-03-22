import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_bss_mtkp_2024_!@#$%';
const encoder = new TextEncoder();
const SECRET = encoder.encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Защита всех путей /admin, кроме страницы логина
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            await jwtVerify(token, SECRET);
            return NextResponse.next();
        } catch (err) {
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            response.cookies.delete('admin_token');
            return response;
        }
    }

    // Защита экшнов, требующих авторизации студента (например, POST на отзывы)
    if (pathname.includes('/api/teachers/') && pathname.endsWith('/reviews') && request.method === 'POST') {
        const token = request.cookies.get('student_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            await jwtVerify(token, SECRET);
            return NextResponse.next();
        } catch (err) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/teachers/:id/reviews'],
};
