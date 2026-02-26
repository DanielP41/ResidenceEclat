import { prisma } from '../config/database';
import { CreateBookingSchema, UpdateBookingSchema } from '../utils/validators';
import { z } from 'zod';
import { checkAvailability } from './rooms.service';
import { sendBookingConfirmation } from './email.service';
import { createAuditLog } from './audit.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export const createBooking = async (data: z.infer<typeof CreateBookingSchema>) => {
    // 1. Verificar disponibilidad de nuevo (prevención de condiciones de carrera)
    const isAvailable = await checkAvailability(data.roomId, data.checkIn, data.checkOut);
    if (!isAvailable) {
        throw new Error('La habitación ya no está disponible para las fechas seleccionadas');
    }

    // 2. Obtener o crear huésped
    const guest = await prisma.guest.upsert({
        where: { email: data.guest.email },
        update: {
            name: data.guest.name,
            phone: data.guest.phone,
            documentType: data.guest.documentType,
            documentNumber: data.guest.documentNumber,
        },
        create: {
            email: data.guest.email,
            name: data.guest.name,
            phone: data.guest.phone,
            documentType: data.guest.documentType,
            documentNumber: data.guest.documentNumber,
        },
    });

    // 3. Obtener habitación para el precio
    const room = await prisma.room.findUnique({ where: { id: data.roomId } });
    if (!room) throw new Error('Habitación no encontrada');

    // 4. Calcular noches y precio total
    const start = new Date(data.checkIn);
    const end = new Date(data.checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalPrice = Number(room.price) * diffDays;

    // 5. Crear reserva
    const booking = await prisma.booking.create({
        data: {
            roomId: data.roomId,
            guestId: guest.id,
            checkIn: start,
            checkOut: end,
            totalNights: diffDays,
            totalPrice: totalPrice,
            acceptedTerms: data.acceptedTerms,
            status: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
        },
        include: {
            room: true,
            guest: true,
        },
    });

    // 6. Enviar confirmación (simulada)
    await sendBookingConfirmation(guest.email, {
        id: booking.id,
        guestName: guest.name,
        roomName: room.name,
        checkIn: data.checkIn,
        checkOut: data.checkOut,
    });

    return booking;
};

export const getBookings = async (filters: { status?: BookingStatus; roomId?: number }) => {
    return await prisma.booking.findMany({
        where: {
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.roomId ? { roomId: filters.roomId } : {}),
        },
        include: {
            room: true,
            guest: true,
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getBookingById = async (id: number) => {
    return await prisma.booking.findUnique({
        where: { id },
        include: {
            room: true,
            guest: true,
            cancelledBy: { select: { id: true, name: true } },
        },
    });
};

export const updateBooking = async (
    id: number,
    data: z.infer<typeof UpdateBookingSchema>,
    userId: number
) => {
    const oldBooking = await prisma.booking.findUnique({ where: { id } });
    if (!oldBooking) throw new Error('Reserva no encontrada');

    const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
            ...data,
            ...(data.status === BookingStatus.CANCELLED
                ? { cancelledAt: new Date(), cancelledById: userId }
                : {}),
            ...(data.status === BookingStatus.CHECKED_IN ? { checkedInAt: new Date() } : {}),
            ...(data.status === BookingStatus.CHECKED_OUT ? { checkedOutAt: new Date() } : {}),
        },
        include: {
            room: true,
            guest: true,
        },
    });

    await createAuditLog({
        userId,
        action: 'UPDATE_BOOKING',
        entityType: 'BOOKING',
        entityId: id,
        oldValues: oldBooking,
        newValues: updatedBooking,
    });

    return updatedBooking;
};
