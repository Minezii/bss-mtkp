const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Environment:', process.env.NODE_ENV);
    const keys = Object.keys(prisma).filter(k => !k.startsWith('_'));
    console.log('Prisma keys:', keys);

    // Check specific keys
    console.log('aISummary exists:', !!prisma.aISummary);
    console.log('aiSummary exists:', !!prisma.aiSummary);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
