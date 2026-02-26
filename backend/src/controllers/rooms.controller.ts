import { Request, Response } from 'express';
import * as roomService from '../services/rooms.service';
import { RoomAvailabilityQuerySchema } from '../utils/validators';

export const getAllRooms = async (req: Request, res: Response) => {
    try {
        const residence = req.query.residence as string | undefined;
        const rooms = await roomService.getAllRooms(residence);
        res.json({ status: 'success', data: rooms });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener habitaciones' });
    }
};

export const getRoom = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const room = await roomService.getRoomById(parseInt(id, 10));
        if (!room) return res.status(404).json({ status: 'error', message: 'Habitación no encontrada' });
        res.json({ status: 'success', data: room });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener la habitación' });
    }
};

export const createRoom = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const room = await roomService.createRoom(req.body, userId);
        res.status(201).json({ status: 'success', data: room });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al crear habitación' });
    }
};

export const updateRoom = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const userId = req.user!.userId;
        const room = await roomService.updateRoom(parseInt(id, 10), req.body, userId);
        res.json({ status: 'success', data: room });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const deleteRoom = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const userId = req.user!.userId;
        await roomService.deleteRoom(parseInt(id, 10), userId);
        res.json({ status: 'success', message: 'Habitación eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al eliminar habitación' });
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
