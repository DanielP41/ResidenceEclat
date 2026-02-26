import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const TARGET = 11;

    const rooms = await prisma.room.findMany({
        where: { residence: 'A' },
        orderBy: { id: 'asc' },
        select: { id: true, name: true },
    });

    const current = rooms.length;
    console.log(`📊 Habitaciones actuales en Residencia A: ${current}`);

    if (current <= TARGET) {
        console.log('Ya tiene el número correcto o menos. No se elimina nada.');
        return;
    }

    const toDelete = rooms.slice(TARGET); // keep first 11, delete the rest
    for (const room of toDelete) {
        await prisma.room.delete({ where: { id: room.id } });
        console.log(`🗑️  Eliminada: ${room.name} (id: ${room.id})`);
    }

    const total = await prisma.room.count({ where: { residence: 'A' } });
    console.log(`\n✅ Total final en Residencia A: ${total}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
