import { Router, Request, Response } from 'express';
import * as auditService from '../services/audit.service';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, isAdmin, async (req: Request, res: Response) => {
    try {
        const { entityType, entityId, userId, dateFrom, dateTo } = req.query;
        const logs = await auditService.getAuditLogs({
            entityType: entityType as string,
            entityId: entityId ? parseInt(entityId as string, 10) : undefined,
            userId: userId ? parseInt(userId as string, 10) : undefined,
            dateFrom: dateFrom as string,
            dateTo: dateTo as string,
        });
        res.json({ status: 'success', data: logs });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener logs de auditoría' });
    }
});

export default router;
