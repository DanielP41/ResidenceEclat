import { Request, Response } from 'express';
import { prisma } from '../config/database';

export const getObservation = async (req: Request, res: Response) => {
    try {
        const { residence } = req.params;
        const obs = await prisma.observation.findUnique({
            where: { residence }
        });
        res.json({ status: 'success', data: obs });
    } catch (error) {
        console.error('Error fetching observation:', error);
        res.status(500).json({ status: 'error', message: 'Error al obtener observación' });
    }
};

export const upsertObservation = async (req: Request, res: Response) => {
    try {
        const { residence } = req.params;
        const { content } = req.body;
        const obs = await prisma.observation.upsert({
            where: { residence },
            update: { content },
            create: { residence, content },
        });
        res.json({ status: 'success', data: obs });
    } catch (error) {
        console.error('Error saving observation:', error);
        res.status(500).json({ status: 'error', message: 'Error al guardar observación' });
    }
};
