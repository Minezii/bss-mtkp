import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: JWT_SECRET environment variable is missing!');
}

const encoder = new TextEncoder();
const SECRET = encoder.encode(JWT_SECRET || 'temp_dev_secret_only_for_local_development');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Защита всех путей /admin, кроме страницы логина
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

    // 2. Защита административных API эндпоинтов и сида
    if (pathname.startsWith('/api/admin/') || pathname === '/api/seed') {
        if (pathname === '/api/admin/login') return NextResponse.next();

        const token = request.cookies.get('admin_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
        }

        try {
            const { payload } = await jwtVerify(token, SECRET);
            if (payload.role !== 'admin') {
                return NextResponse.json({ error: 'Forbidden: Admin role required' }, { status: 403 });
            }
            return NextResponse.next();
        } catch (err) {
            return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
        }
    }

    // 3. Защита экшнов, требующих авторизации студента
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
    matcher: ['/admin/:path*', '/api/admin/:path*', '/api/teachers/:id/reviews', '/api/seed'],
};

