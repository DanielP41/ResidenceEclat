import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

vi.mock('next/image', () => ({
    default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

vi.mock('framer-motion', () => ({
    motion: new Proxy({} as any, {
        get: (_t, tag: string) =>
            ({ children, ...rest }: any) => React.createElement(tag, rest, children),
    }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/components/Icons', () => ({
    WhatsAppIcon: ({ size }: { size: number }) => <svg aria-label="WhatsApp" width={size} />,
}));

vi.mock('@/context/LanguageContext', () => ({
    useLanguage: () => ({
        t: {
            room: {
                status: {
                    available:   'Disponible',
                    partial_1:   '1 Cama Disponible',
                    partial_2:   '2 Camas Disponibles',
                    partial_3:   '3 Camas Disponibles',
                    occupied:    'Ocupada',
                    reserved:    'Reservada',
                    maintenance: 'Mantenimiento',
                },
                inquiry_subject: 'Consulta habitación',
                wa_message:      'Hola, consulto sobre',
                consult_next:    'Consultar próxima disponibilidad',
                out_of_service:  'Habitación fuera de servicio',
                room_names:      {},
            },
            common: {
                consult_availability: 'Consultar disponibilidad mediante',
            },
        },
    }),
}));

const baseRoom = {
    id: 1,
    name:      'Habitación 101',
    price:     '5000',
    capacity:  2,
    status:    'AVAILABLE' as const,
    amenities: ['WiFi', 'Aire acondicionado'],
    images:    ['https://example.com/room.jpg'],
};

// ─── RoomCard ─────────────────────────────────────────────────────────────────

describe('RoomCard', () => {
    it('muestra el nombre de la habitación', () => {
        render(<RoomCard room={baseRoom} />);
        expect(screen.getByText('Habitación 101')).toBeInTheDocument();
    });

    it('usa imagen por defecto cuando no se proveen imágenes', () => {
        render(<RoomCard room={{ ...baseRoom, images: [] }} />);
        const imgs = screen.getAllByRole('img');
        expect(imgs.some(i => i.getAttribute('src')?.includes('unsplash.com'))).toBe(true);
    });

    it('usa la primera imagen del array cuando se provee', () => {
        render(<RoomCard room={baseRoom} />);
        const imgs = screen.getAllByRole('img');
        expect(imgs.some(i => i.getAttribute('src') === 'https://example.com/room.jpg')).toBe(true);
    });

    // ─── Status badges ────────────────────────────────────────────────────

    it.each([
        ['AVAILABLE',    'Disponible'],
        ['PARTIAL_1',    '1 Cama Disponible'],
        ['PARTIAL_2',    '2 Camas Disponibles'],
        ['PARTIAL_3',    '3 Camas Disponibles'],
        ['OCCUPIED',     'Ocupada'],
        ['RESERVED',     'Reservada'],
        ['MAINTENANCE',  'Mantenimiento'],
    ] as const)('muestra el badge "%s" → "%s"', (status, label) => {
        render(<RoomCard room={{ ...baseRoom, status }} />);
        expect(screen.getByText(label)).toBeInTheDocument();
    });

    // ─── Links de contacto ────────────────────────────────────────────────

    it('renderiza los tres links de contacto (Gmail, IG, WA)', () => {
        render(<RoomCard room={baseRoom} />);
        expect(screen.getByText('Gmail')).toBeInTheDocument();
        expect(screen.getByText('IG')).toBeInTheDocument();
        expect(screen.getByText('WA')).toBeInTheDocument();
    });

    it('el link de Gmail apunta a mailto con el nombre de la habitación', () => {
        render(<RoomCard room={baseRoom} />);
        const gmailLink = screen.getByText('Gmail').closest('a')!;
        expect(gmailLink.getAttribute('href')).toContain('mailto:');
        expect(gmailLink.getAttribute('href')).toContain('Habitaci');
    });

    it('el link de WhatsApp incluye el número correcto', () => {
        render(<RoomCard room={baseRoom} />);
        const waLink = screen.getByText('WA').closest('a')!;
        expect(waLink.getAttribute('href')).toContain('wa.me/5491135877019');
    });

    // ─── Lightbox ─────────────────────────────────────────────────────────

    it('abre el lightbox al hacer clic en la imagen', async () => {
        const user = userEvent.setup();
        const { container } = render(<RoomCard room={baseRoom} />);

        const imageWrapper = container.querySelector('.cursor-pointer')!;
        await user.click(imageWrapper);

        // After click the lightbox overlay should be present
        expect(container.querySelector('.fixed.inset-0')).toBeTruthy();
    });

    it('cierra el lightbox al hacer clic en el botón X', async () => {
        const user = userEvent.setup();
        const { container } = render(<RoomCard room={baseRoom} />);

        await user.click(container.querySelector('.cursor-pointer')!);
        const closeBtn = container.querySelector('.fixed.inset-0 button')!;
        await user.click(closeBtn);

        expect(container.querySelector('.fixed.inset-0')).toBeNull();
    });
});

import RoomCard from '@/components/RoomCard';
