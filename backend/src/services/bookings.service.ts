import { prisma } from '../config/database';
import { CreateBookingSchema, UpdateBookingSchema } from '../utils/validators';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';
import { z } from 'zod';
import { checkAvailability } from './rooms.service';
import { sendBookingConfirmation, sendBookingCancellation } from './email.service';
import { createAuditLog } from './audit.service';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import logger from '../config/logger';

export const createBooking = async (data: z.infer<typeof CreateBookingSchema>) => {
    try {
    return await prisma.$transaction(async (tx) => {
        // 1. Bloquear el row de la habitación para serializar reservas concurrentes.
        //    Cualquier otra transacción que intente reservar la misma habitación
        //    esperará aquí hasta que ésta haga commit o rollback.
        await tx.$queryRaw`SELECT id FROM rooms WHERE id = ${data.roomId} FOR UPDATE`;

        // 2. Verificar disponibilidad de nuevo (DENTRO de la transacción para bloquear el registro)
        const isAvailable = await checkAvailabilityTx(tx, data.roomId, data.checkIn, data.checkOut);
        if (!isAvailable) {
            throw new ConflictError('La habitación ya no está disponible para las fechas seleccionadas', 'ROOM_NOT_AVAILABLE');
        }

        // 2. Obtener o crear huésped
        const guest = await tx.guest.upsert({
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
        const room = await tx.room.findFirst({ where: { id: data.roomId, isDeleted: false } });
        if (!room) throw new NotFoundError('Habitación no encontrada', 'ROOM_NOT_FOUND');

        // 4. Calcular noches y precio total de forma robusta
        // Usamos Date.UTC para evitar problemas de desfase horario sin importar dónde esté el hosting
        const start = new Date(data.checkIn);
        const end = new Date(data.checkOut);

        const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
        const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

        const diffDays = Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
            throw new BadRequestError('La fecha de salida debe ser posterior a la de entrada');
        }

        const totalPrice = Number(room.price) * diffDays;

        // 5. Crear reserva
        const booking = await tx.booking.create({
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
                room: { include: { residence: true } },
                guest: true,
            },
        });

        // 6. Enviar confirmación por email (intentamos enviarlo pero no bloqueamos la reserva)
        try {
            await sendBookingConfirmation({
                id: booking.id,
                guestName: guest.name,
                guestEmail: guest.email,
                roomName: room.name,
                residenceName: booking.room.residence.name,
                checkIn: data.checkIn,
                checkOut: data.checkOut,
                totalNights: diffDays,
                totalPrice: totalPrice,
            });
        } catch (emailError) {
            logger.error('Error enviando email de confirmación', { error: emailError });
            // No fallamos la transacción por un error de email
        }

        return booking;
    }, {
        maxWait: 10000, // 10s para adquirir conexión del pool
        timeout: 15000, // 15s máximo para la transacción completa
    });
    } catch (error: any) {
        // P2034: deadlock / conflict de serialización → tratar como ConflictError
        // P2028: timeout esperando lock (mismo efecto: la reserva no pudo concretarse)
        if (error?.code === 'P2034' || error?.code === 'P2028') {
            throw new ConflictError(
                'La habitación ya no está disponible para las fechas seleccionadas',
                'ROOM_NOT_AVAILABLE'
            );
        }
        throw error;
    }
};

// Función auxiliar para checkAvailability dentro de una transacción
async function checkAvailabilityTx(tx: any, roomId: number, checkIn: string, checkOut: string) {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const overlappingBookings = await tx.booking.findFirst({
        where: {
            roomId,
            status: { not: 'CANCELLED' },
            OR: [
                {
                    checkIn: { lte: checkInDate },
                    checkOut: { gt: checkInDate },
                },
                {
                    checkIn: { lt: checkOutDate },
                    checkOut: { gte: checkOutDate },
                },
                {
                    checkIn: { gte: checkInDate },
                    checkOut: { lte: checkOutDate },
                },
            ],
        },
    });

    return !overlappingBookings;
}

export const getBookings = async (filters: { status?: BookingStatus; roomId?: number; page?: number; limit?: number }) => {
    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 50;
    const skip  = (page - 1) * limit;

    const where = {
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.roomId ? { roomId: filters.roomId } : {}),
    };

    const [items, total] = await prisma.$transaction([
        prisma.booking.findMany({
            where,
            include: { room: { include: { residence: true } }, guest: true },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.booking.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

export const getBookingById = async (id: number) => {
    return await prisma.booking.findUnique({
        where: { id },
        include: {
            room: { include: { residence: true } },
            guest: true,
            cancelledBy: { select: { id: true, name: true } },
        },
    });

};

export const checkInBooking = async (id: number, userId: number, ipAddress?: string) => {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundError('Reserva no encontrada', 'BOOKING_NOT_FOUND');

    if (booking.status !== BookingStatus.CONFIRMED) {
        throw new BadRequestError(
            `No se puede hacer check-in: la reserva está en estado ${booking.status}. Se requiere CONFIRMED.`,
            'INVALID_STATUS_TRANSITION'
        );
    }

    const updated = await prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.CHECKED_IN, checkedInAt: new Date() },
        include: { room: { include: { residence: true } }, guest: true },
    });

    await createAuditLog({
        userId,
        action: 'CHECK_IN',
        entityType: 'BOOKING',
        entityId: id,
        oldValues: { status: booking.status },
        newValues: { status: updated.status, checkedInAt: updated.checkedInAt },
        ipAddress,
    });

    return updated;
};

export const checkOutBooking = async (id: number, userId: number, ipAddress?: string) => {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundError('Reserva no encontrada', 'BOOKING_NOT_FOUND');

    if (booking.status !== BookingStatus.CHECKED_IN) {
        throw new BadRequestError(
            `No se puede hacer check-out: la reserva está en estado ${booking.status}. Se requiere CHECKED_IN.`,
            'INVALID_STATUS_TRANSITION'
        );
    }

    const updated = await prisma.booking.update({
        where: { id },
        data: { status: BookingStatus.CHECKED_OUT, checkedOutAt: new Date() },
        include: { room: { include: { residence: true } }, guest: true },
    });

    await createAuditLog({
        userId,
        action: 'CHECK_OUT',
        entityType: 'BOOKING',
        entityId: id,
        oldValues: { status: booking.status },
        newValues: { status: updated.status, checkedOutAt: updated.checkedOutAt },
        ipAddress,
    });

    return updated;
};

export const updateBooking = async (
    id: number,
    data: z.infer<typeof UpdateBookingSchema>,
    userId: number,
    ipAddress?: string,
) => {
    const oldBooking = await prisma.booking.findUnique({ where: { id } });
    if (!oldBooking) throw new NotFoundError('Reserva no encontrada', 'BOOKING_NOT_FOUND');

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
            room: { include: { residence: true } },
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
        ipAddress,
    });

    // Enviar email de cancelación si corresponde
    if (data.status === BookingStatus.CANCELLED && updatedBooking.guest) {
        await sendBookingCancellation({
            id: updatedBooking.id,
            guestName: updatedBooking.guest.name,
            guestEmail: updatedBooking.guest.email,
            roomName: updatedBooking.room.name,
            residenceName: updatedBooking.room.residence.name,
            checkIn: updatedBooking.checkIn.toISOString().split('T')[0],
            checkOut: updatedBooking.checkOut.toISOString().split('T')[0],
            totalNights: updatedBooking.totalNights,
            totalPrice: Number(updatedBooking.totalPrice),
        }, data.cancellationReason);
    }

    return updatedBooking;
};
