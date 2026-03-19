import { prisma } from '../config/database';
import { CreateRoomSchema, UpdateRoomSchema } from '../utils/validators';
import { NotFoundError } from '../utils/errors';
import { z } from 'zod';
import { createAuditLog } from './audit.service';

export const getRooms = async (includeDeleted = false) => {
    return await prisma.room.findMany({
        where: includeDeleted ? {} : { isDeleted: false, isActive: true },
        orderBy: { createdAt: 'desc' },
    });
};

export const getRoomById = async (id: number) => {
    return await prisma.room.findFirst({
        where: { id, isDeleted: false },
    });
};

export const createRoom = async (data: any, userId: number, ipAddress?: string) => {
    // Validar datos
    const validatedData = CreateRoomSchema.parse(data);

    const room = await prisma.room.create({
        data: {
            ...validatedData,
            amenities: validatedData.amenities || [],
            images: validatedData.images || [],
        },
    });


    await createAuditLog({
        userId,
        action: 'CREATE',
        entityType: 'ROOM',
        entityId: room.id,
        newValues: room,
        ipAddress,
    });

    return room;
};

export const updateRoom = async (
    id: number,
    data: Partial<z.infer<typeof CreateRoomSchema>>,
    userId: number,
    ipAddress?: string,
) => {
    const oldRoom = await prisma.room.findFirst({ where: { id, isDeleted: false } });
    if (!oldRoom) throw new NotFoundError('Habitación no encontrada', 'ROOM_NOT_FOUND');

    const validatedData = UpdateRoomSchema.parse(data);

    const updatedRoom = await prisma.room.update({
        where: { id },
        data: validatedData,
    });


    await createAuditLog({
        userId,
        action: 'UPDATE',
        entityType: 'ROOM',
        entityId: id,
        oldValues: oldRoom,
        newValues: updatedRoom,
        ipAddress,
    });

    return updatedRoom;
};

export const deleteRoom = async (id: number, userId: number, ipAddress?: string) => {
    const existing = await prisma.room.findFirst({ where: { id, isDeleted: false } });
    if (!existing) throw new NotFoundError('Habitación no encontrada', 'ROOM_NOT_FOUND');

    const room = await prisma.room.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedById: userId,
        },
    });

    await createAuditLog({
        userId,
        action: 'DELETE',
        entityType: 'ROOM',
        entityId: id,
        ipAddress,
    });

    return room;
};

export const checkAvailability = async (roomId: number, checkIn: string, checkOut: string) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const overlappingBookings = await prisma.booking.findFirst({
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
};

export const getAllRooms = async (filters: {
    residenceId?: number;
    priceMin?: number;
    priceMax?: number;
    capacity?: number;
    status?: string;
    sortBy?: 'price' | 'name' | 'capacity';
    order?: 'asc' | 'desc';
} = {}) => {
    const where: any = { isDeleted: false, isActive: true };

    if (filters.residenceId) where.residenceId = filters.residenceId;
    if (filters.capacity)    where.capacity    = { gte: filters.capacity };
    if (filters.status)      where.status      = filters.status;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        where.price = {};
        if (filters.priceMin !== undefined) where.price.gte = filters.priceMin;
        if (filters.priceMax !== undefined) where.price.lte = filters.priceMax;
    }

    return prisma.room.findMany({
        where,
        include: { residence: true },
        orderBy: { [filters.sortBy ?? 'price']: filters.order ?? 'asc' },
    });
};


export const getAvailableRooms = async (checkIn: string, checkOut: string, capacity?: number) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // Query optimizada: obtiene habitaciones disponibles en UNA sola consulta
    // Excluye habitaciones que tienen reservas solapadas con el rango de fechas
    const availableRooms = await prisma.room.findMany({
        where: {
            isActive: true,
            isDeleted: false,
            ...(capacity ? { capacity: { gte: capacity } } : {}),
            // Excluir habitaciones con reservas que se solapan
            NOT: {
                bookings: {
                    some: {
                        status: { not: 'CANCELLED' },
                        OR: [
                            // Reserva empieza antes y termina después del checkIn
                            {
                                checkIn: { lte: checkInDate },
                                checkOut: { gt: checkInDate },
                            },
                            // Reserva empieza antes del checkOut y termina después
                            {
                                checkIn: { lt: checkOutDate },
                                checkOut: { gte: checkOutDate },
                            },
                            // Reserva está completamente dentro del rango
                            {
                                checkIn: { gte: checkInDate },
                                checkOut: { lte: checkOutDate },
                            },
                        ],
                    },
                },
            },
        },
        include: {
            residence: true,
        },
        orderBy: {
            price: 'asc',
        },
    });

    return availableRooms;
};
