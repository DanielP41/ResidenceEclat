import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const newRooms = [
        {
            name: 'Habitación Individual Comfort',
            description: 'Habitación individual con baño privado, cama queen y escritorio de trabajo. Ideal para estadías largas.',
            price: 36000,
            capacity: 1,
            residence: 'A',
            amenities: ['WiFi', 'Baño privado', 'Aire acondicionado', 'Escritorio', 'TV LED 32"'],
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
        },
        {
            name: 'Habitación Individual Premium',
            description: 'Habitación individual de alta gama con cama queen, escritorio amplio y vista al jardín.',
            price: 40000,
            capacity: 1,
            residence: 'A',
            amenities: ['WiFi Alta Velocidad', 'Baño privado', 'Aire acondicionado', 'TV 40"', 'Vista jardín'],
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
        },
        {
            name: 'Habitación Doble Estándar',
            description: 'Habitación doble con dos camas individuales, baño compartido y amplio espacio de almacenamiento.',
            price: 44000,
            capacity: 2,
            residence: 'A',
            amenities: ['WiFi', 'Baño compartido', 'Aire acondicionado', 'Escritorio', 'Armario doble'],
            images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
        },
        {
            name: 'Habitación Doble Comfort',
            description: 'Habitación doble moderna con cama matrimonial, baño privado y balcón.',
            price: 52000,
            capacity: 2,
            residence: 'A',
            amenities: ['WiFi', 'Baño privado', 'Balcón', 'Aire acondicionado', 'TV LED 43"'],
            images: ['https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80'],
        },
        {
            name: 'Habitación Triple',
            description: 'Amplia habitación triple con tres camas individuales, ideal para grupos de estudio.',
            price: 60000,
            capacity: 3,
            residence: 'A',
            amenities: ['WiFi', 'Baño privado', 'Aire acondicionado', 'Escritorio grupal', 'TV 40"'],
            images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
        },
        {
            name: 'Suite Junior',
            description: 'Suite con zona de estar separada, minibar y baño de lujo. Vista panorámica.',
            price: 75000,
            capacity: 2,
            residence: 'A',
            amenities: ['WiFi Alta Velocidad', 'Minibar', 'Baño de lujo', 'Vista panorámica', 'Sala de estar'],
            images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'],
        },
        {
            name: 'Habitación Accesible',
            description: 'Habitación adaptada para personas con movilidad reducida, con amplio baño y accesos facilitados.',
            price: 38000,
            capacity: 1,
            residence: 'A',
            amenities: ['WiFi', 'Baño adaptado', 'Aire acondicionado', 'Acceso facilitado', 'TV LED 32"'],
            images: ['https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80'],
        },
        {
            name: 'Habitación con Kitchenette',
            description: 'Habitación completa con kitchenette equipada con heladera, microondas y utensilios básicos.',
            price: 55000,
            capacity: 1,
            residence: 'A',
            amenities: ['WiFi', 'Kitchenette', 'Baño privado', 'Aire acondicionado', 'TV Smart'],
            images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'],
        },
    ];

    for (const roomData of newRooms) {
        await prisma.room.create({ data: roomData });
        console.log(`✅ Created: ${roomData.name}`);
    }

    const total = await prisma.room.count({ where: { residence: 'A' } });
    console.log(`\n📊 Total rooms in Residencia A: ${total}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
