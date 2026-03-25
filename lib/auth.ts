import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('CRITICAL: JWT_SECRET environment variable is missing!');
}

const encoder = new TextEncoder();
const SECRET = encoder.encode(JWT_SECRET || 'temp_dev_secret_only_for_local_development');

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
        // Increased iterations to 600,000 (OWASP recommended)
        crypto.pbkdf2(password, salt, 600000, 64, 'sha512', (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString('hex')}`);
        });
    });
}

/**
 * Compare a password with a hash.
 * Returns migration status to allow automatic upgrade to stronger hashing.
 */
export async function comparePassword(password: string, storedHash: string): Promise<{ valid: boolean; needsUpgrade: boolean }> {
    const [salt, hash] = storedHash.split(':');

    // 1. Try with new iteration count (600,000)
    const isValidNew = await new Promise<boolean>((resolve) => {
        crypto.pbkdf2(password, salt, 600000, 64, 'sha512', (err, derivedKey) => {
            if (err) resolve(false);
            resolve(derivedKey.toString('hex') === hash);
        });
    });

    if (isValidNew) {
        return { valid: true, needsUpgrade: false };
    }

    // 2. Fallback to legacy iteration count (1,000)
    const isValidLegacy = await new Promise<boolean>((resolve) => {
        crypto.pbkdf2(password, salt, 1000, 64, 'sha512', (err, derivedKey) => {
            if (err) resolve(false);
            resolve(derivedKey.toString('hex') === hash);
        });
    });

    if (isValidLegacy) {
        return { valid: true, needsUpgrade: true };
    }

    return { valid: false, needsUpgrade: false };
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
