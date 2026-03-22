const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const tool = await prisma.tool.findFirst({
        where: {
            name: {
                contains: 'SQL тренажер',
                mode: 'insensitive'
            }
        }
    })

    if (tool) {
        console.log(`Found tool: ${tool.name} (ID: ${tool.id}). Deleting...`)
        await prisma.tool.delete({
            where: { id: tool.id }
        })
        console.log('Deleted successfully.')
    } else {
        console.log('Tool not found.')
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
