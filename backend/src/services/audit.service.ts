import { prisma } from '../config/database';
import logger from '../config/logger';

interface CreateAuditLogParams {
    userId?: number;
    action: string;
    entityType: string;
    entityId: number;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
}

export const createAuditLog = async (params: CreateAuditLogParams) => {
    try {
        return await prisma.auditLog.create({
            data: {
                userId: params.userId,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                oldValues: params.oldValues,
                newValues: params.newValues,
                ipAddress: params.ipAddress,
            },
        });
    } catch (error: any) {
        logger.error('Error creando audit log', { error: error.message, action: params.action, entityType: params.entityType });
        // No lanzamos el error para no bloquear la operación principal
    }
};

export const getAuditLogs = async (filters: {
    entityType?: string;
    entityId?: number;
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}) => {
    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 50;
    const skip  = (page - 1) * limit;

    const where: any = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId)   where.entityId   = filters.entityId;
    if (filters.userId)     where.userId      = filters.userId;

    if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo)   where.createdAt.lte = new Date(filters.dateTo);
    }

    const [items, total] = await prisma.$transaction([
        prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                user: { select: { id: true, name: true, email: true } },
            },
        }),
        prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};
