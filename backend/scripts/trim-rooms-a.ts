import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Get the 2 oldest rooms in Residencia A (from the original seed)
    const oldest = await prisma.room.findMany({
        where: { residence: 'A' },
        orderBy: { id: 'asc' },
        take: 2,
        select: { id: true, name: true },
    });

    for (const room of oldest) {
        await prisma.room.delete({ where: { id: room.id } });
        console.log(`🗑️  Deleted: ${room.name}`);
    }

    const total = await prisma.room.count({ where: { residence: 'A' } });
    console.log(`\n📊 Total rooms in Residencia A: ${total}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
