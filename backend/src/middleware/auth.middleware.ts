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
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            status: 'error',
            message: 'No autorizado: Falta el token de autenticación',
        });
    }

    const token = authHeader.split(' ')[1];

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
