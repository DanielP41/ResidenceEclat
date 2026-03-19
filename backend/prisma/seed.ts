import { PrismaClient, Role, RoomStatus, Residence } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ── Create admin user ──
    const hashedPassword = await bcrypt.hash('Admin123!', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@residencia-eclat.com' },
        update: {},
        create: {
            email: 'admin@residencia-eclat.com',
            password: hashedPassword,
            name: 'Administrador',
            role: Role.ADMIN,
        },
    });
    console.log(`✅ Admin user created: ${admin.email}`);

    // ── Create staff user ──
    const staffPassword = await bcrypt.hash('Staff123!', 12);
    const staff = await prisma.user.upsert({
        where: { email: 'staff@residencia-eclat.com' },
        update: {},
        create: {
            email: 'staff@residencia-eclat.com',
            password: staffPassword,
            name: 'Personal',
            role: Role.STAFF,
        },
    });
    console.log(`✅ Staff user created: ${staff.email}`);

    // ── Create Dynamic Residences ──
    const residenceData = [
        { name: 'San Telmo', address: 'Calle Falsa 123, CABA', description: 'Nuestra sede histórica en San Telmo.' },
        { name: 'Parque Avellaneda I', address: 'Av. Directorio 456, CABA', description: 'Moderna sede en el corazón de Parque Avellaneda.' },
        { name: 'Parque Avellaneda II', address: 'Av. Directorio 789, CABA', description: 'Anexo con servicios premium.' }
    ];

    const createdResidences: Residence[] = [];
    for (const res of residenceData) {
        const created = await prisma.residence.create({
            data: res
        });
        createdResidences.push(created);
        console.log(`✅ Residence created: ${created.name}`);
    }

    // ── Create rooms linked to residences ──
    const roomsSeed = [
        // Sede A (ID 1)
        ...Array.from({ length: 5 }, (_, i) => ({
            name: `Habitación Individual ${101 + i}`,
            description: 'Acogedora habitación individual con baño privado.',
            price: 35000,
            capacity: 1,
            residenceId: createdResidences[0].id,
            images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a"]
        })),
        {
            name: 'Suite Doble Deluxe',
            description: 'Espaciosa habitación doble con cama matrimonial.',
            price: 50000,
            capacity: 2,
            residenceId: createdResidences[0].id,
            images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427"]
        },
        // Sede B (ID 2)
        {
            name: 'Estudio Moderno',
            description: 'Studio concepto abierto con kitchenette.',
            price: 45000,
            capacity: 1,
            residenceId: createdResidences[1].id,
            images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]
        },
        // Sede C (ID 3)
        {
            name: 'Loft con Terraza',
            description: 'Loft exclusivo con terraza privada.',
            price: 90000,
            capacity: 2,
            residenceId: createdResidences[2].id,
            images: ["https://images.unsplash.com/photo-1560185127-6ed189bf02f4"]
        }
    ];

    for (const roomData of roomsSeed) {
        await prisma.room.create({
            data: {
                ...roomData,
                status: RoomStatus.AVAILABLE,
                amenities: ['WiFi', 'Aire acondicionado', 'Baño privado'],
            }
        });
    }
    console.log(`✅ Created ${roomsSeed.length} rooms`);

    // ── Create sample guest ──
    const guest = await prisma.guest.upsert({
        where: { email: 'guest@example.com' },
        update: {},
        create: {
            name: 'Juan Pérez',
            email: 'guest@example.com',
            phone: '+5491155551234',
            documentType: 'DNI',
            documentNumber: '33456789',
        },
    });
    console.log(`✅ Guest created: ${guest.name}`);

    console.log('\n🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
