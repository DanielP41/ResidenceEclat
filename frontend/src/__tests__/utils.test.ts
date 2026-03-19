import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn', () => {
    it('combina clases simples', () => {
        expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('ignora valores falsy', () => {
        expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar');
    });

    it('resuelve conflictos de Tailwind (la última gana)', () => {
        expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });

    it('admite clases condicionales con objeto', () => {
        expect(cn('base', { active: true, disabled: false })).toBe('base active');
    });

    it('devuelve string vacío sin argumentos', () => {
        expect(cn()).toBe('');
    });
});
