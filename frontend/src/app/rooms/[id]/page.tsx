'use client';

import React, { useEffect, useState } from 'react';
import { roomsApi } from '@/lib/api';
import BookingForm from '@/components/BookingForm';
import { Wifi, Users, Wind, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { useLanguage } from '@/context/LanguageContext';

const RESIDENCE_NAMES: Record<string, string> = {
    'A': 'Sede San Telmo',
    'B': 'Sede Parque Patricios I',
    'C': 'Sede Parque Patricios II'
};

export default function RoomDetailPage({ params }: { params: { id: string } }) {
    const { t } = useLanguage();
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        roomsApi.getById(params.id)
            .then(res => {
                setRoom(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [params.id]);

    if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white/40">{t.common.loading || 'Cargando...'}</div>;
    if (!room) return <div className="h-screen flex items-center justify-center bg-black text-white/40">{t.common.not_found || 'Habitación no encontrada.'}</div>;

    return (
        <div className="bg-black min-h-screen text-white pb-20">
            {/* Visual Header */}
            <div className="relative h-[60vh] w-full">
                <Image
                    src={room.images?.[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974'}
                    alt={room.name}
                    fill
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black" />
                <Link href="/rooms" className="absolute top-10 left-10 flex items-center gap-2 text-white/80 hover:text-primary transition-colors text-sm uppercase tracking-widest">
                    <ArrowLeft size={16} /> {t.common.back_list || 'Volver a la lista'}
                </Link>
            </div>

            <div className="max-w-7xl mx-auto px-10 -mt-20 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-16">
                {/* Info Column */}
                <div className="lg:col-span-3 space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-12 border-b border-white/5">
                        <div>
                            <h1 className="text-5xl md:text-7xl font-serif mb-2">{room.name}</h1>
                            {room.residence && RESIDENCE_NAMES[room.residence] && (
                                <p className="text-white/60 text-xl font-serif mb-4">
                                    ({RESIDENCE_NAMES[room.residence]})
                                </p>
                            )}
                            <div className="flex items-center gap-4 text-white/40 text-sm">
                                <span className="flex items-center gap-2"><Users size={16} /> {room.capacity} Personas</span>
                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="flex items-center gap-2"><Wifi size={16} /> Alta Velocidad</span>
                                <span className="w-1 h-1 bg-white/20 rounded-full" />
                                <span className="flex items-center gap-2"><Wind size={16} /> Climatizada</span>
                            </div>
                        </div>
                        {/* Price temporarily removed per user request */}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-8">
                        <div className="space-y-10">
                            <div>
                                <h3 className="text-sm uppercase tracking-[0.3em] text-primary mb-6">Descripción</h3>
                                <p className="text-white/60 leading-relaxed font-light text-xl">
                                    {room.description || 'Disfruta de una estadía cómoda en nuestra residencia. Esta habitación ha sido diseñada para ofrecer comodidad funcional.'}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm uppercase tracking-[0.3em] text-primary mb-6">Amenidades</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {room.amenities?.map((amenity: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 text-white/40 text-xs uppercase tracking-widest py-3 px-4 bg-white/5 border border-white/5">
                                            <div className="w-1 h-1 bg-primary rounded-full" /> {amenity}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h3 className="text-sm uppercase tracking-[0.3em] text-primary">Disponibilidad y Reservas</h3>
                            <BookingCalendar roomId={room.id} price={Number(room.price)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
