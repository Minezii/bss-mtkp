const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.aISummary.count();
    console.log('AISummary count:', count);

    if (count > 0) {
        const first = await prisma.aISummary.findFirst();
        console.log('First record:', JSON.stringify(first, null, 2));
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
