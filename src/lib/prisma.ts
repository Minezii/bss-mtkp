import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // During build, if DATABASE_URL is missing, we catch the error but return an empty object if in production (build worker)
    try {
        return new PrismaClient();
    } catch (e) {
        if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
            console.warn('PrismaClient error during build phase - likely missing DATABASE_URL');
            return {} as PrismaClient;
        }
        throw e;
    }
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
