'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BedDouble, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { roomsApi, residencesApi } from '@/lib/api';

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
        mapMarkers: [{ name: 'Parque Avellaneda I', lat: -34.6370, lng: -58.3980 }],
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
        mapMarkers: [{ name: 'Parque Avellaneda II', lat: -34.6355, lng: -58.3950 }],
        images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
            'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        ],
    },
};

import { useLanguage } from '@/context/LanguageContext';
import { SkeletonResidenceDetail } from '@/components/ui/Skeleton';

export default function ResidenceDetailPage() {
    const { t } = useLanguage();
    const params = useParams();
    const id = params?.id as string;
    const [residence, setResidence] = useState<any>(null);
    const [roomCount, setRoomCount] = useState<number | null>(null);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const closeLightbox = useCallback(() => setLightboxSrc(null), []);



    useEffect(() => {
        if (id) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const res = await residencesApi.getById(id);
                    setResidence(res.data);

                    const roomsRes = await roomsApi.getAll(parseInt(id));
                    setRoomCount(roomsRes.data?.length ?? 0);
                } catch (error) {
                    console.error('Error fetching residence detail:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [id]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeLightbox(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [closeLightbox]);

    if (loading) {
        return <SkeletonResidenceDetail />;
    }

    if (!residence) {
        return (
            <div className="min-h-screen bg-[#050a1f] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60 mb-4">{t.common.not_found}</p>
                    <Link href="/" className="text-[#c5a059] hover:underline">{t.common.back_home}</Link>
                </div>
            </div>
        );
    }

    // Mapping new IDs to legacy assets
    const legacyId = id === '1' ? 'A' : id === '2' ? 'C' : id === '3' ? 'B' : null;

    // Resolve dynamic data from residence object
    const dynamicImages = Array.isArray(residence.images) && residence.images.length > 0
        ? residence.images
        : [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
            'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
        ];

    const info = legacyId ? RESIDENCE_INFO[legacyId] : {
        mapCenter: [-34.6037, -58.3816] as [number, number],
        mapZoom: 13,
        mapMarkers: [{ name: residence.name, lat: -34.6037, lng: -58.3816 }],
        images: dynamicImages,
    };

    // Use legacy photos for original residences to maintain design quality
    if (legacyId) {
        info.images = RESIDENCE_INFO[legacyId].images;
    }


    // @ts-ignore
    const tInfo = legacyId ? t.residences[legacyId] : {
        title: `Sede ${residence.name}`,
        description: residence.description || 'Una de nuestras sedes exclusivas para estudiantes y profesionales.',
        comfort: 'Diseñada para ofrecer la máxima comodidad y un ambiente de estudio ideal.'
    };

    const paginate = (newDirection: number) => {
        setDirection(newDirection);
        setCurrentImageIndex((prev) => {
            let next = prev + newDirection;
            const max = Math.min(info.images.length, 6);
            if (next >= max) return 0;
            if (next < 0) return max - 1;
            return next;
        });
    };

    const setPage = (index: number) => {
        setDirection(index > currentImageIndex ? 1 : -1);
        setCurrentImageIndex(index);
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };


    return (
        <div className="min-h-screen bg-[#050a1f] text-white overflow-hidden relative">
            {/* Background for Residence A */}
            {legacyId === 'A' && (
                <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/san-telmo-bg.jpg')] bg-cover bg-center blur-[4px] scale-105" />
                    <div className="absolute inset-0 bg-[#050a1f]/30 backdrop-blur-[1px]" />
                </div>
            )}

            {/* Background for Residence B */}
            {legacyId === 'B' && (
                <div className="absolute inset-0 z-0 h-full w-full">
                    <div className="absolute inset-0 bg-[url('/images/residence-b.jpg')] bg-cover bg-top" />
                    <div className="absolute inset-0 bg-[#050a1f]/70 backdrop-blur-[1px]" />
                </div>
            )}

            {/* Background for Residence C */}
            {legacyId === 'C' && (
                <div className="absolute inset-0 z-0 h-full w-full">
                    <div className="absolute inset-0 bg-[url('/images/residence-c.jpg')] bg-cover bg-top" />
                    <div className="absolute inset-0 bg-[#050a1f]/70 backdrop-blur-[1px]" />
                </div>
            )}

            {/* Default Background for new residences */}
            {!legacyId && (
                <div className="absolute inset-0 z-0 h-full w-full">
                    <div className="absolute inset-0 bg-[url('/images/hero-obelisco.jpg')] bg-cover bg-center blur-[4px]" />
                    <div className="absolute inset-0 bg-[#050a1f]/80 backdrop-blur-[1px]" />
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

                {/* 2x2 Photo grid replaced by Carousel */}
                <div className="relative group overflow-hidden rounded-sm border border-[#c5a059]/20" style={{ aspectRatio: '16/9' }}>
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.img
                            key={currentImageIndex}
                            src={info.images[currentImageIndex]}
                            custom={direction}
                            variants={{
                                enter: (direction: number) => ({
                                    x: direction > 0 ? 1000 : -1000,
                                    opacity: 0
                                }),
                                center: {
                                    zIndex: 1,
                                    x: 0,
                                    opacity: 1
                                },
                                exit: (direction: number) => ({
                                    zIndex: 0,
                                    x: direction < 0 ? 1000 : -1000,
                                    opacity: 0
                                })
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x);

                                if (swipe < -swipeConfidenceThreshold) {
                                    paginate(1);
                                } else if (swipe > swipeConfidenceThreshold) {
                                    paginate(-1);
                                }
                            }}
                            className="absolute w-full h-full object-cover cursor-zoom-in"
                            onClick={() => setLightboxSrc(info.images[currentImageIndex])}
                        />
                    </AnimatePresence>

                    {/* Arrows */}
                    {info.images.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-[#c5a059] hover:text-[#050a1f] transition-all opacity-0 group-hover:opacity-100"
                                onClick={(e) => { e.stopPropagation(); paginate(-1); }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-[#c5a059] hover:text-[#050a1f] transition-all opacity-0 group-hover:opacity-100"
                                onClick={(e) => { e.stopPropagation(); paginate(1); }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}

                    {/* Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                        {info.images.slice(0, 6).map((_: string, i: number) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setPage(i); }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentImageIndex
                                    ? 'bg-[#c5a059] w-4'
                                    : 'bg-white/40 hover:bg-white/60'
                                    }`}
                                aria-label={`Go to image ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Comfort text */}
                <p className="text-white/60 text-base leading-relaxed">
                    {tInfo.comfort}
                </p>

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
