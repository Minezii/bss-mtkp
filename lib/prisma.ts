import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // Basic initialization. SQLite on Vercel is problematic, 
    // but at least we shouldn't crash on absolute paths.
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
