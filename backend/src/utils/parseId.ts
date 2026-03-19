import { Request, Response } from 'express';

/**
 * Parsea un parámetro de ruta como entero positivo.
 * Retorna el número si es válido, o envía 400 y retorna null.
 */
export const parseIdParam = (
    req: Request,
    res: Response,
    paramName: string = 'id',
): number | null => {
    const value = req.params[paramName];
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed <= 0) {
        res.status(400).json({ status: 'error', message: `${paramName} inválido` });
        return null;
    }
    return parsed;
};
