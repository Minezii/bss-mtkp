import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prismaClientSingleton = () => {
    let finalUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

    // Vercel /tmp writable workaround
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        const tmpPath = path.join('/tmp', 'dev.db');
        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

        try {
            if (fs.existsSync(dbPath) && !fs.existsSync(tmpPath)) {
                fs.copyFileSync(dbPath, tmpPath);
                console.log('Database copied to /tmp');
            }
            finalUrl = `file:${tmpPath}`;
        } catch (error) {
            console.error('Failed to copy database to /tmp:', error);
        }
    }

    // Handle Windows absolute paths if any
    if (finalUrl.includes('C:') || finalUrl.includes('\\')) {
        finalUrl = "file:./prisma/dev.db";
    }

    process.env.DATABASE_URL = finalUrl;
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
