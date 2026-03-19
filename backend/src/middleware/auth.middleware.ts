import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.util';
import { Role } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    // Prefer httpOnly cookie, fall back to Authorization header (for API clients / Swagger)
    const cookieToken = req.cookies?.accessToken;
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null;

    const token = cookieToken || headerToken;

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'No autorizado: Falta el token de autenticación',
        });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: 'No autorizado: Token inválido o expirado',
        });
    }
};

export const requireRole = (roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'No autorizado',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Prohibido: No tienes los permisos necesarios',
            });
        }

        next();
    };
};

export const isAdmin = requireRole([Role.ADMIN]);
export const isStaff = requireRole([Role.ADMIN, Role.STAFF]);
