import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

vi.mock('@/lib/api', () => ({
    bookingsApi: { create: vi.fn() },
}));

import BookingForm from '@/components/BookingForm';
import { bookingsApi } from '@/lib/api';

// ─── Date helpers ─────────────────────────────────────────────────────────────

// Use local date parts to avoid UTC-offset shifting (e.g. UTC-3 after 9pm)
const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const today      = new Date();
const yesterday  = new Date(today); yesterday.setDate(today.getDate() - 1);
const tomorrow   = new Date(today); tomorrow.setDate(today.getDate() + 1);
const in2Days    = new Date(today); in2Days.setDate(today.getDate() + 2);

const defaultProps = { roomId: 1, roomName: 'Habitación 101', price: 5000 };

// Fill all required text/email fields so only dates determine validity
const fillBasicFields = async (container: HTMLElement) => {
    const user = userEvent.setup();
    const [nameInput] = screen.getAllByRole('textbox');
    const emailInput  = container.querySelector('input[type="email"]')!;
    await user.type(nameInput, 'Ana García');
    await user.type(emailInput, 'ana@test.com');
    return user;
};

beforeEach(() => vi.clearAllMocks());

// ─── BookingForm ───────────────────────────────────────────────────────────────

describe('BookingForm', () => {
    it('renderiza el encabezado con el nombre de la habitación', () => {
        render(<BookingForm {...defaultProps} />);
        expect(screen.getByText(/Solicitar Reserva: Habitación 101/i)).toBeInTheDocument();
    });

    it('muestra el botón de envío deshabilitado durante la carga', async () => {
        vi.mocked(bookingsApi.create).mockResolvedValue({ status: 'success' });
        const { container } = render(<BookingForm {...defaultProps} />);
        const user = await fillBasicFields(container);

        const [checkIn, checkOut] = container.querySelectorAll('input[type="date"]');
        fireEvent.change(checkIn,  { target: { value: fmt(tomorrow) } });
        fireEvent.change(checkOut, { target: { value: fmt(in2Days)  } });
        await user.click(screen.getByRole('checkbox'));

        const btn = screen.getByRole('button', { name: /confirmar solicitud/i });
        await user.click(btn);

        // Button should be disabled while awaiting the API
        expect(btn).toBeDisabled();
    });

    // ─── Validación de fechas ───────────────────────────────────────────────

    it('rechaza check-in en el pasado y no llama a la API', async () => {
        const { container } = render(<BookingForm {...defaultProps} />);
        const user = await fillBasicFields(container);

        const [checkIn, checkOut] = container.querySelectorAll('input[type="date"]');
        fireEvent.change(checkIn,  { target: { value: fmt(yesterday) } });
        fireEvent.change(checkOut, { target: { value: fmt(tomorrow)  } });

        await user.click(screen.getByRole('button', { name: /confirmar solicitud/i }));

        expect(await screen.findByText('El check-in no puede ser en el pasado')).toBeInTheDocument();
        expect(bookingsApi.create).not.toHaveBeenCalled();
    });

    it('marca el campo check-in con borde de error cuando hay error', async () => {
        const { container } = render(<BookingForm {...defaultProps} />);
        const user = await fillBasicFields(container);

        const [checkIn, checkOut] = container.querySelectorAll('input[type="date"]');
        fireEvent.change(checkIn,  { target: { value: fmt(yesterday) } });
        fireEvent.change(checkOut, { target: { value: fmt(tomorrow)  } });
        await user.click(screen.getByRole('button', { name: /confirmar solicitud/i }));

        await screen.findByText('El check-in no puede ser en el pasado');
        expect(checkIn.className).toContain('border-red-500');
    });

    it('rechaza check-out igual al check-in', async () => {
        const { container } = render(<BookingForm {...defaultProps} />);
        const user = await fillBasicFields(container);

        const [checkIn, checkOut] = container.querySelectorAll('input[type="date"]');
        fireEvent.change(checkIn,  { target: { value: fmt(tomorrow) } });
        fireEvent.change(checkOut, { target: { value: fmt(tomorrow) } });

        await user.click(screen.getByRole('button', { name: /confirmar solicitud/i }));

        expect(await screen.findByText('El check-out debe ser posterior al check-in')).toBeInTheDocument();
        expect(bookingsApi.create).not.toHaveBeenCalled();
    });

    it('rechaza check-out anterior al check-in', async () => {
        const { container } = render(<BookingForm {...defaultProps} />);
        const user = await fillBasicFields(container);

        const [checkIn, checkOut] = container.querySelectorAll('input[type="date"]');
        fireEvent.change(checkIn,  { target: { value: fmt(in2Days)  } });
        fireEvent.change(checkOut, { target: { value: fmt(tomorrow) } });

        await user.click(screen.getByRole('button', { name: /confirmar solicitud/i }));

        expect(await screen.findByText('El check-out debe ser posterior al check-in')).toBeInTheDocument();
        expect(bookingsApi.create).not.toHaveBeenCalled();
    });

    it('limpia el error de check-in al cambiar el valor', async () => {
        const { container } = render(<BookingForm {...defaultProps} />);
        const user = await fillBasicFields(container);

        const [checkIn, checkOut] = container.querySelectorAll('input[type="date"]');
        fireEvent.change(checkIn,  { target: { value: fmt(yesterday) } });
        fireEvent.change(checkOut, { target: { value: fmt(tomorrow)  } });
        await user.click(screen.getByRole('button', { name: /confirmar solicitud/i }));

        await screen.findByText('El check-in no puede ser en el pasado');

        // Fix the date — error should disappear
        fireEvent.change(checkIn, { target: { value: fmt(tomorrow) } });
        expect(screen.queryByText('El check-in no puede ser en el pasado')).not.toBeInTheDocument();
    });

    // ─── Envío exitoso ──────────────────────────────────────────────────────

    it('llama a bookingsApi.create con las fechas correctas', async () => {
        vi.mocked(bookingsApi.create).mockResolvedValue({ status: 'success' });
        const { container } = render(<BookingForm {...defaultProps} />);
        const user = await fillBasicFields(container);

        const [checkIn, checkOut] = container.querySelectorAll('input[type="date"]');
        fireEvent.change(checkIn,  { target: { value: fmt(tomorrow) } });
        fireEvent.change(checkOut, { target: { value: fmt(in2Days)  } });
        await user.click(screen.getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: /confirmar solicitud/i }));

        await waitFor(() => expect(bookingsApi.create).toHaveBeenCalledTimes(1));
        const callArg = vi.mocked(bookingsApi.create).mock.calls[0][0];
        expect(callArg.checkIn).toBe(fmt(tomorrow));
        expect(callArg.checkOut).toBe(fmt(in2Days));
        expect(callArg.roomId).toBe(1);
    });

    it('muestra el estado de éxito con el email del huésped', async () => {
        vi.mocked(bookingsApi.create).mockResolvedValue({ status: 'success' });
        const { container } = render(<BookingForm {...defaultProps} />);
        const user = await fillBasicFields(container);

        const [checkIn, checkOut] = container.querySelectorAll('input[type="date"]');
        fireEvent.change(checkIn,  { target: { value: fmt(tomorrow) } });
        fireEvent.change(checkOut, { target: { value: fmt(in2Days)  } });
        await user.click(screen.getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: /confirmar solicitud/i }));

        expect(await screen.findByText('¡Reserva Registrada!')).toBeInTheDocument();
        expect(screen.getByText(/ana@test\.com/i)).toBeInTheDocument();
    });

    // ─── Error del servidor ─────────────────────────────────────────────────

    it('muestra el mensaje de error del servidor', async () => {
        vi.mocked(bookingsApi.create).mockRejectedValue(new Error('Habitación no disponible'));
        const { container } = render(<BookingForm {...defaultProps} />);
        const user = await fillBasicFields(container);

        const [checkIn, checkOut] = container.querySelectorAll('input[type="date"]');
        fireEvent.change(checkIn,  { target: { value: fmt(tomorrow) } });
        fireEvent.change(checkOut, { target: { value: fmt(in2Days)  } });
        await user.click(screen.getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: /confirmar solicitud/i }));

        expect(await screen.findByText('Habitación no disponible')).toBeInTheDocument();
    });

    it('vuelve al estado idle y muestra "Confirmar Solicitud" tras un error', async () => {
        vi.mocked(bookingsApi.create).mockRejectedValue(new Error('Error del servidor'));
        const { container } = render(<BookingForm {...defaultProps} />);
        const user = await fillBasicFields(container);

        const [checkIn, checkOut] = container.querySelectorAll('input[type="date"]');
        fireEvent.change(checkIn,  { target: { value: fmt(tomorrow) } });
        fireEvent.change(checkOut, { target: { value: fmt(in2Days)  } });
        await user.click(screen.getByRole('checkbox'));
        await user.click(screen.getByRole('button', { name: /confirmar solicitud/i }));

        await screen.findByText('Error del servidor');
        expect(screen.getByRole('button', { name: /confirmar solicitud/i })).not.toBeDisabled();
    });
});
