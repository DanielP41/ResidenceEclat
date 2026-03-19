import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.',
    },
});

// Limiter estricto para endpoints de autenticación (previene brute force)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Máximo 10 intentos por ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Demasiados intentos de autenticación, por favor intente de nuevo en 15 minutos.',
        code: 'RATE_LIMIT_AUTH',
    },
});

// Limiter para endpoints públicos de listado (previene scraping)
export const listingLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Demasiadas peticiones, por favor intente más tarde.',
        code: 'RATE_LIMIT_LISTING',
    },
});

// Limiter para el endpoint público de reservas (previene spam)
export const bookingLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // Máximo 5 reservas por hora por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Demasiadas solicitudes de reserva desde esta IP, por favor intente más tarde.',
        code: 'RATE_LIMIT_BOOKING',
    },
});

