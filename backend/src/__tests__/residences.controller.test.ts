import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/database', () => ({
    prisma: {
        residence: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}));

vi.mock('../config/logger', () => ({
    default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import {
    getAllResidences,
    getResidenceById,
    createResidence,
    updateResidence,
    deleteResidence,
} from '../controllers/residences.controller';
import { prisma } from '../config/database';

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

const mockResidence = { id: 1, name: 'San Telmo', address: 'Defensa 123', description: 'Sede principal', images: [] };

beforeEach(() => vi.clearAllMocks());

// ─── getAllResidences ─────────────────────────────────────────────────────────

describe('getAllResidences', () => {
    it('devuelve todas las sedes', async () => {
        vi.mocked(prisma.residence.findMany).mockResolvedValue([mockResidence] as any);

        const req = mockReq();
        const res = mockRes();

        await getAllResidences(req, res);

        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: [mockResidence] });
    });

    it('devuelve 500 si prisma falla', async () => {
        vi.mocked(prisma.residence.findMany).mockRejectedValue(new Error('DB error'));

        const req = mockReq();
        const res = mockRes();

        await getAllResidences(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── getResidenceById ─────────────────────────────────────────────────────────

describe('getResidenceById', () => {
    it('devuelve la sede cuando existe', async () => {
        vi.mocked(prisma.residence.findUnique).mockResolvedValue(mockResidence as any);

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await getResidenceById(req, res);

        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: mockResidence });
    });

    it('devuelve 404 si la sede no existe', async () => {
        vi.mocked(prisma.residence.findUnique).mockResolvedValue(null);

        const req = mockReq({ params: { id: '99' } });
        const res = mockRes();

        await getResidenceById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Sede no encontrada' })
        );
    });

    it('devuelve 500 si prisma falla', async () => {
        vi.mocked(prisma.residence.findUnique).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await getResidenceById(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── createResidence ──────────────────────────────────────────────────────────

describe('createResidence', () => {
    it('devuelve 201 con la sede creada', async () => {
        vi.mocked(prisma.residence.create).mockResolvedValue(mockResidence as any);

        const req = mockReq({ body: { name: 'San Telmo', address: 'Defensa 123', description: 'Sede', images: [] } });
        const res = mockRes();

        await createResidence(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: mockResidence });
    });

    it('devuelve 500 si prisma falla', async () => {
        vi.mocked(prisma.residence.create).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ body: { name: 'Sede Test' } });
        const res = mockRes();

        await createResidence(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('devuelve 400 si el body es inválido', async () => {
        const req = mockReq({ body: {} });
        const res = mockRes();

        await createResidence(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});

// ─── updateResidence ──────────────────────────────────────────────────────────

describe('updateResidence', () => {
    it('devuelve la sede actualizada', async () => {
        const updated = { ...mockResidence, name: 'San Telmo Actualizada' };
        vi.mocked(prisma.residence.update).mockResolvedValue(updated as any);

        const req = mockReq({ params: { id: '1' }, body: { name: 'San Telmo Actualizada' } });
        const res = mockRes();

        await updateResidence(req, res);

        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: updated });
    });

    it('devuelve 500 si prisma falla', async () => {
        vi.mocked(prisma.residence.update).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ params: { id: '1' }, body: {} });
        const res = mockRes();

        await updateResidence(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── deleteResidence ──────────────────────────────────────────────────────────

describe('deleteResidence', () => {
    it('devuelve mensaje de éxito al eliminar', async () => {
        vi.mocked(prisma.residence.delete).mockResolvedValue(mockResidence as any);

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await deleteResidence(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'success' })
        );
    });

    it('devuelve 500 si prisma falla', async () => {
        vi.mocked(prisma.residence.delete).mockRejectedValue(new Error('Foreign key constraint'));

        const req = mockReq({ params: { id: '1' } });
        const res = mockRes();

        await deleteResidence(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
