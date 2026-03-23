const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching users...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        const lowercased = user.username.toLowerCase();
        if (user.username !== lowercased) {
            console.log(`Migrating ${user.username} to ${lowercased}...`);
            await prisma.user.update({
                where: { id: user.id },
                data: { username: lowercased }
            });
        }
    }
    console.log('Migration complete!');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
