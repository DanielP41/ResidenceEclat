import { Router } from 'express';
import * as roomController from '../controllers/rooms.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { CreateRoomSchema, UpdateRoomSchema } from '../utils/validators';
import { listingLimiter } from '../middleware/ratelimit.middleware';

const router = Router();

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Listar todas las habitaciones
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: residenceId
 *         schema:
 *           type: integer
 *         description: Filtrar por sede
 *     responses:
 *       200:
 *         description: Lista de habitaciones
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
 *                     $ref: '#/components/schemas/Room'
 */
router.get('/', listingLimiter, roomController.getAllRooms);

/**
 * @swagger
 * /api/rooms/availability:
 *   get:
 *     summary: Buscar habitaciones disponibles
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: checkIn
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de entrada (YYYY-MM-DD)
 *         example: '2024-12-20'
 *       - in: query
 *         name: checkOut
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de salida (YYYY-MM-DD)
 *         example: '2024-12-25'
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: integer
 *         description: Capacidad mínima requerida
 *     responses:
 *       200:
 *         description: Habitaciones disponibles
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
 *                     $ref: '#/components/schemas/Room'
 *       400:
 *         description: Parámetros inválidos (fechas en el pasado, checkOut <= checkIn)
 */
router.get('/availability', listingLimiter, roomController.checkAvailability);

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Obtener una habitación por ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la habitación
 *     responses:
 *       200:
 *         description: Datos de la habitación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       404:
 *         description: Habitación no encontrada
 */
router.get('/:id', roomController.getRoom);

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Crear una nueva habitación
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *     responses:
 *       201:
 *         description: Habitación creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Room'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN)
 */
router.post('/', authenticate, isAdmin, validateBody(CreateRoomSchema), roomController.createRoom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Actualizar una habitación
 *     tags: [Rooms]
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
 *             $ref: '#/components/schemas/CreateRoomRequest'
 *     responses:
 *       200:
 *         description: Habitación actualizada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN)
 *       404:
 *         description: Habitación no encontrada
 */
router.put('/:id', authenticate, isAdmin, validateBody(UpdateRoomSchema), roomController.updateRoom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Eliminar una habitación (soft delete)
 *     tags: [Rooms]
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
 *         description: Habitación eliminada
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol ADMIN)
 */
router.delete('/:id', authenticate, isAdmin, roomController.deleteRoom);

export default router;
