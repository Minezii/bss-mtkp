import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // Explicitly fallback to relative path if DATABASE_URL is missing
    const url = process.env.DATABASE_URL || "file:./dev.db";
    return new PrismaClient({
        datasourceUrl: url
    } as any);
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
