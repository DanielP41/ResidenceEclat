import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/bookings.service', () => ({
    createBooking: vi.fn(),
    getBookings: vi.fn(),
    getBookingById: vi.fn(),
    updateBooking: vi.fn(),
    checkInBooking: vi.fn(),
    checkOutBooking: vi.fn(),
}));

import {
    createBooking,
    getBookings,
    getBooking,
    updateBooking,
    checkInBooking,
    checkOutBooking,
} from '../controllers/bookings.controller';
import * as bookingService from '../services/bookings.service';

// Helpers para mock de req/res
const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (overrides: any = {}): any => ({
    body: {},
    params: {},
    query: {},
    user: { userId: 1 },
    ...overrides,
});

beforeEach(() => {
    vi.clearAllMocks();
});

// ─── createBooking ────────────────────────────────────────────────────────────

describe('createBooking', () => {
    it('devuelve 201 con la reserva creada', async () => {
        const booking = { id: 1, status: 'PENDING' };
        vi.mocked(bookingService.createBooking).mockResolvedValue(booking as any);

        const req = mockReq({ body: { roomId: 1 } });
        const res = mockRes();

        await createBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: booking });
    });

    it('devuelve 400 si el servicio lanza un error', async () => {
        const error: any = new Error('Habitación no disponible');
        error.statusCode = 400;
        vi.mocked(bookingService.createBooking).mockRejectedValue(error);

        const req = mockReq({ body: {} });
        const res = mockRes();

        await createBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'error', message: 'Habitación no disponible' })
        );
    });
});

// ─── getBookings ──────────────────────────────────────────────────────────────

describe('getBookings', () => {
    it('devuelve todas las reservas', async () => {
        const bookings = [{ id: 1 }, { id: 2 }];
        vi.mocked(bookingService.getBookings).mockResolvedValue(bookings as any);

        const req = mockReq({ query: {} });
        const res = mockRes();

        await getBookings(req, res);

        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: bookings });
    });

    it('pasa los filtros de status y roomId al servicio', async () => {
        vi.mocked(bookingService.getBookings).mockResolvedValue([]);

        const req = mockReq({ query: { status: 'PENDING', roomId: '5' } });
        const res = mockRes();

        await getBookings(req, res);

        expect(bookingService.getBookings).toHaveBeenCalledWith({ status: 'PENDING', roomId: 5, page: 1, limit: 50 });
    });

    it('devuelve 500 si el servicio falla', async () => {
        vi.mocked(bookingService.getBookings).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ query: {} });
        const res = mockRes();

        await getBookings(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── getBooking ───────────────────────────────────────────────────────────────

describe('getBooking', () => {
    it('devuelve la reserva cuando existe', async () => {
        const booking = { id: 42 };
        vi.mocked(bookingService.getBookingById).mockResolvedValue(booking as any);

        const req = mockReq({ params: { id: '42' } });
        const res = mockRes();

        await getBooking(req, res);

        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: booking });
    });

    it('devuelve 404 si la reserva no existe', async () => {
        vi.mocked(bookingService.getBookingById).mockResolvedValue(null);

        const req = mockReq({ params: { id: '99' } });
        const res = mockRes();

        await getBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'error', message: 'Reserva no encontrada' })
        );
    });

    it('devuelve 500 si el servicio falla', async () => {
        vi.mocked(bookingService.getBookingById).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await getBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── updateBooking ────────────────────────────────────────────────────────────

describe('updateBooking', () => {
    it('devuelve la reserva actualizada', async () => {
        const updated = { id: 1, status: 'CONFIRMED' };
        vi.mocked(bookingService.updateBooking).mockResolvedValue(updated as any);

        const req = mockReq({ params: { id: '1' }, body: { status: 'CONFIRMED' }, user: { userId: 2 } });
        const res = mockRes();

        await updateBooking(req, res);

        expect(bookingService.updateBooking).toHaveBeenCalledWith(1, { status: 'CONFIRMED' }, 2, undefined);
        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updated });
    });

    it('devuelve 500 si el servicio falla', async () => {
        vi.mocked(bookingService.updateBooking).mockRejectedValue(new Error('Reserva no encontrada'));

        const req = mockReq({ params: { id: '1' }, body: { status: 'CONFIRMED' } });
        const res = mockRes();

        await updateBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── checkInBooking ───────────────────────────────────────────────────────────

describe('checkInBooking', () => {
    it('devuelve 200 con la reserva actualizada a CHECKED_IN', async () => {
        const booking = { id: 1, status: 'CHECKED_IN', checkedInAt: new Date() };
        vi.mocked(bookingService.checkInBooking).mockResolvedValue(booking as any);

        const req = mockReq({ params: { id: '1' }, user: { userId: 2 } });
        const res = mockRes();

        await checkInBooking(req, res);

        expect(bookingService.checkInBooking).toHaveBeenCalledWith(1, 2, undefined);
        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: booking });
    });

    it('devuelve 400 si la reserva no está en estado CONFIRMED', async () => {
        const error: any = new Error('No se puede hacer check-in: la reserva está en estado PENDING.');
        error.statusCode = 400;
        error.code = 'INVALID_STATUS_TRANSITION';
        vi.mocked(bookingService.checkInBooking).mockRejectedValue(error);

        const req = mockReq({ params: { id: '1' }, user: { userId: 2 } });
        const res = mockRes();

        await checkInBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'error', code: 'INVALID_STATUS_TRANSITION' })
        );
    });

    it('devuelve 404 si la reserva no existe', async () => {
        const error: any = new Error('Reserva no encontrada');
        error.statusCode = 404;
        vi.mocked(bookingService.checkInBooking).mockRejectedValue(error);

        const req = mockReq({ params: { id: '99' }, user: { userId: 2 } });
        const res = mockRes();

        await checkInBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});

// ─── checkOutBooking ──────────────────────────────────────────────────────────

describe('checkOutBooking', () => {
    it('devuelve 200 con la reserva actualizada a CHECKED_OUT', async () => {
        const booking = { id: 1, status: 'CHECKED_OUT', checkedOutAt: new Date() };
        vi.mocked(bookingService.checkOutBooking).mockResolvedValue(booking as any);

        const req = mockReq({ params: { id: '1' }, user: { userId: 2 } });
        const res = mockRes();

        await checkOutBooking(req, res);

        expect(bookingService.checkOutBooking).toHaveBeenCalledWith(1, 2, undefined);
        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: booking });
    });

    it('devuelve 400 si la reserva no está en estado CHECKED_IN', async () => {
        const error: any = new Error('No se puede hacer check-out: la reserva está en estado CONFIRMED.');
        error.statusCode = 400;
        error.code = 'INVALID_STATUS_TRANSITION';
        vi.mocked(bookingService.checkOutBooking).mockRejectedValue(error);

        const req = mockReq({ params: { id: '1' }, user: { userId: 2 } });
        const res = mockRes();

        await checkOutBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'error', code: 'INVALID_STATUS_TRANSITION' })
        );
    });

    it('devuelve 404 si la reserva no existe', async () => {
        const error: any = new Error('Reserva no encontrada');
        error.statusCode = 404;
        vi.mocked(bookingService.checkOutBooking).mockRejectedValue(error);

        const req = mockReq({ params: { id: '99' }, user: { userId: 2 } });
        const res = mockRes();

        await checkOutBooking(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });
});
