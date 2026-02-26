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

        const occupiedCount = await prisma.booking.count({
            where: {
                status: 'CHECKED_IN',
                room: roomFilter
            }
        });

        const reservedCount = await prisma.booking.count({
            where: {
                status: 'CONFIRMED',
                room: roomFilter
            }
        });

        const vacantCount = Math.max(0, totalRoomsCount - occupiedCount - reservedCount);

        res.json({
            status: 'success',
            data: {
                total: totalRoomsCount,
                occupied: occupiedCount,
                reserved: reservedCount,
                vacant: vacantCount,
                percentages: {
                    occupied: totalRoomsCount > 0 ? (occupiedCount / totalRoomsCount) * 100 : 0,
                    reserved: totalRoomsCount > 0 ? (reservedCount / totalRoomsCount) * 100 : 0,
                    vacant: totalRoomsCount > 0 ? (vacantCount / totalRoomsCount) * 100 : 0,
                }
            }
        });
    } catch (error) {
        console.error('Error fetching occupancy stats:', error);
        res.status(500).json({ status: 'error', message: 'Error al obtener estadísticas de ocupación' });
    }
};
