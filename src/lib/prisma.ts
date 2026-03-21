import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // During build, if DATABASE_URL is somehow missing or we are in a static worker phase,
    // we try to prevent a hard crash if possible. 
    try {
        return new PrismaClient();
    } catch (e) {
        if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
            console.warn('PrismaClient initialization failed during build. This is expected if DATABASE_URL is not set for static collection.');
            return {} as PrismaClient; // Mock for build phase
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
