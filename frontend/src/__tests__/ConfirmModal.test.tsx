import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

const defaultProps = {
    title: 'Eliminar habitación',
    message: '¿Estás seguro de que deseas eliminar esta habitación?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
};

beforeEach(() => vi.clearAllMocks());

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

describe('ConfirmModal', () => {
    it('renderiza el título y el mensaje', () => {
        render(<ConfirmModal {...defaultProps} />);

        expect(screen.getByText('Eliminar habitación')).toBeInTheDocument();
        expect(screen.getByText('¿Estás seguro de que deseas eliminar esta habitación?')).toBeInTheDocument();
    });

    it('usa "Eliminar" como confirmLabel por defecto', () => {
        render(<ConfirmModal {...defaultProps} />);

        expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
    });

    it('renderiza un confirmLabel personalizado', () => {
        render(<ConfirmModal {...defaultProps} confirmLabel="Borrar sede" />);

        expect(screen.getByRole('button', { name: /borrar sede/i })).toBeInTheDocument();
    });

    it('llama onConfirm al hacer clic en el botón de confirmación', async () => {
        const user = userEvent.setup();
        render(<ConfirmModal {...defaultProps} />);

        await user.click(screen.getByRole('button', { name: /eliminar/i }));

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
        expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });

    it('llama onCancel al hacer clic en "Cancelar"', async () => {
        const user = userEvent.setup();
        render(<ConfirmModal {...defaultProps} />);

        await user.click(screen.getByRole('button', { name: /cancelar/i }));

        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
        expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });

    it('llama onCancel al hacer clic en el botón X de cierre', async () => {
        const user = userEvent.setup();
        render(<ConfirmModal {...defaultProps} />);

        // El primer botón del modal es el X (cierre en el header)
        const buttons = screen.getAllByRole('button');
        await user.click(buttons[0]);

        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });
});
