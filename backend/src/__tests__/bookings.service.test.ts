import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/database', () => ({
    prisma: {
        guest: { upsert: vi.fn() },
        room: { findFirst: vi.fn() },
        booking: { create: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
        $transaction: vi.fn(),
    },
}));

vi.mock('../services/rooms.service', () => ({
    checkAvailability: vi.fn(),
}));

vi.mock('../services/email.service', () => ({
    sendBookingConfirmation: vi.fn(),
    sendBookingCancellation: vi.fn(),
}));

vi.mock('../services/audit.service', () => ({
    createAuditLog: vi.fn(),
}));

import { createBooking, updateBooking } from '../services/bookings.service';
import { prisma } from '../config/database';
import { checkAvailability } from '../services/rooms.service';
import { ConflictError, NotFoundError } from '../utils/errors';
import { BookingStatus, PaymentStatus } from '@prisma/client';

const mockPrisma = vi.mocked(prisma);

const baseBookingData = {
    roomId: 1,
    checkIn: '2026-04-01',
    checkOut: '2026-04-05',
    acceptedTerms: true as const,
    guest: {
        name: 'Juan Pérez',
        email: 'juan@test.com',
        phone: '+54911234567',
        documentType: 'DNI' as const,
        documentNumber: '12345678',
    },
};

const mockGuest = { id: 10, ...baseBookingData.guest };
const mockRoom = { id: 1, name: 'Hab. 101', price: 5000, residenceId: 1 };

// Crea un tx client fresco por test con sus propios vi.fn()
function makeTx(overrides: Record<string, any> = {}) {
    return {
        guest: { upsert: vi.fn().mockResolvedValue(mockGuest) },
        room: { findFirst: vi.fn().mockResolvedValue(mockRoom) },
        booking: {
            create: vi.fn(),
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
            findFirst: vi.fn().mockResolvedValue(null), // sin colisión por defecto
        },
        $queryRaw: vi.fn().mockResolvedValue([{ id: 1 }]), // mock SELECT FOR UPDATE
        ...overrides,
    };
}

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── createBooking ────────────────────────────────────────────────────────────

describe('createBooking', () => {
    it('lanza ConflictError si la habitación no está disponible', async () => {
        const tx = makeTx();
        tx.booking.findFirst.mockResolvedValue({ id: 999 }); // simula colisión
        (mockPrisma.$transaction as any).mockImplementation((cb: any) => cb(tx));

        await expect(createBooking(baseBookingData as any)).rejects.toThrow(ConflictError);
        await expect(createBooking(baseBookingData as any)).rejects.toThrow('La habitación ya no está disponible');
    });

    it('lanza NotFoundError si la habitación no existe', async () => {
        const tx = makeTx();
        tx.room.findFirst.mockResolvedValue(null); // sin habitación
        (mockPrisma.$transaction as any).mockImplementation((cb: any) => cb(tx));

        await expect(createBooking(baseBookingData as any)).rejects.toThrow(NotFoundError);
        await expect(createBooking(baseBookingData as any)).rejects.toThrow('Habitación no encontrada');
    });

    it('calcula correctamente el precio total (noches × precio)', async () => {
        const expectedNights = 4;
        const expectedPrice = mockRoom.price * expectedNights; // 20000

        const mockBooking = {
            id: 99,
            totalNights: expectedNights,
            totalPrice: expectedPrice,
            status: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            room: { ...mockRoom, residence: { name: 'San Telmo' } },
            guest: mockGuest,
        };

        const tx = makeTx();
        tx.booking.create.mockResolvedValue(mockBooking);
        (mockPrisma.$transaction as any).mockImplementation((cb: any) => cb(tx));

        const result = await createBooking(baseBookingData as any);

        expect(tx.booking.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    totalNights: expectedNights,
                    totalPrice: expectedPrice,
                }),
            })
        );
        expect(result.totalPrice).toBe(expectedPrice);
        expect(result.totalNights).toBe(expectedNights);
    });

    it('crea la reserva con estado PENDING', async () => {
        const mockBooking = {
            id: 100,
            status: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            totalNights: 4,
            totalPrice: 20000,
            room: { ...mockRoom, residence: { name: 'San Telmo' } },
            guest: mockGuest,
        };

        const tx = makeTx();
        tx.booking.create.mockResolvedValue(mockBooking);
        (mockPrisma.$transaction as any).mockImplementation((cb: any) => cb(tx));

        const result = await createBooking(baseBookingData as any);

        expect(tx.booking.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    status: BookingStatus.PENDING,
                    paymentStatus: PaymentStatus.PENDING,
                }),
            })
        );
        expect(result.status).toBe(BookingStatus.PENDING);
    });

    it('no crea la reserva si hay colisión de fechas', async () => {
        const tx = makeTx();
        tx.booking.findFirst.mockResolvedValue({ id: 999 });
        (mockPrisma.$transaction as any).mockImplementation((cb: any) => cb(tx));

        await expect(createBooking(baseBookingData as any)).rejects.toThrow();
        expect(tx.booking.create).not.toHaveBeenCalled();
    });
});

// ─── updateBooking ────────────────────────────────────────────────────────────

describe('updateBooking', () => {
    it('lanza NotFoundError si la reserva no existe', async () => {
        (mockPrisma.booking.findUnique as any).mockResolvedValue(null);

        await expect(updateBooking(999, { status: BookingStatus.CONFIRMED }, 1)).rejects.toThrow(NotFoundError);
        await expect(updateBooking(999, { status: BookingStatus.CONFIRMED }, 1)).rejects.toThrow('Reserva no encontrada');
    });

    it('registra cancelledAt cuando el estado es CANCELLED', async () => {
        const existingBooking = { id: 1, status: BookingStatus.CONFIRMED, roomId: 1, guestId: 10 };
        const updatedBooking = {
            ...existingBooking,
            status: BookingStatus.CANCELLED,
            cancelledAt: new Date(),
            checkIn: new Date('2026-04-01'),
            checkOut: new Date('2026-04-05'),
            totalNights: 4,
            totalPrice: 20000,
            room: { ...mockRoom, residence: { name: 'San Telmo' } },
            guest: mockGuest,
        };

        (mockPrisma.booking.findUnique as any).mockResolvedValue(existingBooking);
        (mockPrisma.booking.update as any).mockResolvedValue(updatedBooking);

        await updateBooking(1, { status: BookingStatus.CANCELLED }, 1);

        expect(mockPrisma.booking.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    cancelledAt: expect.any(Date),
                    cancelledById: 1,
                }),
            })
        );
    });

    it('registra checkedInAt cuando el estado es CHECKED_IN', async () => {
        const existingBooking = { id: 1, status: BookingStatus.CONFIRMED };
        const updatedBooking = {
            ...existingBooking,
            status: BookingStatus.CHECKED_IN,
            checkedInAt: new Date(),
            room: { ...mockRoom, residence: { name: 'San Telmo' } },
            guest: mockGuest,
        };

        (mockPrisma.booking.findUnique as any).mockResolvedValue(existingBooking);
        (mockPrisma.booking.update as any).mockResolvedValue(updatedBooking);

        await updateBooking(1, { status: BookingStatus.CHECKED_IN }, 1);

        expect(mockPrisma.booking.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    checkedInAt: expect.any(Date),
                }),
            })
        );
    });
});
