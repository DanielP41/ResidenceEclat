import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const residenceId = 'B';

    // 1. Mark current rooms as deleted
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

    // Create 6 "Habitación Clásica"
    // Assuming 4 individual and 2 double based on previous setup, 
    // but the user says "all are classic", usually implies same standard.
    for (let i = 1; i <= 6; i++) {
        await prisma.room.create({
            data: {
                ...commonData,
                name: `Habitación Clásica`,
                // We'll alternate capacity or keep all 1? 
                // Previous image showed some individual and some double.
                // Let's make 4 individual and 2 double to match the previous structure but with the new name.
                capacity: i <= 4 ? 1 : 2
            }
        });
    }

    console.log(`✅ Successfully synced Residence ${residenceId} to 6 "Habitación Clásica".`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
