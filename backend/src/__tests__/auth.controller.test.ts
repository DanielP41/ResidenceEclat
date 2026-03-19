import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../config/database', () => ({
    prisma: {
        user: { findUnique: vi.fn(), update: vi.fn() },
    },
}));

vi.mock('bcryptjs', () => ({
    default: { compare: vi.fn() },
    compare: vi.fn(),
}));

vi.mock('../utils/jwt.util', () => ({
    generateAccessToken: vi.fn().mockReturnValue('access-token-mock'),
    generateRefreshToken: vi.fn().mockReturnValue('refresh-token-mock'),
    verifyRefreshToken: vi.fn(),
}));

import { login, refreshToken, logout } from '../controllers/auth.controller';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';

const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.cookie = vi.fn().mockReturnValue(res);
    res.clearCookie = vi.fn().mockReturnValue(res);
    return res;
};

const mockReq = (overrides: any = {}): any => ({
    body: {},
    params: {},
    query: {},
    ...overrides,
});

const mockUser = {
    id: 1,
    email: 'admin@eclat.com',
    name: 'Admin',
    password: 'hashed_password',
    role: 'ADMIN' as const,
    isActive: true,
    tokenVersion: 0,
};

beforeEach(() => vi.clearAllMocks());

// ─── login ────────────────────────────────────────────────────────────────────

describe('login', () => {
    it('devuelve tokens como cookies y datos del usuario con credenciales válidas', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

        const req = mockReq({ body: { email: 'admin@eclat.com', password: 'password123' } });
        const res = mockRes();

        await login(req, res);

        expect(res.cookie).toHaveBeenCalledWith('accessToken', 'access-token-mock', expect.any(Object));
        expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token-mock', expect.any(Object));
        expect(res.json).toHaveBeenCalledWith({
            status: 'success',
            data: { user: expect.objectContaining({ email: 'admin@eclat.com' }) },
        });
    });

    it('devuelve 401 si el usuario no existe', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

        const req = mockReq({ body: { email: 'noexiste@eclat.com', password: '123' } });
        const res = mockRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ status: 'error', message: 'Credenciales inválidas' })
        );
    });

    it('devuelve 401 si la contraseña es incorrecta', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);
        vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

        const req = mockReq({ body: { email: 'admin@eclat.com', password: 'wrongpass' } });
        const res = mockRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('devuelve 401 si la cuenta está desactivada (sin revelar que existe)', async () => {
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, isActive: false } as any);
        vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

        const req = mockReq({ body: { email: 'admin@eclat.com', password: 'password123' } });
        const res = mockRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Credenciales inválidas' })
        );
    });

    it('devuelve 500 si prisma falla', async () => {
        vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ body: { email: 'admin@eclat.com', password: '123' } });
        const res = mockRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─── refreshToken ─────────────────────────────────────────────────────────────

describe('refreshToken', () => {
    it('devuelve 400 si no se provee refresh token', async () => {
        const req = mockReq({ body: {} });
        const res = mockRes();

        await refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Refresh token requerido' })
        );
    });

    it('rota tokens via cookies con refresh token válido', async () => {
        vi.mocked(verifyRefreshToken).mockReturnValue({ userId: 1, email: 'admin@eclat.com', role: 'ADMIN' as any, tokenVersion: 0 });
        vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

        const req = mockReq({ body: { refreshToken: 'valid-refresh-token' } });
        const res = mockRes();

        await refreshToken(req, res);

        expect(res.cookie).toHaveBeenCalledWith('accessToken', 'access-token-mock', expect.any(Object));
        expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token-mock', expect.any(Object));
        expect(res.json).toHaveBeenCalledWith({ status: 'success' });
    });

    it('devuelve 401 si el token es inválido', async () => {
        vi.mocked(verifyRefreshToken).mockImplementation(() => { throw new Error('jwt expired'); });

        const req = mockReq({ body: { refreshToken: 'invalid-token' } });
        const res = mockRes();

        await refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Token inválido o expirado' })
        );
    });

    it('devuelve 401 si el usuario está desactivado', async () => {
        vi.mocked(verifyRefreshToken).mockReturnValue({ userId: 1, email: 'admin@eclat.com', role: 'ADMIN' as any, tokenVersion: 0 });
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, isActive: false } as any);

        const req = mockReq({ body: { refreshToken: 'valid-token' } });
        const res = mockRes();

        await refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Sesión inválida' })
        );
    });

    it('devuelve 401 si el tokenVersion no coincide (sesión invalidada por logout)', async () => {
        vi.mocked(verifyRefreshToken).mockReturnValue({ userId: 1, email: 'admin@eclat.com', role: 'ADMIN' as any, tokenVersion: 0 });
        vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, tokenVersion: 1 } as any); // version bumped after logout

        const req = mockReq({ body: { refreshToken: 'old-token' } });
        const res = mockRes();

        await refreshToken(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Sesión inválida' })
        );
    });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe('logout', () => {
    it('incrementa tokenVersion y devuelve success', async () => {
        vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, tokenVersion: 1 } as any);

        const req = mockReq({ user: { userId: 1, email: 'admin@eclat.com', role: 'ADMIN' } });
        const res = mockRes();

        await logout(req, res);

        expect(prisma.user.update).toHaveBeenCalledWith({
            where: { id: 1 },
            data: { tokenVersion: { increment: 1 } },
        });
        expect(res.json).toHaveBeenCalledWith({ status: 'success', message: 'Sesión cerrada' });
    });

    it('devuelve 500 si prisma falla', async () => {
        vi.mocked(prisma.user.update).mockRejectedValue(new Error('DB error'));

        const req = mockReq({ user: { userId: 1, email: 'admin@eclat.com', role: 'ADMIN' } });
        const res = mockRes();

        await logout(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
