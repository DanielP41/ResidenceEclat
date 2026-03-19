import { Request, Response } from 'express';
import * as uploadService from '../services/upload.service';
import logger from '../config/logger';

export const uploadImage = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No se recibió ningún archivo', code: 'NO_FILE' });
        }

        const result = await uploadService.uploadImage(
            req.file.buffer,
            req.file.mimetype,
            req.file.originalname
        );

        res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
        logger.error('Error al subir imagen', { error: error.message });
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ status: 'error', message: error.message, code: error.code });
    }
};

export const deleteImage = async (req: Request, res: Response) => {
    try {
        const { publicId } = req.body;
        if (!publicId) {
            return res.status(400).json({ status: 'error', message: 'publicId requerido', code: 'NO_PUBLIC_ID' });
        }

        await uploadService.deleteImage(publicId);
        res.json({ status: 'success', message: 'Imagen eliminada' });
    } catch (error: any) {
        logger.error('Error al eliminar imagen', { error: error.message });
        res.status(500).json({ status: 'error', message: 'Error al eliminar imagen' });
    }
};
