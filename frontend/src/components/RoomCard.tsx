'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Mail, Instagram, X, Maximize2 } from 'lucide-react';
import { WhatsAppIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

interface RoomCardProps {
    room: {
        id: number;
        name: string;
        price: string | number;
        capacity: number;
        status: 'AVAILABLE' | 'PARTIAL_1' | 'PARTIAL_2' | 'PARTIAL_3' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
        amenities: string[];
        images: string[];
    };
}

export default function RoomCard({ room }: RoomCardProps) {
    const { t } = useLanguage();
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const defaultImage = "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974";
    const displayImage = room.images?.[0] || defaultImage;
    const roomNames = (t.room as any)?.room_names || {};
    const displayName = roomNames[room.name] || room.name;

    const getStatusLabel = (status: string) => {
        const s = t.room?.status || {};
        switch (status) {
            case 'AVAILABLE': return s.available || 'Available';
            case 'PARTIAL_1': return s.partial_1 || '1 Bed Available';
            case 'PARTIAL_2': return s.partial_2 || '2 Beds Available';
            case 'PARTIAL_3': return s.partial_3 || '3 Beds Available';
            case 'OCCUPIED': return s.occupied || 'Occupied';
            case 'RESERVED': return s.reserved || 'Reserved';
            case 'MAINTENANCE': return s.maintenance || 'Maintenance';
            default: return '';
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'AVAILABLE': return 'bg-blue-500/80 text-white';
            case 'PARTIAL_1':
            case 'PARTIAL_2':
            case 'PARTIAL_3': return 'bg-yellow-500/80 text-black';
            case 'OCCUPIED': return 'bg-orange-500/80 text-white';
            case 'RESERVED': return 'bg-green-500/80 text-white';
            case 'MAINTENANCE': return 'bg-red-500/80 text-white';
            default: return 'bg-white/10 text-white';
        }
    };

    const gmailLink = `mailto:residenciaeclat@gmail.com?subject=${encodeURIComponent(t.room?.inquiry_subject || 'Inquiry')} ${room.name}`;
    const igLink = "https://www.instagram.com/residencia.eclat/";
    const waLink = `https://wa.me/5491135877019?text=${encodeURIComponent(t.room?.wa_message || 'Hello! I want to inquire about')}%20${encodeURIComponent(room.name)}`;

    return (
        <>
            <div className="group bg-black/40 backdrop-blur-sm border border-white/5 overflow-hidden hover:border-[#c5a059]/40 transition-all duration-500">
                {/* Image Section */}
                <div className="relative h-60 overflow-hidden cursor-pointer bg-[#0a0f1e]" onClick={() => setIsLightboxOpen(true)}>
                    <Image
                        src={displayImage}
                        alt={room.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Status Badge */}
                    <div className={`absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-widest z-10 shadow-lg ${getStatusStyles(room.status)}`}>
                        {getStatusLabel(room.status)}
                    </div>

                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />


                    {/* Expand Icon on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-[#c5a059] p-2 text-black shadow-2xl">
                            <Maximize2 size={20} />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                    <h3 className="text-xl font-serif text-white mb-6 text-center">{displayName}</h3>

                    {/* Inquiry Section */}
                    <div className="pt-4 border-t border-white/5 text-center">
                        <p className={`text-[11px] uppercase tracking-[0.2em] mb-4 ${room.status === 'OCCUPIED' ? 'text-orange-400' : 'text-white/40'}`}>
                            {room.status === 'OCCUPIED'
                                ? (t.room?.consult_next || 'Check next available date')
                                : room.status === 'MAINTENANCE'
                                    ? (t.room?.out_of_service || 'Room out of service')
                                    : t.common.consult_availability}
                        </p>

                        <div className="flex justify-center items-center gap-6">
                            <a
                                href={gmailLink}
                                className="text-white/60 hover:text-primary transition-all hover:scale-110 flex items-center gap-2 text-xs uppercase tracking-widest font-bold"
                                title="Enviar Email"
                            >
                                <Mail size={18} />
                                Gmail
                            </a>
                            <span className="text-white/10">|</span>
                            <a
                                href={igLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/60 hover:text-primary transition-all hover:scale-110 flex items-center gap-2 text-xs uppercase tracking-widest font-bold"
                                title="Visitar Instagram"
                            >
                                <Instagram size={18} />
                                IG
                            </a>
                            <span className="text-white/10">|</span>
                            <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/60 hover:text-primary transition-all hover:scale-110 flex items-center gap-2 text-xs uppercase tracking-widest font-bold"
                                title="WhatsApp"
                            >
                                <WhatsAppIcon size={18} />
                                WA
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Overlay */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-10"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <button
                            className="absolute top-10 right-10 text-white/60 hover:text-white transition-colors"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <X size={32} />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl aspect-video shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={displayImage}
                                alt={room.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <h2 className="text-2xl font-serif text-white">{displayName}</h2>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
