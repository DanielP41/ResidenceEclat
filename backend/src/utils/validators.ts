import { z } from 'zod';
import { Role, BookingStatus, PaymentStatus, RoomStatus } from '@prisma/client';

// ── Date Validation Helpers ──
const isValidDateString = (val: string) => !isNaN(Date.parse(val));

const isNotInPast = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
};

const dateStringSchema = z.string().refine(isValidDateString, {
    message: 'Fecha inválida',
});

const futureDateSchema = dateStringSchema.refine(isNotInPast, {
    message: 'La fecha no puede estar en el pasado',
});

const validateDateRange = (data: { checkIn: string; checkOut: string }) => {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    return checkOut > checkIn;
};

// ── Auth Schemas ──
export const LoginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

// ── Observation Schemas ──
export const ObservationSchema = z.object({
    content: z.string().min(1, 'El contenido es requerido').max(10000, 'Observación demasiado larga'),
});

// ── Room Schemas ──
export const CreateRoomSchema = z.object({
    name: z.string().min(3, 'Nombre muy corto').max(100),
    description: z.string().optional(),
    price: z.number().positive(),
    capacity: z.number().int().positive(),
    residenceId: z.number().int().positive('La sede es requerida'),
    status: z.nativeEnum(RoomStatus).optional(),
    amenities: z.array(z.string()).optional().default([]),
    images: z.array(z.string().url()).optional().default([]),
});


export const UpdateRoomSchema = CreateRoomSchema.partial();

export const RoomAvailabilityQuerySchema = z.object({
    checkIn: futureDateSchema,
    checkOut: dateStringSchema,
    capacity: z.string().optional().transform((val) => (val ? parseInt(val, 10) : undefined)),
}).refine(validateDateRange, {
    message: 'La fecha de check-out debe ser posterior al check-in',
    path: ['checkOut'],
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
    checkIn: futureDateSchema,
    checkOut: dateStringSchema,
    acceptedTerms: z.literal(true, {
        errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }),
    }),
}).refine(validateDateRange, {
    message: 'La fecha de check-out debe ser posterior al check-in',
    path: ['checkOut'],
});

export const UpdateBookingSchema = z.object({
    status: z.nativeEnum(BookingStatus).optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    cancellationReason: z.string().optional(),
});

// ── Residence Schemas ──
export const CreateResidenceSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido').max(100, 'Nombre demasiado largo'),
    address: z.string().max(255, 'Dirección demasiado larga').optional(),
    description: z.string().max(5000, 'Descripción demasiado larga').optional(),
    images: z.array(z.string().url('URL de imagen inválida')).optional().default([]),
});

export const UpdateResidenceSchema = CreateResidenceSchema.partial();

// ── User Management ──
export const CreateUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.nativeEnum(Role).optional().default(Role.STAFF),
});
