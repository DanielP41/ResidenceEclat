'use client';

import React, { useState } from 'react';
import { Home, Calendar, BarChart3, LogOut, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = () => {
    const [roomsOpen, setRoomsOpen] = useState(true);
    const pathname = usePathname();

    const residences = [
        { id: 'A', label: 'San Telmo' },
        { id: 'B', label: 'Parque Patricios I' },
        { id: 'C', label: 'Parque Patricios II' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
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
                                            {res.label}
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <Link
                    href="/admin/bookings"
                    className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive('/admin/bookings') ? 'bg-white/5 text-primary' : 'text-white/60 hover:text-white'
                        }`}
                >
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
    );
};
