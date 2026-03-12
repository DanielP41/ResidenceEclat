'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { roomsApi } from '@/lib/api';
import { BedDouble, CheckCircle2, Clock, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { RoomForm } from '@/components/admin/RoomForm';

interface Room {
    id: number;
    name: string;
    type: string;
    capacity: number;
    status: 'AVAILABLE' | 'PARTIAL_1' | 'PARTIAL_2' | 'PARTIAL_3' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
    price: number;
    residence: string;
}

export default function AdminRooms() {
    const searchParams = useSearchParams();
    const residenceId = searchParams.get('residence') || 'A';
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingRoom, setEditingRoom] = useState<any>(null);

    const residenceNames: Record<string, string> = {
        'A': 'San Telmo',
        'B': 'Parque Avellaneda I',
        'C': 'Parque Avellaneda II'
    };

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const response = await roomsApi.getAll(residenceId);
            if (response.status === 'success') {
                setRooms(response.data);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [residenceId]);

    const handleStatusChange = async (roomId: number, newStatus: string) => {
        setUpdatingId(roomId);
        try {
            await roomsApi.updateStatus(roomId, newStatus);
            // Optimistic update
            setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus as any } : r));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar el estado');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleSaveRoom = async (data: any) => {
        try {
            if (editingRoom) {
                await roomsApi.update(editingRoom.id, data);
            } else {
                await roomsApi.create(data);
            }
            setShowForm(false);
            setEditingRoom(null);
            fetchRooms();
        } catch (error) {
            console.error(error);
            alert('Error al guardar la habitación');
        }
    };

    const handleDeleteRoom = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar esta habitación?')) return;
        try {
            await roomsApi.delete(id);
            fetchRooms();
        } catch (error) {
            console.error(error);
            alert('Error al eliminar');
        }
    };

    const filteredRooms = rooms;

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'PARTIAL_1': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'OCCUPIED': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'RESERVED': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'MAINTENANCE': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-white/5 text-white/40 border-white/10';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return <CheckCircle2 size={14} />;
            case 'PARTIAL_1': return <Clock size={14} className="opacity-70" />;
            case 'OCCUPIED': return <Clock size={14} />;
            case 'RESERVED': return <XCircle size={14} />;
            default: return null;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'Disponible';
            case 'PARTIAL_1': return '1 Cama Disponible';
            case 'OCCUPIED': return 'Ocupada';
            case 'RESERVED': return 'Reservada';
            case 'MAINTENANCE': return 'Mantenimiento';
            default: return status;
        }
    };


    return (
        <div className="p-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <div className="text-primary text-xs uppercase tracking-[0.2em] mb-1">Gestión de Habitaciones</div>
                    <h1 className="text-3xl font-serif">Sede {residenceNames[residenceId]}</h1>
                </div>
                <button
                    onClick={() => { setEditingRoom(null); setShowForm(true); }}
                    className="flex items-center gap-2 bg-primary text-black px-6 py-3 font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all rounded-sm"
                >
                    <Plus size={18} />
                    Nueva Habitación
                </button>
            </header>

            {loading ? (
                <div className="text-white/20 uppercase tracking-widest text-xs">Cargando habitaciones...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRooms.map((room) => (
                        <div key={room.id} className="bg-white/5 border border-white/10 p-6 rounded-lg group hover:border-primary/20 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/5 rounded-md text-primary">
                                        <BedDouble size={24} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider border flex items-center gap-1.5 ${getStatusStyles(room.status)}`}>
                                            {getStatusIcon(room.status)}
                                            {getStatusLabel(room.status)}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => { setEditingRoom(room); setShowForm(true); }}
                                                className="p-1.5 bg-white/5 text-white/40 hover:text-primary transition-colors rounded border border-white/5"
                                                title="Editar"
                                            >
                                                <Edit size={12} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="p-1.5 bg-white/5 text-white/40 hover:text-red-400 transition-colors rounded border border-white/5"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="text-xl font-serif text-white mb-1">{room.name}</div>
                                    <div className="text-white/40 text-xs uppercase tracking-widest">{room.type || (room.capacity > 1 ? `Capacidad: ${room.capacity}` : 'Individual')}</div>
                                    <div className="text-primary/60 text-sm mt-2 font-mono">${parseFloat(room.price.toString()).toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center mb-4 text-sm">
                                    <span className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">Cambiar estado rápido:</span>
                                    {updatingId === room.id && <span className="text-primary animate-pulse text-[10px] uppercase">...</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleStatusChange(room.id, 'AVAILABLE')}
                                        disabled={room.status === 'AVAILABLE' || updatingId !== null}
                                        className={`px-3 py-2 text-[9px] border border-white/10 uppercase tracking-widest transition-all hover:bg-white/5 disabled:opacity-30 ${room.status === 'AVAILABLE' ? 'text-primary border-primary/40 bg-primary/5' : 'text-white/40'}`}
                                    >
                                        Liberar
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(room.id, 'OCCUPIED')}
                                        disabled={room.status === 'OCCUPIED' || updatingId !== null}
                                        className={`px-3 py-2 text-[9px] border border-white/10 uppercase tracking-widest transition-all hover:bg-white/5 disabled:opacity-30 ${room.status === 'OCCUPIED' ? 'text-orange-400 border-orange-400/40 bg-orange-400/5' : 'text-white/40'}`}
                                    >
                                        Ocupar
                                    </button>

                                    {/* Partial Buttons based on capacity */}
                                    {(residenceId !== 'A' || room.capacity >= 2) && (
                                        <button
                                            onClick={() => handleStatusChange(room.id, 'PARTIAL_1')}
                                            disabled={room.status === 'PARTIAL_1' || updatingId !== null}
                                            className={`px-3 py-2 text-[9px] border border-white/10 uppercase tracking-widest transition-all hover:bg-white/5 disabled:opacity-30 ${room.status === 'PARTIAL_1' ? 'text-yellow-400 border-yellow-400/40 bg-yellow-400/5' : 'text-white/40'}`}
                                        >
                                            1 Cama
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleStatusChange(room.id, 'RESERVED')}
                                        disabled={room.status === 'RESERVED' || updatingId !== null}
                                        className={`px-3 py-2 text-[9px] border border-white/10 uppercase tracking-widest transition-all hover:bg-white/5 disabled:opacity-30 ${room.status === 'RESERVED' ? 'text-green-400 border-green-400/40 bg-green-400/5' : 'text-white/40'}`}
                                    >
                                        Reservar
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(room.id, 'MAINTENANCE')}
                                        disabled={room.status === 'MAINTENANCE' || updatingId !== null}
                                        className={`col-span-2 px-3 py-2 text-[9px] border border-white/10 uppercase tracking-widest transition-all hover:bg-white/5 disabled:opacity-30 ${room.status === 'MAINTENANCE' ? 'text-red-400 border-red-400/40 bg-red-400/5' : 'text-white/40'}`}
                                    >
                                        Mantenimiento
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showForm && (
                <RoomForm
                    room={editingRoom}
                    onClose={() => { setShowForm(false); setEditingRoom(null); }}
                    onSave={handleSaveRoom}
                />
            )}
        </div>
    );
}
