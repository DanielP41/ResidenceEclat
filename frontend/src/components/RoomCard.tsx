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
        amenities: string[];
        images: string[];
    };
}

export default function RoomCard({ room }: RoomCardProps) {
    const { t } = useLanguage();
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    const defaultImage = "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974";
    const displayImage = room.images?.[0] || defaultImage;

    const gmailLink = `mailto:residenciaeclat@gmail.com?subject=Consulta sobre ${room.name}`;
    const igLink = "https://www.instagram.com/residencia.eclat/";
    const waLink = `https://wa.me/5491135877019?text=Hola!%20Quiero%20consultar%20sobre%20la%20habitación%20${encodeURIComponent(room.name)}`;

    return (
        <>
            <div className="group bg-black/40 backdrop-blur-sm border border-white/5 overflow-hidden hover:border-[#c5a059]/40 transition-all duration-500">
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden cursor-pointer" onClick={() => setIsLightboxOpen(true)}>
                    <Image
                        src={displayImage}
                        alt={room.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
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
                    <h3 className="text-xl font-serif text-white mb-6 text-center">{room.name}</h3>

                    {/* Inquiry Section */}
                    <div className="pt-4 border-t border-white/5 text-center">
                        <p className="text-white/40 text-[11px] uppercase tracking-[0.2em] mb-4">
                            {t.common.consult_availability}
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
                                <h2 className="text-2xl font-serif text-white">{room.name}</h2>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
