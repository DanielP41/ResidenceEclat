/**
 * Helpers para tests de integración.
 * Crea datos mínimos en la DB de test y limpia entre suites.
 *
 * Requiere DATABASE_URL apuntando a una DB PostgreSQL accesible.
 * Se recomienda usar la misma instancia de desarrollo con un schema aislado,
 * o la DB del docker-compose levantada localmente.
 */
import { PrismaClient } from '@prisma/client';

export const prismaTest = new PrismaClient({
    log: [], // silencioso durante tests
});

/** Borra todas las tablas relevantes en orden seguro (FK) */
export async function cleanDatabase() {
    await prismaTest.$transaction([
        prismaTest.auditLog.deleteMany(),
        prismaTest.booking.deleteMany(),
        prismaTest.guest.deleteMany(),
        prismaTest.observation.deleteMany(),
        prismaTest.room.deleteMany(),
        prismaTest.residence.deleteMany(),
        prismaTest.user.deleteMany(),
    ]);
}

/** Crea una sede mínima de test */
export async function createTestResidence(name = 'Sede Test') {
    return prismaTest.residence.create({ data: { name } });
}

/** Crea una habitación de test en la sede dada */
export async function createTestRoom(residenceId: number, overrides: Record<string, any> = {}) {
    return prismaTest.room.create({
        data: {
            name: 'Habitación Test',
            price: 1000,
            capacity: 2,
            residenceId,
            ...overrides,
        },
    });
}

/** Payload de reserva válido */
export function bookingPayload(roomId: number, overrides: Record<string, any> = {}) {
    return {
        roomId,
        checkIn: '2030-06-01',
        checkOut: '2030-06-05',
        acceptedTerms: true,
        guest: {
            name: 'Test Guest',
            email: `guest-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`,
            phone: '1123456789',
            documentType: 'DNI',
            documentNumber: '12345678',
        },
        ...overrides,
    };
}
