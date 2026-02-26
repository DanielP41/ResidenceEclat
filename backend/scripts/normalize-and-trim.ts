import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Step 1: normalize "Residencia A" → "A"
    const normalized = await prisma.room.updateMany({
        where: { residence: 'Residencia A' },
        data: { residence: 'A' },
    });
    console.log(`✅ Normalizadas: ${normalized.count} habitaciones de "Residencia A" → "A"`);

    // Step 2: check total for A
    const allA = await prisma.room.findMany({
        where: { residence: 'A' },
        orderBy: { id: 'asc' },
        select: { id: true, name: true },
    });
    console.log(`📊 Total en Residencia A ahora: ${allA.length}`);

    // Step 3: delete extras to reach 11
    const TARGET = 11;
    if (allA.length > TARGET) {
        const toDelete = allA.slice(TARGET);
        for (const r of toDelete) {
            await prisma.room.delete({ where: { id: r.id } });
            console.log(`🗑️  Eliminada: ${r.name} (id: ${r.id})`);
        }
    }

    const finalCount = await prisma.room.count({ where: { residence: 'A' } });
    console.log(`\n✅ Total final en Residencia A: ${finalCount}`);

    const grandTotal = await prisma.room.count();
    console.log(`📊 Total general en DB: ${grandTotal}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
