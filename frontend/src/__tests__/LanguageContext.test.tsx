import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';

// Componente auxiliar para exponer el contexto en el DOM
const Consumer = () => {
    const { lang, setLang } = useLanguage();
    return (
        <div>
            <span data-testid="lang">{lang}</span>
            <button onClick={() => setLang('en')}>set-en</button>
            <button onClick={() => setLang('pt')}>set-pt</button>
        </div>
    );
};

beforeEach(() => localStorage.clear());

// ─── LanguageProvider ─────────────────────────────────────────────────────────

describe('LanguageProvider', () => {
    it('el idioma por defecto es "es"', () => {
        render(<LanguageProvider><Consumer /></LanguageProvider>);
        expect(screen.getByTestId('lang')).toHaveTextContent('es');
    });

    it('setLang cambia el idioma', async () => {
        const user = userEvent.setup();
        render(<LanguageProvider><Consumer /></LanguageProvider>);

        await user.click(screen.getByText('set-en'));

        expect(screen.getByTestId('lang')).toHaveTextContent('en');
    });

    it('guarda el idioma en localStorage al cambiar', async () => {
        const user = userEvent.setup();
        render(<LanguageProvider><Consumer /></LanguageProvider>);

        await user.click(screen.getByText('set-pt'));

        expect(localStorage.getItem('residencia-lang')).toBe('pt');
    });

    it('carga el idioma guardado en localStorage al montar', () => {
        localStorage.setItem('residencia-lang', 'en');

        render(<LanguageProvider><Consumer /></LanguageProvider>);

        expect(screen.getByTestId('lang')).toHaveTextContent('en');
    });

    it('ignora valores inválidos de localStorage', () => {
        localStorage.setItem('residencia-lang', 'fr');

        render(<LanguageProvider><Consumer /></LanguageProvider>);

        expect(screen.getByTestId('lang')).toHaveTextContent('es');
    });

    it('provee el objeto de traducciones t', () => {
        const { result } = renderHook(() => useLanguage(), {
            wrapper: LanguageProvider,
        });

        expect(result.current.t).toBeDefined();
    });
});

// ─── useLanguage ──────────────────────────────────────────────────────────────

describe('useLanguage', () => {
    it('lanza error si se usa fuera del LanguageProvider', () => {
        expect(() => renderHook(() => useLanguage())).toThrow(
            'useLanguage must be used within a LanguageProvider'
        );
    });
});
