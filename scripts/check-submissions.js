const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const submissions = await prisma.submission.findMany({
        take: 5,
        orderBy: { id: 'desc' }
    });
    console.log(JSON.stringify(submissions, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
