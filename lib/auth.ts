import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_for_bss_mtkp_2024_!@#$%';
const encoder = new TextEncoder();
const SECRET = encoder.encode(JWT_SECRET);

export interface JWTPayload {
    id: number;
    username: string;
    role: 'student' | 'admin';
}

/**
 * Hash a password using PBKDF2
 */
export async function hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString('hex');
        crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, storedHash: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const [salt, hash] = storedHash.split(':');
        crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey.toString('hex') === hash);
        });
    });
}

/**
 * Sign a JWT token
 */
export async function signToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(SECRET);
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, SECRET);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Get current user from cookies
 */
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('student_token')?.value;
    if (!token) return null;
    return verifyToken(token);
}
