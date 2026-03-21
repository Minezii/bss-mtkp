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
            console.log('No token found, redirecting to login');
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            await jwtVerify(token, SECRET);
            return NextResponse.next();
        } catch (err) {
            console.error('JWT verification failed:', err);
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            response.cookies.delete('admin_token');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
