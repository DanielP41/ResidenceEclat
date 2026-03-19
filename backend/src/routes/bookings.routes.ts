import { Router } from 'express';
import * as bookingController from '../controllers/bookings.controller';
import { authenticate, isStaff } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { CreateBookingSchema, UpdateBookingSchema } from '../utils/validators';
import { bookingLimiter } from '../middleware/ratelimit.middleware';

const router = Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Crear una nueva reserva
 *     description: Endpoint público para que los huéspedes creen reservas
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookingRequest'
 *     responses:
 *       201:
 *         description: Reserva creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: Datos inválidos (fechas incorrectas, términos no aceptados)
 *       409:
 *         description: Habitación no disponible para las fechas seleccionadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: La habitación ya no está disponible para las fechas seleccionadas
 *                 code:
 *                   type: string
 *                   example: ROOM_NOT_AVAILABLE
 */
router.post('/', bookingLimiter, validateBody(CreateBookingSchema), bookingController.createBooking);

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: Listar reservas
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED]
 *         description: Filtrar por estado
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: integer
 *         description: Filtrar por habitación
 *     responses:
 *       200:
 *         description: Lista de reservas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Booking'
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol STAFF o ADMIN
 */
router.get('/', authenticate, isStaff, bookingController.getBookings);

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: Obtener una reserva por ID
 *     tags: [Bookings]
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
 *         description: Datos de la reserva
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Booking'
 *       404:
 *         description: Reserva no encontrada
 */
router.get('/:id', authenticate, isStaff, bookingController.getBooking);

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: Actualizar estado de una reserva
 *     tags: [Bookings]
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED]
 *               paymentStatus:
 *                 type: string
 *                 enum: [PENDING, PAID, REFUNDED, PARTIAL]
 *               cancellationReason:
 *                 type: string
 *                 description: Requerido si status es CANCELLED
 *     responses:
 *       200:
 *         description: Reserva actualizada
 *       404:
 *         description: Reserva no encontrada
 */
router.put('/:id', authenticate, isStaff, validateBody(UpdateBookingSchema), bookingController.updateBooking);

/**
 * @swagger
 * /api/bookings/{id}/checkin:
 *   patch:
 *     summary: Registrar check-in de un huésped
 *     description: Marca la reserva como CHECKED_IN. Requiere que esté en estado CONFIRMED.
 *     tags: [Bookings]
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
 *         description: Check-in registrado
 *       400:
 *         description: Transición de estado inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: string
 *                   example: INVALID_STATUS_TRANSITION
 *       404:
 *         description: Reserva no encontrada
 */
router.patch('/:id/checkin', authenticate, isStaff, bookingController.checkInBooking);

/**
 * @swagger
 * /api/bookings/{id}/checkout:
 *   patch:
 *     summary: Registrar check-out de un huésped
 *     description: Marca la reserva como CHECKED_OUT. Requiere que esté en estado CHECKED_IN.
 *     tags: [Bookings]
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
 *         description: Check-out registrado
 *       400:
 *         description: Transición de estado inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 code:
 *                   type: string
 *                   example: INVALID_STATUS_TRANSITION
 *       404:
 *         description: Reserva no encontrada
 */
router.patch('/:id/checkout', authenticate, isStaff, bookingController.checkOutBooking);

export default router;
