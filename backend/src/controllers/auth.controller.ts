import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util';
import { Role } from '@prisma/client';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.SECURE_COOKIES === 'true',
    sameSite: 'lax' as const,
};
const ACCESS_COOKIE_MAX_AGE = 4 * 60 * 60 * 1000;       // 4h
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7d

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
            return res.status(401).json({
                status: 'error',
                message: 'Credenciales inválidas',
            });
        }

        const payload = { userId: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);

        res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_COOKIE_MAX_AGE });
        res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_COOKIE_MAX_AGE });

        res.json({
            status: 'success',
            data: {
                user: { id: user.id, email: user.email, name: user.name, role: user.role },
            },
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
        return res.status(400).json({ status: 'error', message: 'Refresh token requerido' });
    }

    try {
        const decoded = verifyRefreshToken(token);
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user || !user.isActive) {
            return res.status(401).json({ status: 'error', message: 'Sesión inválida' });
        }

        if (decoded.tokenVersion !== user.tokenVersion) {
            return res.status(401).json({ status: 'error', message: 'Sesión inválida' });
        }

        const payload = { userId: user.id, email: user.email, role: user.role, tokenVersion: user.tokenVersion };
        const newAccessToken = generateAccessToken(payload);
        const newRefreshToken = generateRefreshToken(payload);

        res.cookie('accessToken', newAccessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_COOKIE_MAX_AGE });
        res.cookie('refreshToken', newRefreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_COOKIE_MAX_AGE });

        res.json({ status: 'success' });
    } catch (error) {
        res.status(401).json({ status: 'error', message: 'Token inválido o expirado' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        await prisma.user.update({
            where: { id: userId },
            data: { tokenVersion: { increment: 1 } },
        });
        res.clearCookie('accessToken', COOKIE_OPTIONS);
        res.clearCookie('refreshToken', COOKIE_OPTIONS);
        res.json({ status: 'success', message: 'Sesión cerrada' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};
