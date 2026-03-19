import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/database', () => ({
    prisma: {
        room: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
    },
}));

vi.mock('../config/logger', () => ({
    default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { getOccupancyStats } from '../controllers/stats.controller';
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

// Helper: configura los mocks de count en el orden en que el controller los llama
function setupCountMocks(total: number, occupied: number, partial: number, reserved: number, maintenance: number) {
    vi.mocked(prisma.room.count)
        .mockResolvedValueOnce(total)      // totalRoomsCount
        .mockResolvedValueOnce(occupied)   // occupiedCount
        .mockResolvedValueOnce(partial)    // partialCount
        .mockResolvedValueOnce(reserved)   // reservedCount
        .mockResolvedValueOnce(maintenance); // maintenanceCount
}

beforeEach(() => vi.clearAllMocks());

// ─── getOccupancyStats ────────────────────────────────────────────────────────

describe('getOccupancyStats', () => {
    it('devuelve estadísticas de ocupación correctas', async () => {
        setupCountMocks(10, 3, 2, 1, 1);
        vi.mocked(prisma.room.findMany).mockResolvedValue([
            { status: 'OCCUPIED', capacity: 2 },
            { status: 'PARTIAL_1', capacity: 4 },
            { status: 'AVAILABLE', capacity: 2 },
        ] as any);

        const req = mockReq({ query: {} });
        const res = mockRes();

        await getOccupancyStats(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                status: 'success',
                data: expect.objectContaining({
                    total: 10,
                    occupied: 3,
                    partial: 2,
                    reserved: 1,
                    maintenance: 1,
                    vacant: 3, // 10 - 3 - 1 - 2 - 1 = 3
                }),
            })
        );
    });

    it('calcula vacant como 0 cuando la suma supera el total', async () => {
        setupCountMocks(5, 3, 1, 1, 1); // suma = 6 > 5
        vi.mocked(prisma.room.findMany).mockResolvedValue([]);

        const req = mockReq({ query: {} });
        const res = mockRes();

        await getOccupancyStats(req, res);

        const call = vi.mocked(res.json).mock.calls[0][0];
        expect(call.data.vacant).toBe(0); // Math.max(0, ...)
    });

    it('filtra por residenceId si se provee', async () => {
        setupCountMocks(4, 2, 0, 1, 0);
        vi.mocked(prisma.room.findMany).mockResolvedValue([]);

        const req = mockReq({ query: { residenceId: '2' } });
        const res = mockRes();

        await getOccupancyStats(req, res);

        expect(prisma.room.count).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ residenceId: 2 }),
            })
        );
    });

    it('calcula porcentajes a 0 si no hay habitaciones', async () => {
        setupCountMocks(0, 0, 0, 0, 0);
        vi.mocked(prisma.room.findMany).mockResolvedValue([]);

        const req = mockReq({ query: {} });
        const res = mockRes();

        await getOccupancyStats(req, res);

        const call = vi.mocked(res.json).mock.calls[0][0];
        expect(call.data.percentages.occupied).toBe(0);
        expect(call.data.percentages.vacant).toBe(0);
    });

    it('devuelve 500 si prisma falla', async () => {
        vi.mocked(prisma.room.count).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ query: {} });
        const res = mockRes();

        await getOccupancyStats(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
