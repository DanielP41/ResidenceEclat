'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Home, Calendar, Users, BarChart3, LogOut, Package, PieChart as PieChartIcon } from 'lucide-react';
import Link from 'next/link';
import { statsApi, observationsApi } from '@/lib/api';
import { OccupancyChart } from '@/components/admin/OccupancyChart';

export default function AdminDashboard() {
    const [selectedResidence, setSelectedResidence] = useState<string | undefined>(undefined); // undefined means Global
    const [stats, setStats] = useState({ rooms: 0, activeBookings: 0, occupancy: '0%', details: null as any });
    const [currentObs, setCurrentObs] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const residences = [
        { id: 'A', label: 'Sede San Telmo' },
        { id: 'B', label: 'Sede Parque Patricios I' },
        { id: 'C', label: 'Sede Parque Patricios II' },
        { id: 'global', label: 'Vista Global' },
    ];

    // Load observation from API when residence changes
    useEffect(() => {
        const key = selectedResidence || 'global';
        const fetchObs = async () => {
            try {
                const res = await observationsApi.get(key);
                setCurrentObs(res.data?.content || '');
            } catch {
                setCurrentObs('');
            }
        };
        fetchObs();
    }, [selectedResidence]);

    // Auto-save with debounce
    const updateObservation = (value: string) => {
        setCurrentObs(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            const key = selectedResidence || 'global';
            setSaving(true);
            try {
                await observationsApi.save(key, value);
            } catch (e) {
                console.error('Error saving observation:', e);
            } finally {
                setSaving(false);
            }
        }, 1000);
    };

    // Manual save
    const saveNow = async () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const key = selectedResidence || 'global';
        setSaving(true);
        setSaved(false);
        try {
            await observationsApi.save(key, currentObs);
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
                const response = await statsApi.getOccupancy(selectedResidence);
                if (response.status === 'success') {
                    setStats({
                        rooms: response.data.total,
                        activeBookings: response.data.occupied + response.data.reserved,
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
    }, [selectedResidence]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
    };

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/5 flex flex-col p-6 space-y-10">
                <div className="text-primary font-bold tracking-widest text-xl">ÉCLAT ADMIN</div>

                <nav className="flex-1 space-y-2">
                    <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 bg-white/5 text-primary rounded-md">
                        <BarChart3 size={18} /> Dashboard
                    </Link>
                    <Link href="/admin/rooms" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white transition-colors">
                        <Home size={18} /> Habitaciones
                    </Link>
                    <Link href="/admin/bookings" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white transition-colors">
                        <Calendar size={18} /> Reservas
                    </Link>

                </nav>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 text-red-500/80 hover:text-red-500 transition-colors"
                >
                    <LogOut size={18} /> Cerrar Sesión
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto">
                <div className="flex gap-2 mb-8 items-end">
                    {residences.map((res) => (
                        <button
                            key={res.label}
                            onClick={() => setSelectedResidence(res.id === 'global' ? undefined : res.id)}
                            className={`px-6 py-3 text-sm font-medium tracking-wide transition-all border-t border-x border-white/10 rounded-t-xl ${(res.id === (selectedResidence || 'global'))
                                ? 'bg-white/5 text-primary border-white/20'
                                : 'text-white/40 hover:text-white/60 hover:bg-white/5 border-transparent'
                                }`}
                        >
                            {res.label}
                        </button>
                    ))}
                </div>

                <header className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-serif">
                        {selectedResidence
                            ? residences.find(r => r.id === selectedResidence)?.label
                            : 'Vista Global'}
                    </h1>
                    <div className="text-white/40 text-sm">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </header>

                {loading ? (
                    <div className="text-white/20 uppercase tracking-widest text-xs">Sincronizando datos...</div>
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
                            <OccupancyChart data={stats.details || { occupied: 0, vacant: 0, reserved: 0 }} />
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
                                    <span className="text-blue-500/80 font-medium">Desocupadas</span>
                                    <span className="text-white">{stats.details?.vacant || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-green-500/80 font-medium">Reservadas</span>
                                    <span className="text-white">{stats.details?.reserved || 0}</span>
                                </div>
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
            </main>
        </div>
    );
}
