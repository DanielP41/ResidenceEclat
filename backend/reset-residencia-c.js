const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Deleting all Residencia C rooms...');
    const deleted = await prisma.room.deleteMany({
        where: { residence: 'C' },
    });
    console.log(`✅ Deleted ${deleted.count} rooms from Residencia C`);

    console.log('🏗️  Creating 2 rooms for Residencia C...');

    await prisma.room.create({
        data: {
            name: 'Habitación Compartida Premium',
            description: 'Habitación compartida de alto nivel. Camas tipo cápsula para mayor privacidad, lockers inteligentes y áreas comunes de diseño.',
            price: 20000,
            capacity: 1,
            residence: 'C',
            amenities: ['WiFi', 'Locker Inteligente', 'Cama Cápsula', 'Áreas Comunes', 'Cocina Compartida'],
            images: [
                'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069',
                'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070'
            ],
        },
    });
    console.log('✅ Created: Habitación Compartida Premium');

    await prisma.room.create({
        data: {
            name: 'Loft con Terraza',
            description: 'Loft exclusivo en el último piso con terraza privada y vistas panorámicas de la ciudad.',
            price: 90000,
            capacity: 2,
            residence: 'C',
            amenities: ['WiFi', 'Terraza Privada', 'Jacuzzi', 'Cocina Completa', 'Vista Panorámica'],
            images: [
                'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070',
                'https://images.unsplash.com/photo-1512918760513-95f192972701?q=80&w=2070'
            ],
        },
    });
    console.log('✅ Created: Loft con Terraza');

    console.log('\n🎉 Done! Residencia C now has 2 rooms.');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
