import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getOccupancyStats = async (req: Request, res: Response) => {
    try {
        const { residence } = req.query;

        const roomFilter: any = { isDeleted: false, isActive: true };
        if (residence) {
            roomFilter.residence = String(residence);
        }

        const totalRoomsCount = await prisma.room.count({
            where: roomFilter
        });

        // Occupied: Manually set OR has an active checked-in booking
        const occupiedCount = await prisma.room.count({
            where: {
                ...roomFilter,
                OR: [
                    { status: 'OCCUPIED' },
                    { bookings: { some: { status: 'CHECKED_IN' } } }
                ]
            }
        });

        // Partial: Manually set (any level)
        const partialCount = await prisma.room.count({
            where: {
                ...roomFilter,
                status: { in: ['PARTIAL_1', 'PARTIAL_2', 'PARTIAL_3'] }
            }
        });

        // Reserved: Manually set OR has a confirmed booking
        const reservedCount = await prisma.room.count({
            where: {
                ...roomFilter,
                status: { notIn: ['OCCUPIED', 'PARTIAL_1', 'PARTIAL_2', 'PARTIAL_3'] },
                OR: [
                    { status: 'RESERVED' },
                    { bookings: { some: { status: 'CONFIRMED' } } }
                ],
                NOT: {
                    bookings: { some: { status: 'CHECKED_IN' } }
                }
            }
        });

        const maintenanceCount = await prisma.room.count({
            where: { ...roomFilter, status: 'MAINTENANCE' }
        });

        const vacantCount = Math.max(0, totalRoomsCount - occupiedCount - reservedCount - partialCount - maintenanceCount);

        // Advanced Percentage: Bed-based occupancy for maximum precision
        const allRooms = await prisma.room.findMany({
            where: roomFilter,
            select: { status: true, capacity: true }
        });

        let totalBeds = 0;
        let occupiedBeds = 0;

        allRooms.forEach(room => {
            totalBeds += room.capacity;
            if (room.status === 'OCCUPIED') {
                occupiedBeds += room.capacity;
            } else if (room.status === 'PARTIAL_1') {
                occupiedBeds += Math.max(0, room.capacity - 1);
            } else if (room.status === 'PARTIAL_2') {
                occupiedBeds += Math.max(0, room.capacity - 2);
            } else if (room.status === 'PARTIAL_3') {
                occupiedBeds += Math.max(0, room.capacity - 3);
            }
            // AVAILABLE, RESERVED, MAINTENANCE count as 0 occupied beds for this metric
        });

        const occupiedPercentage = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

        res.json({
            status: 'success',
            data: {
                total: totalRoomsCount,
                occupied: occupiedCount,
                reserved: reservedCount,
                partial: partialCount,
                maintenance: maintenanceCount,
                vacant: vacantCount,
                percentages: {
                    occupied: occupiedPercentage,
                    reserved: totalRoomsCount > 0 ? (reservedCount / totalRoomsCount) * 100 : 0,
                    partial: totalRoomsCount > 0 ? (partialCount / totalRoomsCount) * 100 : 0,
                    vacant: totalRoomsCount > 0 ? (vacantCount / totalRoomsCount) * 100 : 0,
                }
            }
        });
    } catch (error) {
        console.error('Error fetching occupancy stats:', error);
        res.status(500).json({ status: 'error', message: 'Error al obtener estadísticas de ocupación' });
    }
};
