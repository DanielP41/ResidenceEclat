'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Home, Calendar, Users, BarChart3, LogOut, Package, PieChart as PieChartIcon, ChevronDown, ChevronUp, Edit, Trash2 } from 'lucide-react';

import Link from 'next/link';
import { OccupancyChart } from '@/components/admin/OccupancyChart';
import { SkeletonStatCard, SkeletonChart } from '@/components/ui/Skeleton';
import { ResidenceForm } from '@/components/admin/ResidenceForm';
import { ConfirmModal } from '@/components/admin/ConfirmModal';
import { statsApi, observationsApi, fetchApi } from '@/lib/api';
import { residencesApi } from '@/lib/api';
import { toast } from 'sonner';


export default function AdminDashboard() {
    const [residences, setResidences] = useState<any[]>([]);
    const [selectedResidenceId, setSelectedResidenceId] = useState<number | undefined>(undefined); // undefined means Global
    const [editingResidence, setEditingResidence] = useState<any>(null);
    const [showResidenceForm, setShowResidenceForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


    const [stats, setStats] = useState({ rooms: 0, activeBookings: 0, occupancy: '0%', details: null as any });
    const [currentObs, setCurrentObs] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [roomsOpen, setRoomsOpen] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchResidences = async () => {
            try {
                const res = await fetchApi('/residences');
                setResidences(res.data);
            } catch (error) {
                console.error('Error fetching residences:', error);
            }
        };
        fetchResidences();
    }, []);


    // Load observation from API when residence changes
    useEffect(() => {
        if (!selectedResidenceId) {
            setCurrentObs('');
            return;
        }
        const fetchObs = async () => {
            try {
                const res = await observationsApi.get(selectedResidenceId);
                setCurrentObs(res.data?.content || '');
            } catch {
                setCurrentObs('');
            }
        };
        fetchObs();
    }, [selectedResidenceId]);


    // Auto-save with debounce
    const updateObservation = (value: string) => {
        setCurrentObs(value);
        if (!selectedResidenceId) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setSaving(true);
            try {
                await observationsApi.save(selectedResidenceId, value);
            } catch (e) {
                console.error('Error saving observation:', e);
            } finally {
                setSaving(false);
            }
        }, 1000);
    };


    // Manual save
    const saveNow = async () => {
        if (!selectedResidenceId) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSaving(true);
        setSaved(false);
        try {
            await observationsApi.save(selectedResidenceId, currentObs);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (e) {
            console.error('Error saving observation:', e);
        } finally {
            setSaving(false);
        }
    };


    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const response = await statsApi.getOccupancy(selectedResidenceId);
                if (response.status === 'success') {
                    setStats({
                        rooms: response.data.total,
                        activeBookings: response.data.occupied + response.data.reserved + response.data.partial,
                        occupancy: `${Math.round(response.data.percentages.occupied)}%`,
                        details: response.data
                    });
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [selectedResidenceId]);


    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
    };

    const handleEditResidence = () => {
        if (!selectedResidenceId) return;
        const res = residences.find(r => r.id === selectedResidenceId);
        if (res) {
            setEditingResidence(res);
            setShowResidenceForm(true);
        }
    };

    const handleDeleteResidence = async () => {
        if (!selectedResidenceId) return;
        try {
            await residencesApi.delete(selectedResidenceId);
            window.location.reload();
        } catch (error: any) {
            console.error('Error deleting residence:', error);
            const msg = error.message || 'Error al eliminar la sede';
            toast.error(`${msg}. Asegúrese de que no tenga datos que impidan el borrado.`);
        } finally {
            setShowDeleteConfirm(false);
        }
    };


    return (
        <div className="p-10">
            <div className="flex gap-2 mb-8 items-end overflow-x-auto pb-2 scrollbar-discrete">

                <button
                    onClick={() => setSelectedResidenceId(undefined)}
                    className={`px-6 py-3 text-sm font-medium tracking-wide transition-all border-t border-x border-white/10 rounded-t-xl ${!selectedResidenceId
                        ? 'bg-white/5 text-primary border-white/20'
                        : 'text-white/40 hover:text-white/60 hover:bg-white/5 border-transparent'
                        }`}
                >
                    Vista Global
                </button>
                {residences.map((res) => (
                    <button
                        key={res.id}
                        onClick={() => setSelectedResidenceId(res.id)}
                        className={`px-6 py-3 text-sm font-medium tracking-wide transition-all border-t border-x border-white/10 rounded-t-xl ${selectedResidenceId === res.id
                            ? 'bg-white/5 text-primary border-white/20'
                            : 'text-white/40 hover:text-white/60 hover:bg-white/5 border-transparent'
                            }`}
                    >
                        {res.name.toLowerCase().startsWith('sede') ? res.name : `Sede ${res.name}`}
                    </button>

                ))}
            </div>


            <header className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-serif">
                    {selectedResidenceId
                        ? (() => {
                            const res = residences.find(r => r.id === selectedResidenceId);
                            if (!res) return 'Vista Global';
                            return res.name.toLowerCase().startsWith('sede') ? res.name : `Sede ${res.name}`;
                        })()
                        : 'Vista Global'}
                </h1>

                <div className="flex items-center gap-6">
                    {selectedResidenceId && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleEditResidence}
                                className="p-2 bg-white/5 text-white/40 hover:text-primary transition-colors rounded border border-white/5"
                                title="Editar Sede"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="p-2 bg-white/5 text-white/40 hover:text-red-400 transition-colors rounded border border-white/5"
                                title="Eliminar Sede"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                </div>


            </header>


            {loading ? (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <SkeletonStatCard />
                        <SkeletonStatCard />
                        <SkeletonStatCard />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                            <SkeletonChart />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white/5 border border-white/10 p-8 rounded-lg">
                        <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Habitaciones</div>
                        <div className="text-4xl font-serif text-white">{stats.rooms}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-lg">
                        <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Reservas Activas</div>
                        <div className="text-4xl font-serif text-white">{stats.activeBookings}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-lg">
                        <div className="text-white/40 text-xs uppercase tracking-widest mb-2">Ocupación</div>
                        <div className="text-4xl font-serif text-primary">{stats.occupancy}</div>
                    </div>

                    <div className="md:col-span-2 bg-white/5 border border-white/10 p-8 rounded-lg min-h-[400px]">
                        <h3 className="text-white font-serif text-xl mb-6">Estado de Ocupación</h3>
                        <OccupancyChart data={stats.details || { occupied: 0, vacant: 0, reserved: 0, partial: 0 }} />
                    </div>

                    <div className="md:col-span-1 bg-white/5 border border-white/10 p-8 rounded-lg flex flex-col items-start justify-center">
                        <h3 className="text-white font-serif text-xl mb-6">Resumen</h3>
                        <div className="space-y-4 w-full">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-white/40">Habitaciones Totales</span>
                                <span className="text-white">{stats.rooms}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-orange-500/80 font-medium">Ocupadas</span>
                                <span className="text-white">{stats.details?.occupied || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-yellow-500/80 font-medium">1 Cama Disponible (Parcial)</span>
                                <span className="text-white">{stats.details?.partial || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-green-500/80 font-medium">Reservadas</span>
                                <span className="text-white">{stats.details?.reserved || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-blue-500/80 font-medium">Desocupadas</span>
                                <span className="text-white">{stats.details?.vacant || 0}</span>
                            </div>
                            {stats.details?.maintenance > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-red-500/80 font-medium">Mantenimiento</span>
                                    <span className="text-white">{stats.details.maintenance}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Observaciones Section */}
                    <div className="md:col-span-3 bg-white/5 border border-white/10 p-8 rounded-lg mt-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-serif text-xl">Observaciones:</h3>
                            {saving && <span className="text-white/30 text-xs uppercase tracking-widest">Guardando...</span>}
                        </div>
                        <textarea
                            value={currentObs}
                            onChange={(e) => updateObservation(e.target.value)}
                            placeholder="Escribe aquí notas internas o recordatorios sobre esta sede y/o residentes..."
                            className="w-full h-40 bg-black/20 border border-white/5 rounded-md p-4 text-white/70 placeholder:text-white/10 focus:outline-none focus:border-primary/30 transition-colors resize-none text-sm leading-relaxed"
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={saveNow}
                                disabled={saving}
                                className="px-6 py-2 border border-primary/40 text-primary text-xs uppercase tracking-widest hover:bg-primary hover:text-black transition-all disabled:opacity-30"
                            >
                                {saving ? 'Guardando...' : saved ? 'Guardado ✓' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteConfirm && (
                <ConfirmModal
                    title="Eliminar Sede"
                    message={`¿Estás seguro de eliminar la sede "${residences.find(r => r.id === selectedResidenceId)?.name}"? Se perderán todas las habitaciones y datos asociados.`}
                    confirmLabel="Eliminar Sede"
                    onConfirm={handleDeleteResidence}
                    onCancel={() => setShowDeleteConfirm(false)}
                />
            )}

            {showResidenceForm && (
                <ResidenceForm
                    residence={editingResidence}
                    onClose={() => {
                        setShowResidenceForm(false);
                        setEditingResidence(null);
                    }}
                    onSave={() => {
                        window.location.reload(); // Quick refresh to show new residence
                    }}
                />
            )}
        </div>
    );
}



