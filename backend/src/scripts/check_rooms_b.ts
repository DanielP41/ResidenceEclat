import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const residenceId = 'B';
    const originalRooms = await prisma.room.findMany({
        where: { residence: residenceId, isDeleted: false },
        orderBy: { name: 'asc' }
    });

    console.log(`Current rooms for Residence ${residenceId}: ${originalRooms.length}`);
    originalRooms.forEach(r => console.log(`- ${r.name} (ID: ${r.id}, Capacity: ${r.capacity})`));

    // If more than 6, we might need to delete some. If less, add some.
    // The user said "there are ONLY 6", implying a correction.
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
