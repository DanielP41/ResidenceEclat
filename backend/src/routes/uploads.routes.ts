import { Router } from 'express';
import multer from 'multer';
import * as uploadsController from '../controllers/uploads.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Almacenamiento en memoria — el buffer se pasa directamente a Cloudinary
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite a nivel de multer también
});

/**
 * @swagger
 * /api/uploads/image:
 *   post:
 *     summary: Subir una imagen de habitación
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Imagen (JPG, PNG o WebP, máx 5MB)
 *     responses:
 *       201:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: https://res.cloudinary.com/...
 *                     publicId:
 *                       type: string
 *       400:
 *         description: Archivo inválido (tipo no permitido, supera 5MB, o no se recibió)
 *       401:
 *         description: No autenticado
 */
router.post('/image', authenticate, isAdmin, upload.single('file'), uploadsController.uploadImage);

/**
 * @swagger
 * /api/uploads/image:
 *   delete:
 *     summary: Eliminar una imagen de Cloudinary
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - publicId
 *             properties:
 *               publicId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Imagen eliminada
 *       401:
 *         description: No autenticado
 */
router.delete('/image', authenticate, isAdmin, uploadsController.deleteImage);

export default router;
