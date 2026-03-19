import { Router } from 'express';
import { getOccupancyStats } from '../controllers/stats.controller';
import { authenticate, isStaff } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/stats/occupancy:
 *   get:
 *     summary: Obtener estadísticas de ocupación
 *     tags: [Stats]
 *     parameters:
 *       - in: query
 *         name: residenceId
 *         schema:
 *           type: integer
 *         description: ID de la sede (omitir para estadísticas globales)
 *     responses:
 *       200:
 *         description: Estadísticas de ocupación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/OccupancyStats'
 *             example:
 *               status: success
 *               data:
 *                 total: 20
 *                 occupied: 8
 *                 reserved: 3
 *                 partial: 2
 *                 maintenance: 1
 *                 vacant: 6
 *                 percentages:
 *                   occupied: 40
 *                   reserved: 15
 *                   partial: 10
 *                   vacant: 30
 */
router.get('/occupancy', authenticate, isStaff, getOccupancyStats);

export default router;
