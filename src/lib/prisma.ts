import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // Silent fallback for build phase
    const url = process.env.DATABASE_URL || "file:./dev.db";
    return new PrismaClient({
        datasourceUrl: url
    });
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
