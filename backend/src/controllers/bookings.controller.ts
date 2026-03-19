import { Request, Response } from 'express';
import * as bookingService from '../services/bookings.service';
import { BookingStatus } from '@prisma/client';
import { parseIdParam } from '../utils/parseId';

export const createBooking = async (req: Request, res: Response) => {
    try {
        const booking = await bookingService.createBooking(req.body);
        res.status(201).json({ status: 'success', data: booking });
    } catch (error: any) {
        const statusCode = error.statusCode || 400;
        res.status(statusCode).json({
            status: 'error',
            message: error.message,
            code: error.errorCode
        });
    }
};

export const getBookings = async (req: Request, res: Response) => {
    try {
        const { status, roomId, page, limit } = req.query;

        let parsedRoomId: number | undefined;
        if (roomId) {
            parsedRoomId = parseInt(roomId as string, 10);
            if (isNaN(parsedRoomId)) return res.status(400).json({ status: 'error', message: 'roomId inválido' });
        }

        const parsedPage  = page  ? Math.max(1, parseInt(page as string, 10))  : 1;
        const parsedLimit = limit ? Math.min(100, Math.max(1, parseInt(limit as string, 10))) : 50;

        if (status && !Object.values(BookingStatus).includes(status as BookingStatus)) {
            return res.status(400).json({ status: 'error', message: 'Status inválido' });
        }

        const bookings = await bookingService.getBookings({
            status: status as BookingStatus | undefined,
            roomId: parsedRoomId,
            page: parsedPage,
            limit: parsedLimit,
        });
        res.json({ status: 'success', data: bookings });
    } catch (error: any) {
        res.status(500).json({ status: 'error', message: 'Error al obtener reservas' });
    }
};

export const getBooking = async (req: Request, res: Response) => {
    const bookingId = parseIdParam(req, res);
    if (bookingId === null) return;
    try {
        const booking = await bookingService.getBookingById(bookingId);
        if (!booking) return res.status(404).json({ status: 'error', message: 'Reserva no encontrada' });
        res.json({ status: 'success', data: booking });

    } catch (error: any) {
        res.status(500).json({ status: 'error', message: 'Error al obtener la reserva' });
    }
};

export const checkInBooking = async (req: Request, res: Response) => {
    const bookingId = parseIdParam(req, res);
    if (bookingId === null) return;
    try {
        const userId = req.user!.userId;
        const booking = await bookingService.checkInBooking(bookingId, userId, req.ip);
        res.json({ status: 'success', data: booking });
    } catch (error: any) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ status: 'error', message: error.message, code: error.code });
    }
};

export const checkOutBooking = async (req: Request, res: Response) => {
    const bookingId = parseIdParam(req, res);
    if (bookingId === null) return;
    try {
        const userId = req.user!.userId;
        const booking = await bookingService.checkOutBooking(bookingId, userId, req.ip);
        res.json({ status: 'success', data: booking });
    } catch (error: any) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ status: 'error', message: error.message, code: error.code });
    }
};

export const updateBooking = async (req: Request, res: Response) => {
    const bookingId = parseIdParam(req, res);
    if (bookingId === null) return;
    try {
        const userId = req.user!.userId;
        const booking = await bookingService.updateBooking(bookingId, req.body, userId, req.ip);
        res.json({ status: 'success', data: booking });
    } catch (error: any) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            status: 'error',
            message: error.message,
            code: error.errorCode
        });
    }
};
