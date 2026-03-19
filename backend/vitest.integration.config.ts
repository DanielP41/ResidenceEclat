import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        // Solo corre archivos de integración
        include: ['src/__tests__/integration/**/*.integration.test.ts'],
        // Sin mocks globales — necesitamos la DB real
        globals: true,
        // Timeout mayor para operaciones de DB
        testTimeout: 30000,
        hookTimeout: 30000,
        // Un solo hilo: los tests de concurrencia deben correr secuencialmente
        // para no interferir entre sí (cada beforeEach limpia la DB)
        pool: 'forks',
        poolOptions: {
            forks: { singleFork: true },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
