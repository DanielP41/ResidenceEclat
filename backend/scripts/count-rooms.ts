import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const all = await prisma.room.groupBy({
        by: ['residence'],
        _count: { id: true },
        orderBy: { residence: 'asc' },
    });

    console.log('\n📊 Habitaciones por residencia en la DB:');
    for (const r of all) {
        console.log(`  "${r.residence}" → ${r._count.id} habitaciones`);
    }

    const total = await prisma.room.count();
    console.log(`\n  TOTAL general: ${total}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
