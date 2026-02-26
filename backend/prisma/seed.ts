import { PrismaClient, Role } from '@prisma/client';
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

    // ── Create sample rooms ──
    // ── Create sample rooms ──
    const residences = [
        {
            name: 'Residencia A',
            rooms: [
                // Individuales (5)
                ...[
                    "https://images.unsplash.com/photo-1566665797739-1674de7a421a",
                    "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
                    "https://images.unsplash.com/photo-1540518614846-7eded433c457",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2069"
                ].map((img, i) => ({
                    name: 'Habitacion Indvidual',
                    description: 'Acogedora habitación individual con baño privado, ideal para estadías cortas o largas.',
                    price: 35000,
                    capacity: 1,
                    amenities: ['WiFi', 'Baño privado', 'Aire acondicionado', 'Escritorio'],
                    images: [img]
                })),
                // Doble (1)
                {
                    name: 'Habitacion Doble',
                    description: 'Espaciosa habitación doble con cama matrimonial y todas las comodidades.',
                    price: 50000,
                    capacity: 2,
                    amenities: ['WiFi', 'Baño privado', 'Aire acondicionado', 'TV LED 43"'],
                    images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974"]
                },
                // Cuadruples (4)
                ...Array.from({ length: 4 }, (_, i) => ({
                    name: 'Habitacion Cuadruple',
                    description: 'Habitación familiar o grupal con capacidad para 4 personas.',
                    price: 80000,
                    capacity: 4,
                    amenities: ['WiFi', 'Baño privado', 'Aire acondicionado', '4 Camas'],
                    images: ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069"]
                }))
            ]
        },
        {
            name: 'Residencia B',
            rooms: [
                {
                    name: 'Studio Moderno',
                    description: 'Studio concepto abierto con kitchenette y zona de estar. Diseño industrial y moderno.',
                    price: 45000,
                    capacity: 1,
                    amenities: ['WiFi', 'Kitchenette', 'Aire acondicionado', 'Smart TV', 'Escritorio'],
                    images: [
                        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980",
                        "https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=1918"
                    ]
                },
                {
                    name: 'Suite Ejecutiva',
                    description: 'Suite pensada para profesionales. Amplio espacio de trabajo, insonorización y servicios premium.',
                    price: 70000,
                    capacity: 2,
                    amenities: ['WiFi Alta Velocidad', 'Insonorización', 'Cafetera Nespresso', 'Escritorio Ergonómico'],
                    images: [
                        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?q=80&w=2070",
                        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=2070"
                    ]
                }
            ]
        },
        {
            name: 'Residencia C',
            rooms: [
                {
                    name: 'Habitación Compartida Premium',
                    description: 'Habitación compartida de alto nivel. Camas tipo cápsula para mayor privacidad, lockers inteligentes y áreas comunes de diseño.',
                    price: 20000,
                    capacity: 1,
                    amenities: ['WiFi', 'Locker Inteligente', 'Cama Cápsula', 'Áreas Comunes', 'Cocina Compartida'],
                    images: [
                        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069",
                        "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?q=80&w=2070"
                    ]
                },
                {
                    name: 'Loft con Terraza',
                    description: 'Loft exclusivo en el último piso con terraza privada y vistas panorámicas de la ciudad.',
                    price: 90000,
                    capacity: 2,
                    amenities: ['WiFi', 'Terraza Privada', 'Jacuzzi', 'Cocina Completa', 'Vista Panorámica'],
                    images: [
                        "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?q=80&w=2070",
                        "https://images.unsplash.com/photo-1512918760513-95f192972701?q=80&w=2070"
                    ]
                }
            ]
        }
    ];

    for (const residence of residences) {
        for (const roomData of residence.rooms) {
            const room = await prisma.room.create({
                data: {
                    name: roomData.name,
                    description: roomData.description,
                    price: roomData.price,
                    capacity: roomData.capacity,
                    residence: residence.name.replace('Residencia ', ''), // Store as 'A', 'B', 'C'
                    amenities: roomData.amenities,
                    images: roomData.images,
                },
            });
            console.log(`✅ Room created in ${residence.name}: ${room.name}`);
        }
    }

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
