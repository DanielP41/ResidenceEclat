import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const residenceId = 'C';

    // 1. Mark current rooms as deleted for Residence C
    await prisma.room.updateMany({
        where: { residence: residenceId },
        data: { isDeleted: true }
    });

    const commonData = {
        description: 'Habitación clásica con todas las comodidades esenciales, baño privado y ambiente climatizado.',
        price: 40000,
        amenities: ['WiFi', 'Baño privado', 'Aire acondicionado', 'Sommier', 'Escritorio'],
        images: ["https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070"],
        residence: residenceId,
        isActive: true,
        isDeleted: false
    };

    // User objective from earlier was to have exactly 2 rooms for Residence C
    // Now they also need to be "Classic"
    for (let i = 1; i <= 2; i++) {
        await prisma.room.create({
            data: {
                ...commonData,
                name: `Habitación Clásica`,
                capacity: 1 // Individuales
            }
        });
    }

    console.log(`✅ Successfully synced Residence ${residenceId} to 2 "Habitación Clásica".`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
