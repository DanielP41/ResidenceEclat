/**
 * Tests de integración — Bookings Service
 *
 * Estos tests corren contra PostgreSQL real (sin mocks de Prisma).
 * Verifican el comportamiento transaccional que los tests unitarios no pueden cubrir.
 *
 * Prerequisito: DATABASE_URL debe apuntar a una DB accesible con el schema aplicado.
 * Ejecutar con:  npm run test:integration
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createBooking, getBookings } from '../../services/bookings.service';
import { ConflictError } from '../../utils/errors';
import {
    prismaTest,
    cleanDatabase,
    createTestResidence,
    createTestRoom,
    bookingPayload,
} from './helpers';

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

let residenceId: number;
let roomId: number;

beforeAll(async () => {
    await prismaTest.$connect();
});

afterAll(async () => {
    await cleanDatabase();
    await prismaTest.$disconnect();
});

beforeEach(async () => {
    await cleanDatabase();
    const residence = await createTestResidence();
    residenceId = residence.id;
    const room = await createTestRoom(residenceId);
    roomId = room.id;
});

// ─── Happy path ────────────────────────────────────────────────────────────────

describe('createBooking — happy path', () => {
    it('crea una reserva y devuelve el objeto completo', async () => {
        const payload = bookingPayload(roomId);
        const booking = await createBooking(payload as any);

        expect(booking.id).toBeDefined();
        expect(booking.roomId).toBe(roomId);
        expect(booking.status).toBe('PENDING');
        expect(booking.totalNights).toBe(4);
        expect(Number(booking.totalPrice)).toBe(4000); // 1000 * 4 noches
        expect(booking.guest.email).toBe(payload.guest.email);
    });

    it('calcula correctamente las noches y el precio', async () => {
        const payload = bookingPayload(roomId, {
            checkIn: '2030-07-10',
            checkOut: '2030-07-13', // 3 noches
        });
        const booking = await createBooking(payload as any);

        expect(booking.totalNights).toBe(3);
        expect(Number(booking.totalPrice)).toBe(3000);
    });

    it('reutiliza el huésped si el email ya existe (upsert)', async () => {
        const email = 'repeat@test.com';
        const payload1 = bookingPayload(roomId, {
            checkIn: '2030-08-01', checkOut: '2030-08-03',
            guest: { name: 'Nombre Original', email, phone: '111', documentType: 'DNI', documentNumber: '1' },
        });
        const payload2 = bookingPayload(roomId, {
            checkIn: '2030-09-01', checkOut: '2030-09-03',
            guest: { name: 'Nombre Actualizado', email, phone: '222', documentType: 'DNI', documentNumber: '1' },
        });

        const b1 = await createBooking(payload1 as any);
        const b2 = await createBooking(payload2 as any);

        // Mismo guest ID → upsert funcionó
        expect(b1.guestId).toBe(b2.guestId);
        // Nombre actualizado en la segunda reserva
        expect(b2.guest.name).toBe('Nombre Actualizado');
    });

    it('rechaza checkIn >= checkOut', async () => {
        const payload = bookingPayload(roomId, {
            checkIn: '2030-06-05',
            checkOut: '2030-06-05',
        });

        await expect(createBooking(payload as any)).rejects.toThrow();
    });
});

// ─── Disponibilidad ────────────────────────────────────────────────────────────

describe('createBooking — disponibilidad', () => {
    it('rechaza una reserva que solapa completamente a otra existente', async () => {
        // Primera reserva: 01-05 jun
        await createBooking(bookingPayload(roomId) as any);

        // Segunda reserva: mismas fechas → debe fallar
        const payload2 = bookingPayload(roomId, {
            guest: { name: 'Otro', email: 'otro@test.com', phone: '111', documentType: 'DNI', documentNumber: '2' },
        });

        await expect(createBooking(payload2 as any)).rejects.toThrow(ConflictError);
    });

    it('rechaza reserva con solapamiento parcial al inicio', async () => {
        // Existente: 01-05 jun
        await createBooking(bookingPayload(roomId) as any);

        // Nueva: 03-07 jun → solapa
        const payload2 = bookingPayload(roomId, {
            checkIn: '2030-06-03', checkOut: '2030-06-07',
            guest: { name: 'Otro', email: 'otro2@test.com', phone: '111', documentType: 'DNI', documentNumber: '3' },
        });

        await expect(createBooking(payload2 as any)).rejects.toThrow(ConflictError);
    });

    it('rechaza reserva con solapamiento parcial al final', async () => {
        // Existente: 01-05 jun
        await createBooking(bookingPayload(roomId) as any);

        // Nueva: 28 may - 02 jun → solapa
        const payload2 = bookingPayload(roomId, {
            checkIn: '2030-05-28', checkOut: '2030-06-02',
            guest: { name: 'Otro', email: 'otro3@test.com', phone: '111', documentType: 'DNI', documentNumber: '4' },
        });

        await expect(createBooking(payload2 as any)).rejects.toThrow(ConflictError);
    });

    it('permite reserva en fechas adyacentes (checkout = checkin siguiente)', async () => {
        // Existente: 01-05 jun
        await createBooking(bookingPayload(roomId) as any);

        // Nueva: 05-08 jun → adyacente, no solapa
        const payload2 = bookingPayload(roomId, {
            checkIn: '2030-06-05', checkOut: '2030-06-08',
            guest: { name: 'Otro', email: 'adj@test.com', phone: '111', documentType: 'DNI', documentNumber: '5' },
        });

        const booking = await createBooking(payload2 as any);
        expect(booking.id).toBeDefined();
    });

    it('permite reserva en habitación diferente para las mismas fechas', async () => {
        const room2 = await createTestRoom(residenceId, { name: 'Habitación 2' });

        // Reserva en room1
        await createBooking(bookingPayload(roomId) as any);

        // Reserva en room2 — mismas fechas → debe funcionar
        const payload2 = bookingPayload(room2.id, {
            guest: { name: 'Otro', email: 'otro4@test.com', phone: '111', documentType: 'DNI', documentNumber: '6' },
        });

        const booking = await createBooking(payload2 as any);
        expect(booking.roomId).toBe(room2.id);
    });
});

// ─── Concurrencia ──────────────────────────────────────────────────────────────

describe('createBooking — concurrencia', () => {
    it('bajo carga simultánea solo permite una reserva para el mismo cupo', async () => {
        // Dos solicitudes idénticas lanzadas al mismo tiempo
        const p1 = bookingPayload(roomId, {
            guest: { name: 'Usuario A', email: 'ua@test.com', phone: '111', documentType: 'DNI', documentNumber: '10' },
        });
        const p2 = bookingPayload(roomId, {
            guest: { name: 'Usuario B', email: 'ub@test.com', phone: '222', documentType: 'DNI', documentNumber: '11' },
        });

        const results = await Promise.allSettled([
            createBooking(p1 as any),
            createBooking(p2 as any),
        ]);

        const fulfilled = results.filter(r => r.status === 'fulfilled');
        const rejected  = results.filter(r => r.status === 'rejected');

        // La transacción de Prisma garantiza que solo una gana
        expect(fulfilled).toHaveLength(1);
        expect(rejected).toHaveLength(1);

        // La que falla debe ser un ConflictError (no un crash genérico)
        const err = (rejected[0] as PromiseRejectedResult).reason;
        expect(err).toBeInstanceOf(ConflictError);
    });

    it('bajo carga simultánea en habitaciones distintas ambas reservas se crean', async () => {
        const room2 = await createTestRoom(residenceId, { name: 'Habitación 2' });

        const p1 = bookingPayload(roomId, {
            guest: { name: 'Usuario A', email: 'ua2@test.com', phone: '111', documentType: 'DNI', documentNumber: '12' },
        });
        const p2 = bookingPayload(room2.id, {
            guest: { name: 'Usuario B', email: 'ub2@test.com', phone: '222', documentType: 'DNI', documentNumber: '13' },
        });

        const results = await Promise.allSettled([
            createBooking(p1 as any),
            createBooking(p2 as any),
        ]);

        // Habitaciones distintas → ambas deben crearse sin conflicto
        expect(results.every(r => r.status === 'fulfilled')).toBe(true);
    });
});

// ─── getBookings ───────────────────────────────────────────────────────────────

describe('getBookings — paginación', () => {
    it('devuelve estructura paginada correcta', async () => {
        await createBooking(bookingPayload(roomId, {
            checkIn: '2030-10-01', checkOut: '2030-10-03',
        }) as any);

        const result = await getBookings({ page: 1, limit: 10 });

        expect(result).toHaveProperty('items');
        expect(result).toHaveProperty('total');
        expect(result).toHaveProperty('page', 1);
        expect(result).toHaveProperty('limit', 10);
        expect(result).toHaveProperty('totalPages');
        expect(Array.isArray(result.items)).toBe(true);
        expect(result.total).toBeGreaterThanOrEqual(1);
    });

    it('filtra correctamente por roomId', async () => {
        const room2 = await createTestRoom(residenceId, { name: 'Hab 2' });

        await createBooking(bookingPayload(roomId, {
            checkIn: '2030-10-01', checkOut: '2030-10-03',
            guest: { name: 'A', email: 'fa@test.com', phone: '1', documentType: 'DNI', documentNumber: '20' },
        }) as any);
        await createBooking(bookingPayload(room2.id, {
            checkIn: '2030-10-01', checkOut: '2030-10-03',
            guest: { name: 'B', email: 'fb@test.com', phone: '2', documentType: 'DNI', documentNumber: '21' },
        }) as any);

        const result = await getBookings({ roomId });

        expect(result.items.every((b: any) => b.roomId === roomId)).toBe(true);
        expect(result.total).toBe(1);
    });
});
