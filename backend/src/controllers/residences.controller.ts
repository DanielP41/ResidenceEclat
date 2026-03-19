import { Request, Response } from 'express';
import { prisma } from '../config/database';
import logger from '../config/logger';
import { CreateResidenceSchema, UpdateResidenceSchema } from '../utils/validators';
import { parseIdParam } from '../utils/parseId';

export const getAllResidences = async (req: Request, res: Response) => {
    try {
        const residences = await prisma.residence.findMany({
            orderBy: { name: 'asc' }
        });
        res.json({ status: 'success', data: residences });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener sedes' });
    }
};

export const getResidenceById = async (req: Request, res: Response) => {
    const residenceId = parseIdParam(req, res);
    if (residenceId === null) return;
    try {
        const residence = await prisma.residence.findUnique({
            where: { id: residenceId }
        });
        if (!residence) {
            return res.status(404).json({ status: 'error', message: 'Sede no encontrada' });
        }
        res.json({ status: 'success', data: residence });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener sede' });
    }
};

export const createResidence = async (req: Request, res: Response) => {
    const parsed = CreateResidenceSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ status: 'error', message: parsed.error.errors[0].message });
    }
    try {
        const residence = await prisma.residence.create({ data: parsed.data });
        res.status(201).json({ status: 'success', data: residence });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al crear sede' });
    }
};

export const updateResidence = async (req: Request, res: Response) => {
    const residenceId = parseIdParam(req, res);
    if (residenceId === null) return;
    const parsed = UpdateResidenceSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ status: 'error', message: parsed.error.errors[0].message });
    }
    try {
        const residence = await prisma.residence.update({
            where: { id: residenceId },
            data: parsed.data,
        });
        res.json({ status: 'success', data: residence });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al actualizar sede' });
    }
};

export const deleteResidence = async (req: Request, res: Response) => {
    const residenceId = parseIdParam(req, res);
    if (residenceId === null) return;
    try {
        await prisma.residence.delete({ where: { id: residenceId } });
        res.json({ status: 'success', message: 'Sede eliminada correctamente' });
    } catch (error: any) {
        logger.error('Error al eliminar sede', { error: error.message, residenceId });
        res.status(500).json({ status: 'error', message: 'Error al eliminar sede' });
    }
};

