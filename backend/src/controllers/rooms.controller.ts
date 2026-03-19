import { Request, Response } from 'express';
import * as roomService from '../services/rooms.service';
import { RoomAvailabilityQuerySchema } from '../utils/validators';
import logger from '../config/logger';
import { parseIdParam } from '../utils/parseId';

export const getAllRooms = async (req: Request, res: Response) => {
    try {
        const { residenceId, priceMin, priceMax, capacity, status, sortBy, order } = req.query;

        const parseOptionalInt = (val: unknown) => {
            const n = parseInt(val as string, 10);
            return isNaN(n) ? undefined : n;
        };

        const validSortBy  = ['price', 'name', 'capacity'] as const;
        const validOrder   = ['asc', 'desc'] as const;

        const rooms = await roomService.getAllRooms({
            residenceId: parseOptionalInt(residenceId),
            priceMin:    priceMin    ? parseOptionalInt(priceMin)    : undefined,
            priceMax:    priceMax    ? parseOptionalInt(priceMax)    : undefined,
            capacity:    parseOptionalInt(capacity),
            status:      status as string | undefined,
            sortBy:      validSortBy.includes(sortBy as any) ? (sortBy as typeof validSortBy[number]) : undefined,
            order:       validOrder.includes(order as any)   ? (order as typeof validOrder[number])   : undefined,
        });
        res.json({ status: 'success', data: rooms });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener habitaciones' });
    }
};


export const getRoom = async (req: Request, res: Response) => {
    const roomId = parseIdParam(req, res);
    if (roomId === null) return;
    try {
        const room = await roomService.getRoomById(roomId);
        if (!room) return res.status(404).json({ status: 'error', message: 'Habitación no encontrada' });
        res.json({ status: 'success', data: room });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener la habitación' });
    }
};

export const createRoom = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const room = await roomService.createRoom(req.body, userId, req.ip);
        res.status(201).json({ status: 'success', data: room });
    } catch (error: any) {
        logger.error('Error al crear habitación', { error: error.message, body: req.body });
        res.status(500).json({
            status: 'error',
            message: 'Error al crear habitación',
        });
    }
};

export const updateRoom = async (req: Request, res: Response) => {
    const roomId = parseIdParam(req, res);
    if (roomId === null) return;
    try {
        const userId = req.user!.userId;
        const room = await roomService.updateRoom(roomId, req.body, userId, req.ip);
        res.json({ status: 'success', data: room });
    } catch (error: any) {
        logger.error('Error al actualizar habitación', { error: error.message, roomId });
        res.status(500).json({
            status: 'error',
            message: 'Error al actualizar habitación',
        });
    }
};


export const deleteRoom = async (req: Request, res: Response) => {
    const roomId = parseIdParam(req, res);
    if (roomId === null) return;
    try {
        const userId = req.user!.userId;
        await roomService.deleteRoom(roomId, userId, req.ip);
        res.json({ status: 'success', message: 'Habitación eliminada correctamente' });
    } catch (error: any) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ status: 'error', message: error.message || 'Error al eliminar habitación' });
    }
};

export const checkAvailability = async (req: Request, res: Response) => {
    try {
        const { checkIn, checkOut, capacity } = await RoomAvailabilityQuerySchema.parseAsync(req.query);
        const rooms = await roomService.getAvailableRooms(checkIn, checkOut, capacity);
        res.json({ status: 'success', data: rooms });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message || 'Error al verificar disponibilidad' });
    }
};
