'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

// Skeleton base con animación
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded bg-white/10',
                className
            )}
        />
    );
}

// Skeleton para texto
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        'h-4',
                        i === lines - 1 ? 'w-3/4' : 'w-full'
                    )}
                />
            ))}
        </div>
    );
}

// Skeleton para cards de estadísticas (Dashboard)
export function SkeletonStatCard() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>
        </div>
    );
}

// Skeleton para el gráfico circular (Dashboard)
export function SkeletonChart() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <Skeleton className="h-5 w-40 mb-6" />
            <div className="flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Skeleton para cards de habitaciones
export function SkeletonRoomCard() {
    return (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24 rounded" />
                </div>
            </div>
        </div>
    );
}

// Skeleton para filas de tabla
export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-white/5">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}

// Skeleton para tabla completa
export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="px-4 py-3 text-left">
                                <Skeleton className="h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Skeleton para detalle de habitación
export function SkeletonRoomDetail() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Imagen principal */}
            <Skeleton className="h-96 w-full rounded-lg mb-8" />

            <div className="grid md:grid-cols-3 gap-8">
                {/* Info principal */}
                <div className="md:col-span-2 space-y-6">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <SkeletonText lines={4} />

                    {/* Amenities */}
                    <div className="pt-4">
                        <Skeleton className="h-5 w-32 mb-4" />
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-8 w-20 rounded-full" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar precio */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 h-fit">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-10 w-32 mb-6" />
                    <Skeleton className="h-12 w-full rounded" />
                </div>
            </div>
        </div>
    );
}

// Skeleton para página de dashboard completa
export function SkeletonDashboard() {
    return (
        <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <SkeletonStatCard key={i} />
                ))}
            </div>

            {/* Chart */}
            <SkeletonChart />
        </div>
    );
}

// Skeleton para grid de habitaciones
export function SkeletonRoomsGrid({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonRoomCard key={i} />
            ))}
        </div>
    );
}

// Skeleton para card de reserva
export function SkeletonBookingCard() {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Guest Info */}
            <div className="flex gap-4 min-w-[250px]">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                </div>
            </div>

            {/* Room Info */}
            <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
            </div>

            {/* Dates */}
            <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
            </div>

            {/* Status */}
            <Skeleton className="h-6 w-24 rounded-full" />

            {/* Actions */}
            <Skeleton className="h-8 w-8 rounded" />
        </div>
    );
}

// Skeleton para lista de reservas
export function SkeletonBookingsList({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonBookingCard key={i} />
            ))}
        </div>
    );
}

// Skeleton para card de habitación en admin
export function SkeletonAdminRoomCard() {
    return (
        <div className="bg-white/5 border border-white/10 p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
                <Skeleton className="w-12 h-12 rounded-md" />
                <Skeleton className="h-6 w-20 rounded" />
            </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-24" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                </div>
            </div>
        </div>
    );
}

// Skeleton para grid de habitaciones en admin
export function SkeletonAdminRoomsGrid({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonAdminRoomCard key={i} />
            ))}
        </div>
    );
}

// Skeleton para detalle de residencia
export function SkeletonResidenceDetail() {
    return (
        <div className="min-h-screen bg-[#050a1f] pt-40 pb-20 px-6 md:px-12 max-w-4xl mx-auto">
            {/* Title */}
            <div className="mb-28 text-center space-y-4">
                <Skeleton className="h-3 w-32 mx-auto" />
                <Skeleton className="h-12 w-64 mx-auto" />
            </div>

            {/* Row 1: Map + Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32 items-center">
                <Skeleton className="h-56 md:h-64 w-full rounded-sm" />
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>

            {/* Row 2: Photos 2x2 + Comfort Text */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 items-center">
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="aspect-[4/3] w-full rounded-sm" />
                    ))}
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </div>

            {/* Button */}
            <div className="flex justify-center">
                <Skeleton className="h-14 w-48" />
            </div>
        </div>
    );
}
