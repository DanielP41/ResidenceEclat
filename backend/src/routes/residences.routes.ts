import { Router } from 'express';
import * as residencesController from '../controllers/residences.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /api/residences:
 *   get:
 *     summary: Listar todas las sedes
 *     tags: [Residences]
 *     responses:
 *       200:
 *         description: Lista de sedes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Residence'
 */
router.get('/', residencesController.getAllResidences);

/**
 * @swagger
 * /api/residences/{id}:
 *   get:
 *     summary: Obtener una sede por ID
 *     tags: [Residences]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos de la sede
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Residence'
 *       404:
 *         description: Sede no encontrada
 */
router.get('/:id', residencesController.getResidenceById);

/**
 * @swagger
 * /api/residences:
 *   post:
 *     summary: Crear una nueva sede
 *     tags: [Residences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: Sede Palermo
 *               address:
 *                 type: string
 *                 example: Av. Santa Fe 1234, CABA
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *     responses:
 *       201:
 *         description: Sede creada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol ADMIN
 */
router.post('/', authenticate, requireRole([Role.ADMIN]), residencesController.createResidence);

/**
 * @swagger
 * /api/residences/{id}:
 *   put:
 *     summary: Actualizar una sede
 *     tags: [Residences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Sede actualizada
 *       404:
 *         description: Sede no encontrada
 */
router.put('/:id', authenticate, requireRole([Role.ADMIN]), residencesController.updateResidence);

/**
 * @swagger
 * /api/residences/{id}:
 *   delete:
 *     summary: Eliminar una sede
 *     tags: [Residences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Sede eliminada
 *       403:
 *         description: Requiere rol ADMIN
 */
router.delete('/:id', authenticate, requireRole([Role.ADMIN]), residencesController.deleteResidence);

export default router;
