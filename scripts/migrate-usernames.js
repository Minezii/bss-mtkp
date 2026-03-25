const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
    console.log('Starting username migration...');
    const users = await prisma.user.findMany();

    for (const user of users) {
        console.log(`Migrating user: ${user.username}`);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                displayName: user.username, // Save original casing
                username: user.username.toLowerCase().trim() // Normalize login
            }
        });
    }

    console.log('Migration completed successfully.');
}

migrate()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
