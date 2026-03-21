import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    const dbUrl = process.env.DATABASE_URL;
    const isWindowsPath = dbUrl && (dbUrl.includes('C:') || dbUrl.includes('\\'));
    const finalUrl = (dbUrl && !isWindowsPath) ? dbUrl : "file:./dev.db";

    return new PrismaClient({
        datasourceUrl: finalUrl
    } as any);
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
