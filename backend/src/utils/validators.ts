import { z } from 'zod';
import { Role, BookingStatus, PaymentStatus, RoomStatus } from '@prisma/client';

// ── Auth Schemas ──
export const LoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

// ── Room Schemas ──
export const CreateRoomSchema = z.object({
    name: z.string().min(3, 'Nombre muy corto').max(100),
    description: z.string().optional(),
    price: z.number().positive(),
    capacity: z.number().int().positive(),
    status: z.nativeEnum(RoomStatus).optional(),
    amenities: z.array(z.string()).optional().default([]),
    images: z.array(z.string().url()).optional().default([]),
});

export const UpdateRoomSchema = CreateRoomSchema.partial();

export const RoomAvailabilityQuerySchema = z.object({
    checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Check-in inválido',
    }),
    checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Check-out inválido',
    }),
    capacity: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
});

// ── Booking Schemas ──
export const CreateBookingSchema = z.object({
    roomId: z.number().int().positive(),
    guest: z.object({
        name: z.string().min(3, 'Nombre del huésped muy corto'),
        email: z.string().email('Email del huésped inválido'),
        phone: z.string().optional(),
        documentType: z.string().optional(),
        documentNumber: z.string().optional(),
    }),
    checkIn: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Check-in inválido',
    }),
    checkOut: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Check-out inválido',
    }),
    acceptedTerms: z.literal(true, {
        errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }),
    }),
});

export const UpdateBookingSchema = z.object({
    status: z.nativeEnum(BookingStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    cancellationReason: z.string().optional(),
});

// ── User Management ──
export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.nativeEnum(Role).optional().default(Role.STAFF),
});
