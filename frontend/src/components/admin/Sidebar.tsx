'use client';

import React, { useState } from 'react';
import { Home, BarChart3, LogOut, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { ResidenceForm } from './ResidenceForm';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = () => {
    const [roomsOpen, setRoomsOpen] = useState(false);
    const [showResidenceForm, setShowResidenceForm] = useState(false);
    const [residences, setResidences] = useState<any[]>([]);

    const pathname = usePathname();

    React.useEffect(() => {
        const fetchResidences = async () => {
            try {
                const { fetchApi } = await import('@/lib/api');
                const res = await fetchApi('/residences');
                setResidences(res.data);
            } catch (error) {
                console.error('Error fetching residences:', error);
            }
        };
        fetchResidences();
    }, []);

    const handleLogout = async () => {
        try {
            const { fetchApi } = await import('@/lib/api');
            await fetchApi('/auth/logout', { method: 'POST' });
        } catch {
            // continuar con el logout local aunque falle la petición
        }
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
    };

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="w-64 border-r border-white/5 flex flex-col p-6 space-y-10 bg-[#050505] shrink-0">
            <div className="text-primary font-bold tracking-widest text-xl">ÉCLAT ADMIN</div>

            <nav className="flex-1 space-y-2">
                <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/dashboard') ? 'bg-white/5 text-primary' : 'text-white/60 hover:text-white'
                        }`}
                >
                    <BarChart3 size={18} /> Dashboard
                </Link>

                <div className="space-y-1">
                    <button
                        onClick={() => setRoomsOpen(!roomsOpen)}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 transition-colors ${pathname.includes('/admin/rooms') ? 'text-primary' : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Home size={18} /> Habitaciones
                        </div>
                        <motion.div
                            animate={{ rotate: roomsOpen ? 0 : -180 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronUp size={14} />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {roomsOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="ml-9 space-y-1 border-l border-white/10 py-1">
                                    {residences.map((res) => (
                                        <Link
                                            key={res.id}
                                            href={`/admin/rooms?residence=${res.id}`}
                                            className={`block px-4 py-2 text-xs uppercase tracking-widest transition-colors ${pathname.includes(`/admin/rooms`) && new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('residence') === res.id
                                                ? 'text-primary'
                                                : 'text-white/40 hover:text-white'
                                                }`}
                                        >
                                            {res.name.toLowerCase().startsWith('sede') ? res.name : `Sede ${res.name}`}
                                        </Link>

                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <button
                    onClick={() => setShowResidenceForm(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[#B8860B] hover:text-primary transition-colors text-xs uppercase tracking-widest font-bold mt-4 border border-primary/20 bg-primary/5 rounded-md hover:bg-primary/10"
                >
                    <Plus size={16} /> Nueva Sede
                </button>
            </nav>


            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 text-red-500/80 hover:text-red-500 transition-colors"
            >
                <LogOut size={18} /> Cerrar Sesión
            </button>

            {showResidenceForm && (
                <ResidenceForm
                    onClose={() => setShowResidenceForm(false)}
                    onSave={() => {
                        window.location.reload();
                    }}
                />
            )}
        </aside>

    );
};
