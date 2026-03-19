'use client';

import React, { useEffect, useState } from 'react';
import { bookingsApi } from '@/lib/api';
import {
    Calendar,
    User,
    Home,
    Clock,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Mail,
    Phone,
    FileText
} from 'lucide-react';
import { SkeletonBookingsList } from '@/components/ui/Skeleton';
import { toast } from 'sonner';

interface Booking {
    id: number;
    guest: {
        name: string;
        email: string;
        phone: string;
    };
    room: {
        name: string;
        residence: {
            name: string;
        };
    };

    checkIn: string;
    checkOut: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CHECKED_IN' | 'CHECKED_OUT';
    totalPrice: number;
    createdAt: string;
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await bookingsApi.getAll();
            setBookings(res.data?.items ?? res.data ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, status: string) => {
        setUpdatingId(id);
        try {
            await bookingsApi.update(id, { status });
            await fetchBookings();
        } catch (err) {
            console.error(err);
            toast.error('Error al actualizar el estado');
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'CONFIRMED': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'CANCELLED': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'CHECKED_IN': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'CHECKED_OUT': return 'bg-white/5 text-white/40 border-white/10';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Pendiente';
            case 'CONFIRMED': return 'Confirmada';
            case 'CANCELLED': return 'Cancelada';
            case 'CHECKED_IN': return 'Check-in';
            case 'CHECKED_OUT': return 'Check-out';
            default: return status;
        }
    };

    return (
        <div className="p-10">
            <header className="mb-10">
                <div className="text-primary text-xs uppercase tracking-[0.2em] mb-1">Gestión Administrativa</div>
                <h1 className="text-3xl font-serif">Reservas</h1>
            </header>

            {loading ? (
                <SkeletonBookingsList count={5} />
            ) : (
                <div className="space-y-6">
                    {bookings.length === 0 ? (
                        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-lg">
                            <Calendar size={40} className="mx-auto text-white/10 mb-4" />
                            <p className="text-white/40 uppercase tracking-widest text-xs">No hay reservas registradas</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {bookings.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="bg-white/5 border border-white/10 p-6 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/20 transition-colors"
                                >
                                    {/* Guest Info */}
                                    <div className="flex gap-4 min-w-[250px]">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <div className="text-xl font-serif text-white">{booking.guest.name}</div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <a href={`mailto:${booking.guest.email}`} className="text-white/40 hover:text-primary transition-colors">
                                                    <Mail size={14} />
                                                </a>
                                                <a href={`tel:${booking.guest.phone}`} className="text-white/40 hover:text-primary transition-colors">
                                                    <Phone size={14} />
                                                </a>
                                                <span className="text-white/10">|</span>
                                                <span className="text-[10px] text-white/40 uppercase tracking-widest">Reserva #{booking.id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stay Details */}
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <div className="flex items-center gap-2 text-sm text-white/80">
                                            <Home size={14} className="text-primary/60" />
                                            <span>{booking.room.name}</span>
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/40 uppercase">
                                                {booking.room.residence.name}
                                            </span>

                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-white/60">
                                            <Calendar size={14} className="text-primary/60" />
                                            <span>
                                                {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status & Price */}
                                    <div className="flex items-center gap-8">
                                        <div className="text-right hidden md:block">
                                            <div className="text-[10px] text-white/20 uppercase tracking-widest mb-1">Costo Total</div>
                                            <div className="text-lg font-serif text-white">${booking.totalPrice.toLocaleString()}</div>
                                        </div>

                                        <div className={`px-4 py-1.5 rounded-full border text-[10px] uppercase tracking-widest font-bold ${getStatusStyles(booking.status)}`}>
                                            {getStatusLabel(booking.status)}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            {booking.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                                                    disabled={updatingId === booking.id}
                                                    className="p-2 text-green-400 hover:bg-green-500/10 rounded-full transition-colors"
                                                    title="Confirmar"
                                                    aria-label={`Confirmar reserva #${booking.id}`}
                                                >
                                                    <CheckCircle2 size={20} />
                                                </button>
                                            )}
                                            {booking.status === 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'CHECKED_IN')}
                                                    disabled={updatingId === booking.id}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors"
                                                    title="Check-in"
                                                    aria-label={`Registrar check-in reserva #${booking.id}`}
                                                >
                                                    <Clock size={20} />
                                                </button>
                                            )}
                                            {booking.status !== 'CANCELLED' && booking.status !== 'CHECKED_OUT' && (
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                                                    disabled={updatingId === booking.id}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                                                    title="Cancelar"
                                                    aria-label={`Cancelar reserva #${booking.id}`}
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
