import { prisma } from '../config/database';

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
    } catch (error) {
        console.error('❌ Error creating audit log:', error);
        // No lanzamos el error para no bloquear la operación principal
    }
};

export const getAuditLogs = async (filters: {
    entityType?: string;
    entityId?: number;
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
}) => {
    const where: any = {};

    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.entityId) where.entityId = filters.entityId;
    if (filters.userId) where.userId = filters.userId;

    if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
        if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    return await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};
