import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.',
    },
});

export const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // Límite de 5 intentos
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 'error',
        message: 'Demasiados intentos de inicio de sesión, por favor intente de nuevo en una hora.',
    },
});
