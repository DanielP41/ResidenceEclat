import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/database', () => ({
    prisma: {
        observation: {
            findUnique: vi.fn(),
            upsert: vi.fn(),
        },
    },
}));

vi.mock('../config/logger', () => ({
    default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { getObservation, upsertObservation } from '../controllers/observations.controller';
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
    ...overrides,
});

beforeEach(() => vi.clearAllMocks());

// ─── getObservation ───────────────────────────────────────────────────────────

describe('getObservation', () => {
    it('devuelve la observación cuando existe', async () => {
        const obs = { id: 1, residenceId: 2, content: 'Todo en orden' };
        vi.mocked(prisma.observation.findUnique).mockResolvedValue(obs as any);

        const req = mockReq({ params: { residenceId: '2' } });
        const res = mockRes();

        await getObservation(req, res);

        expect(prisma.observation.findUnique).toHaveBeenCalledWith({ where: { residenceId: 2 } });
        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: obs });
    });

    it('devuelve null si no hay observación para esa sede', async () => {
        vi.mocked(prisma.observation.findUnique).mockResolvedValue(null);

        const req = mockReq({ params: { residenceId: '99' } });
        const res = mockRes();

        await getObservation(req, res);

        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: null });
    });

    it('devuelve 500 si prisma falla', async () => {
        vi.mocked(prisma.observation.findUnique).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ params: { residenceId: '1' } });
        const res = mockRes();

        await getObservation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── upsertObservation ────────────────────────────────────────────────────────

describe('upsertObservation', () => {
    it('crea o actualiza la observación y la devuelve', async () => {
        const obs = { id: 1, residenceId: 2, content: 'Revisión pendiente' };
        vi.mocked(prisma.observation.upsert).mockResolvedValue(obs as any);

        const req = mockReq({ params: { residenceId: '2' }, body: { content: 'Revisión pendiente' } });
        const res = mockRes();

        await upsertObservation(req, res);

        expect(prisma.observation.upsert).toHaveBeenCalledWith({
            where: { residenceId: 2 },
            update: { content: 'Revisión pendiente' },
            create: { residenceId: 2, content: 'Revisión pendiente' },
        });
        expect(res.json).toHaveBeenCalledWith({ status: 'success', data: obs });
    });

    it('devuelve 500 si prisma falla', async () => {
        vi.mocked(prisma.observation.upsert).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ params: { residenceId: '1' }, body: { content: 'test' } });
        const res = mockRes();

        await upsertObservation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
