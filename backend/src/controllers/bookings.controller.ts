import { Request, Response } from 'express';
import * as bookingService from '../services/bookings.service';
import { BookingStatus } from '@prisma/client';

export const createBooking = async (req: Request, res: Response) => {
    try {
        const booking = await bookingService.createBooking(req.body);
        res.status(201).json({ status: 'success', data: booking });
    } catch (error: any) {
        res.status(400).json({ status: 'error', message: error.message });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    try {
        const { status, roomId } = req.query;
        const bookings = await bookingService.getBookings({
            status: status as BookingStatus,
            roomId: roomId ? parseInt(roomId as string, 10) : undefined,
        });
        res.json({ status: 'success', data: bookings });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener reservas' });
    }
};

export const getBooking = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const booking = await bookingService.getBookingById(parseInt(id, 10));
        if (!booking) return res.status(404).json({ status: 'error', message: 'Reserva no encontrada' });
        res.json({ status: 'success', data: booking });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener la reserva' });
    }
};

export const updateBooking = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const userId = req.user!.userId;
        const booking = await bookingService.updateBooking(parseInt(id, 10), req.body, userId);
        res.json({ status: 'success', data: booking });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
