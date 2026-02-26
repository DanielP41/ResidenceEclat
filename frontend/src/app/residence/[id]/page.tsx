'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BedDouble, X } from 'lucide-react';
import { roomsApi } from '@/lib/api';
import dynamic from 'next/dynamic';

const NeighborhoodMap = dynamic(() => import('@/components/NeighborhoodMap'), { ssr: false });

const RESIDENCE_INFO: Record<string, {
    mapCenter: [number, number];
    mapZoom: number;
    mapMarkers: { name: string; lat: number; lng: number }[];
    images: string[];
}> = {
    A: {
        mapCenter: [-34.6205, -58.3728] as [number, number],
        mapZoom: 16,
        mapMarkers: [{ name: 'Carlos Calvo 875', lat: -34.6205, lng: -58.3728 }],
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
            'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        ],
    },
    B: {
        mapCenter: [-34.6370, -58.3980] as [number, number],
        mapZoom: 15,
        mapMarkers: [{ name: 'Parque Patricios I', lat: -34.6370, lng: -58.3980 }],
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
            'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        ],
    },
    C: {
        mapCenter: [-34.6355, -58.3950] as [number, number],
        mapZoom: 15,
        mapMarkers: [{ name: 'Parque Patricios II', lat: -34.6355, lng: -58.3950 }],
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
            'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        ],
    },
};

import { useLanguage } from '@/context/LanguageContext';

export default function ResidenceDetailPage() {
    const { t } = useLanguage();
    const params = useParams();
    const id = (params?.id as string)?.toUpperCase();
    const [roomCount, setRoomCount] = useState<number | null>(null);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    const closeLightbox = useCallback(() => setLightboxSrc(null), []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [closeLightbox]);

    const info = RESIDENCE_INFO[id];
    // @ts-ignore
    const tInfo = t.residences[id];

    useEffect(() => {
        if (id) {
            roomsApi.getAll(id)
                .then(res => setRoomCount(res.data?.length ?? 0))
                .catch(() => setRoomCount(null));
        }
    }, [id]);

    if (!info || !tInfo) {
        return (
            <div className="min-h-screen bg-[#050a1f] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60 mb-4">{t.common.not_found}</p>
                    <Link href="/" className="text-[#c5a059] hover:underline">{t.common.back_home}</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050a1f] text-white overflow-hidden relative">
            {/* Background for Residence A */}
            {id === 'A' && (
                <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/san-telmo-bg.jpg')] bg-cover bg-center blur-[4px] scale-105" />
                    <div className="absolute inset-0 bg-[#050a1f]/30 backdrop-blur-[1px]" />
                </div>
            )}

            {/* Background for Residence B */}
            {id === 'B' && (
                <div className="absolute inset-0 z-0 h-full w-full">
                    <div className="absolute inset-0 bg-[url('/images/residence-b.jpg')] bg-cover bg-top" />
                    <div className="absolute inset-0 bg-[#050a1f]/70 backdrop-blur-[1px]" />
                </div>
            )}

            {/* Background for Residence C */}
            {id === 'C' && (
                <div className="absolute inset-0 z-0 h-full w-full">
                    <div className="absolute inset-0 bg-[url('/images/residence-c.jpg')] bg-cover bg-top" />
                    <div className="absolute inset-0 bg-[#050a1f]/70 backdrop-blur-[1px]" />
                </div>
            )}

            {/* Back Navigation */}
            <div className="fixed top-0 left-0 w-full z-50 py-5 px-8 flex items-center gap-4 bg-[#050a1f]/80 backdrop-blur-xl border-b border-[#c5a059]/10">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-[#c5a059]/70 hover:text-[#c5a059] transition-colors text-sm tracking-widest uppercase"
                >
                    <ArrowLeft size={16} />
                    {t.common.back}
                </Link>
                <span className="text-white/20">|</span>
                <span className="text-white/40 text-sm tracking-widest uppercase font-serif">
                    {tInfo.title}
                </span>
            </div>

            {/* Main Content */}
            <main className="relative z-10 pt-40 pb-20 px-6 md:px-12 max-w-4xl mx-auto">

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-28 text-center"
                >
                    <p className="text-[#c5a059] text-xs uppercase tracking-[0.4em] mb-3">Residencia Éclat</p>
                    <h1 className="text-4xl md:text-5xl font-serif flex flex-col items-center gap-2">
                        {tInfo.title.includes('(') ? (
                            <>
                                <span>{tInfo.title.split('(')[0].trim()}</span>
                                <span className="text-2xl md:text-3xl text-white/60">({tInfo.title.split('(')[1]}</span>
                            </>
                        ) : (
                            tInfo.title
                        )}
                    </h1>
                </motion.div>

                {/* Row 1: Map + Description */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-32 items-center"
                >
                    {/* Leaflet Map */}
                    <div className="rounded-sm overflow-hidden border border-[#c5a059]/20 h-56 md:h-64">
                        <NeighborhoodMap
                            markers={info.mapMarkers}
                            center={info.mapCenter}
                            zoom={info.mapZoom}
                            minHeight="100%"
                        />
                    </div>

                    {/* Description */}
                    <p className="text-white/60 text-lg leading-relaxed">
                        {tInfo.description}
                    </p>
                </motion.div>

                {/* Row 2: Photos 2x2 + Comfort Text */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 items-center"
                >
                    {/* 2x2 Photo grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {info.images.map((src, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="relative overflow-hidden rounded-sm border border-[#c5a059]/10 group cursor-zoom-in"
                                style={{ aspectRatio: '4/3' }}
                                onClick={() => setLightboxSrc(src)}
                            >
                                <img
                                    src={src}
                                    alt={`${tInfo.title} - Foto ${i + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-[#050a1f]/20 group-hover:bg-transparent transition-colors duration-300" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Comfort text */}
                    <p className="text-white/60 text-base leading-relaxed">
                        {tInfo.comfort}
                    </p>
                </motion.div>

                {/* HABITACIONES Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                    className="flex justify-center"
                >
                    <Link
                        href={`/rooms?residence=${id}`}
                        className="flex items-center gap-3 px-12 py-4 border border-[#c5a059] text-[#c5a059] font-serif text-sm tracking-[0.3em] uppercase hover:bg-[#c5a059] hover:text-[#050a1f] transition-all duration-300 group bg-[#050a1f]/80 backdrop-blur-md"
                    >
                        <BedDouble size={18} className="group-hover:scale-110 transition-transform" />
                        {t.nav.rooms}
                    </Link>
                </motion.div>
            </main>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxSrc && (
                    <motion.div
                        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                    >
                        <button
                            onClick={closeLightbox}
                            className="absolute top-5 right-5 text-white/60 hover:text-white transition-colors"
                        >
                            <X size={28} />
                        </button>
                        <motion.img
                            src={lightboxSrc}
                            alt="Foto ampliada"
                            className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
