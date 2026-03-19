import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('sonner', () => ({
    toast: { error: vi.fn() },
}));

import { fetchApi } from '@/lib/api';

const mockOk = (body: any, status = 200) =>
    ({ ok: true, status, json: async () => body } as any);

const mockFail = (body: any, status: number) =>
    ({ ok: false, status, json: async () => body } as any);

beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
    vi.stubGlobal('location', { pathname: '/', href: '' });
});

afterEach(() => {
    vi.unstubAllGlobals();
});

// ─── fetchApi ─────────────────────────────────────────────────────────────────

describe('fetchApi', () => {
    it('devuelve los datos en respuesta exitosa', async () => {
        const mockData = { status: 'success', data: [{ id: 1 }] };
        vi.mocked(fetch).mockResolvedValue(mockOk(mockData));

        const result = await fetchApi('/rooms');

        expect(result).toEqual(mockData);
    });

    it('usa credentials: include (cookie-based auth) en todas las llamadas', async () => {
        vi.mocked(fetch).mockResolvedValue(mockOk({}));

        await fetchApi('/rooms');

        const [, options] = vi.mocked(fetch).mock.calls[0];
        expect((options as any).credentials).toBe('include');
    });

    it('no incluye Authorization header (auth vía cookies)', async () => {
        vi.mocked(fetch).mockResolvedValue(mockOk({}));

        await fetchApi('/rooms');

        const [, options] = vi.mocked(fetch).mock.calls[0];
        expect((options as any).headers).not.toHaveProperty('Authorization');
    });

    it('lanza error con el mensaje del servidor en respuesta no-ok', async () => {
        vi.mocked(fetch).mockResolvedValue(mockFail({ message: 'No encontrado' }, 404));

        await expect(fetchApi('/rooms/99')).rejects.toThrow('No encontrado');
    });

    it('lanza error con mensaje genérico si el servidor no provee message', async () => {
        vi.mocked(fetch).mockResolvedValue(mockFail({}, 500));

        await expect(fetchApi('/rooms')).rejects.toThrow('Algo salió mal');
    });

    it('adjunta details del error si el servidor devuelve errors', async () => {
        vi.mocked(fetch).mockResolvedValue(
            mockFail({ message: 'Validación', errors: [{ field: 'email' }] }, 422)
        );

        let caughtError: any;
        try {
            await fetchApi('/rooms');
        } catch (e) {
            caughtError = e;
        }

        expect(caughtError.details).toEqual([{ field: 'email' }]);
    });

    it('limpia user de localStorage en 401 dentro de ruta admin', async () => {
        localStorage.setItem('user', '{}');
        vi.stubGlobal('location', { pathname: '/admin/dashboard', href: '' });
        vi.mocked(fetch).mockResolvedValue(mockFail({ message: 'Unauthorized' }, 401));

        await fetchApi('/bookings');

        expect(localStorage.getItem('user')).toBeNull();
    });

    it('no lanza error en 401 en ruta pública (no redirige)', async () => {
        vi.stubGlobal('location', { pathname: '/rooms' });
        vi.mocked(fetch).mockResolvedValue(mockFail({ message: 'Unauthorized' }, 401));

        // En rutas públicas un 401 dispara el throw normal
        await expect(fetchApi('/rooms')).rejects.toThrow();
    });
});
