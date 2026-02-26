import { prisma } from '../config/database';
import { CreateRoomSchema } from '../utils/validators';
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

export const createRoom = async (data: z.infer<typeof CreateRoomSchema>, userId: number) => {
    const room = await prisma.room.create({
        data: {
            ...data,
            amenities: data.amenities || [],
            images: data.images || [],
        },
    });

    await createAuditLog({
        userId,
        action: 'CREATE',
        entityType: 'ROOM',
        entityId: room.id,
        newValues: room,
    });

    return room;
};

export const updateRoom = async (
    id: number,
    data: Partial<z.infer<typeof CreateRoomSchema>>,
    userId: number
) => {
    const oldRoom = await prisma.room.findUnique({ where: { id } });
    if (!oldRoom) throw new Error('Habitación no encontrada');

    const updatedRoom = await prisma.room.update({
        where: { id },
        data,
    });

    await createAuditLog({
        userId,
        action: 'UPDATE',
        entityType: 'ROOM',
        entityId: id,
        oldValues: oldRoom,
        newValues: updatedRoom,
    });

    return updatedRoom;
};

export const deleteRoom = async (id: number, userId: number) => {
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

export const getAllRooms = async (residence?: string) => {
    const where: any = { isDeleted: false, isActive: true };
    if (residence) {
        where.residence = residence;
    }

    return prisma.room.findMany({
        where,
        orderBy: {
            price: 'asc'
        }
    });
};

export const getAvailableRooms = async (checkIn: string, checkOut: string, capacity?: number) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // 1. Obtener todas las habitaciones activas y con capacidad mínima
    const allRooms = await prisma.room.findMany({
        where: {
            isActive: true,
            isDeleted: false,
            ...(capacity ? { capacity: { gte: capacity } } : {}),
        },
    });

    // 2. Filtrar las habitaciones que no tienen reservas solapadas en ese rango
    const availableRooms: any[] = [];

    for (const room of allRooms) {
        const isAvailable = await checkAvailability(room.id, checkIn, checkOut);
        if (isAvailable) {
            availableRooms.push(room);
        }
    }

    return availableRooms;
};
