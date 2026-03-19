import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/rooms.service', () => ({
    getAllRooms: vi.fn(),
    getRoomById: vi.fn(),
    createRoom: vi.fn(),
    updateRoom: vi.fn(),
    deleteRoom: vi.fn(),
    getAvailableRooms: vi.fn(),
}));

vi.mock('../config/logger', () => ({
    default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import {
    getAllRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    checkAvailability,
} from '../controllers/rooms.controller';
import * as roomService from '../services/rooms.service';

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

// ─── getAllRooms ──────────────────────────────────────────────────────────────

describe('getAllRooms', () => {
    it('devuelve todas las habitaciones', async () => {
        const rooms = [{ id: 1, name: 'Room 1' }];
        (roomService.getAllRooms as any).mockResolvedValue(rooms as any);

        const req = mockReq();
        const res = mockRes();

        await getAllRooms(req, res);

        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: rooms });
    });

    it('filtra por residenceId si se provee', async () => {
        vi.mocked(roomService.getAllRooms).mockResolvedValue([]);

        const req = mockReq({ query: { residenceId: '3' } });
        const res = mockRes();

        await getAllRooms(req, res);

        expect(roomService.getAllRooms).toHaveBeenCalledWith({
            residenceId: 3,
            priceMin: undefined,
            priceMax: undefined,
            capacity: undefined,
            status: undefined,
            sortBy: undefined,
            order: undefined,
        });
    });

    it('devuelve 500 si el servicio falla', async () => {
        vi.mocked(roomService.getAllRooms).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ query: {} });
        const res = mockRes();

        await getAllRooms(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── getRoom ──────────────────────────────────────────────────────────────────

describe('getRoom', () => {
    it('devuelve la habitación cuando existe', async () => {
        const room = { id: 5, name: 'Hab. 101' };
        vi.mocked(roomService.getRoomById).mockResolvedValue(room as any);

        const req = mockReq({ params: { id: '5' } });
        const res = mockRes();

        await getRoom(req, res);

        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: room });
    });

    it('devuelve 404 si la habitación no existe', async () => {
        vi.mocked(roomService.getRoomById).mockResolvedValue(null);

        const req = mockReq({ params: { id: '99' } });
        const res = mockRes();

        await getRoom(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'error', message: 'Habitación no encontrada' })
        );
    });
});

// ─── createRoom ───────────────────────────────────────────────────────────────

describe('createRoom', () => {
    it('devuelve 201 con la habitación creada', async () => {
        const room = { id: 10, name: 'Hab. 201' };
        vi.mocked(roomService.createRoom).mockResolvedValue(room as any);

        const req = mockReq({ body: { name: 'Hab. 201' }, user: { userId: 1 } });
        const res = mockRes();

        await createRoom(req, res);

        expect(roomService.createRoom).toHaveBeenCalledWith({ name: 'Hab. 201' }, 1, undefined);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: room });
    });

    it('devuelve 500 si el servicio falla', async () => {
        vi.mocked(roomService.createRoom).mockRejectedValue(new Error('Validación fallida'));

        const req = mockReq({ body: {} });
        const res = mockRes();

        await createRoom(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── updateRoom ───────────────────────────────────────────────────────────────

describe('updateRoom', () => {
    it('devuelve la habitación actualizada', async () => {
        const updated = { id: 1, name: 'Hab. 101 Actualizada' };
        vi.mocked(roomService.updateRoom).mockResolvedValue(updated as any);

        const req = mockReq({ params: { id: '1' }, body: { name: 'Hab. 101 Actualizada' }, user: { userId: 2 } });
        const res = mockRes();

        await updateRoom(req, res);

        expect(roomService.updateRoom).toHaveBeenCalledWith(1, { name: 'Hab. 101 Actualizada' }, 2, undefined);
        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updated });
    });

    it('devuelve 500 si el servicio falla', async () => {
        vi.mocked(roomService.updateRoom).mockRejectedValue(new Error('No encontrada'));

        const req = mockReq({ params: { id: '1' }, body: {} });
        const res = mockRes();

        await updateRoom(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── deleteRoom ───────────────────────────────────────────────────────────────

describe('deleteRoom', () => {
    it('devuelve mensaje de éxito al eliminar', async () => {
        vi.mocked(roomService.deleteRoom).mockResolvedValue({} as any);

        const req = mockReq({ params: { id: '3' }, user: { userId: 1 } });
        const res = mockRes();

        await deleteRoom(req, res);

        expect(roomService.deleteRoom).toHaveBeenCalledWith(3, 1, undefined);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success' })
        );
    });

    it('devuelve 500 si el servicio falla', async () => {
        vi.mocked(roomService.deleteRoom).mockRejectedValue(new Error('Error'));

        const req = mockReq({ params: { id: '3' } });
        const res = mockRes();

        await deleteRoom(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── checkAvailability ────────────────────────────────────────────────────────

describe('checkAvailability', () => {
    it('devuelve habitaciones disponibles', async () => {
        const rooms = [{ id: 1 }];
        vi.mocked(roomService.getAvailableRooms).mockResolvedValue(rooms as any);

        const req = mockReq({ query: { checkIn: '2026-04-01', checkOut: '2026-04-05' } });
        const res = mockRes();

        await checkAvailability(req, res);

        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: rooms });
    });

    it('devuelve 400 si faltan fechas requeridas', async () => {
        const req = mockReq({ query: {} });
        const res = mockRes();

        await checkAvailability(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});
