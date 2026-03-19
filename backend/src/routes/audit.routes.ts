import { Router, Request, Response } from 'express';
import * as auditService from '../services/audit.service';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { AppError } from '../utils/errors';

const router = Router();

router.get('/', authenticate, isAdmin, async (req: Request, res: Response) => {
    try {
        const { entityType, entityId, userId, dateFrom, dateTo, page, limit } = req.query;

        const parsedEntityId = entityId ? parseInt(entityId as string, 10) : undefined;
        const parsedUserId   = userId   ? parseInt(userId as string, 10)   : undefined;
        const parsedPage     = page     ? Math.max(1, parseInt(page as string, 10))              : 1;
        const parsedLimit    = limit    ? Math.min(100, Math.max(1, parseInt(limit as string, 10))) : 50;

        if (entityId && isNaN(parsedEntityId!)) {
            return res.status(400).json({ status: 'error', message: 'entityId inválido' });
        }
        if (userId && isNaN(parsedUserId!)) {
            return res.status(400).json({ status: 'error', message: 'userId inválido' });
        }

        const result = await auditService.getAuditLogs({
            entityType: entityType as string,
            entityId: parsedEntityId,
            userId: parsedUserId,
            dateFrom: dateFrom as string,
            dateTo: dateTo as string,
            page: parsedPage,
            limit: parsedLimit,
        });
        res.json({ status: 'success', data: result });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al obtener logs de auditoría' });
    }
});

export default router;
