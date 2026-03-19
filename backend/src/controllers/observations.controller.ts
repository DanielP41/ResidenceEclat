import { Request, Response } from 'express';
import { prisma } from '../config/database';
import logger from '../config/logger';
import { ObservationSchema } from '../utils/validators';
import { parseIdParam } from '../utils/parseId';

export const getObservation = async (req: Request, res: Response) => {
    const id = parseIdParam(req, res, 'residenceId');
    if (id === null) return;
    try {
        const obs = await prisma.observation.findUnique({
            where: { residenceId: id }
        });
        res.json({ status: 'success', data: obs });

    } catch (error: any) {
        logger.error('Error al obtener observación', { error: error.message, residenceId: req.params.residenceId });
        res.status(500).json({ status: 'error', message: 'Error al obtener observación' });
    }
};

export const upsertObservation = async (req: Request, res: Response) => {
    const parsed = ObservationSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ status: 'error', message: parsed.error.errors[0].message });
    }

    try {
        const { content } = parsed.data;
        const id = parseIdParam(req, res, 'residenceId');
        if (id === null) return;
        const obs = await prisma.observation.upsert({
            where: { residenceId: id },
            update: { content },
            create: { residenceId: id, content },
        });
        res.json({ status: 'success', data: obs });

    } catch (error: any) {
        logger.error('Error al guardar observación', { error: error.message, residenceId: req.params.residenceId });
        res.status(500).json({ status: 'error', message: 'Error al guardar observación' });
    }
};
