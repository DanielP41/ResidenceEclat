import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { Role } from '@prisma/client';

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                status: 'error',
                message: 'Credenciales inválidas',
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                status: 'error',
                message: 'Cuenta desactivada',
            });
        }

        const payload = { userId: user.id, email: user.email, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.json({
            status: 'success',
            data: {
                user: { id: user.id, email: user.email, name: user.name, role: user.role },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ status: 'error', message: 'Refresh token requerido' });
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user || !user.isActive) {
            return res.status(401).json({ status: 'error', message: 'Sesión inválida' });
        }

        const payload = { userId: user.id, email: user.email, role: user.role };
        const newAccessToken = generateAccessToken(payload);

        res.json({
            status: 'success',
            data: { accessToken: newAccessToken },
        });
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
    }
};
