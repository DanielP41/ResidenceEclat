'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { roomsApi } from '@/lib/api';
import RoomCard from '@/components/RoomCard';
import { Search, Building, Filter } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { useLanguage } from '@/context/LanguageContext';
import { SkeletonRoomsGrid } from '@/components/ui/Skeleton';

// Maps numeric residence DB IDs to the letter keys used in translations
const ID_TO_LETTER: Record<string, string> = { '1': 'A', '2': 'C', '3': 'B' };

function RoomsContent() {
    const { t } = useLanguage();
    const [rooms, setRooms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const searchParams = useSearchParams();
    const [selectedResidence, setSelectedResidence] = useState(searchParams.get('residence') || '');

    useEffect(() => {
        const residence = searchParams.get('residence') || '';
        setSelectedResidence(residence);
    }, [searchParams]);

    const residenceLetter = ID_TO_LETTER[selectedResidence] || '';

    useEffect(() => {
        setLoading(true);
        const idNum = selectedResidence ? parseInt(selectedResidence, 10) : undefined;
        roomsApi.getAll(!idNum || isNaN(idNum) ? undefined : idNum)
            .then(res => {
                setRooms(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError('No se pudieron cargar las habitaciones.');
                setLoading(false);
            });
    }, [selectedResidence]);

    return (
        <div className="bg-[#050a1f] min-h-screen text-white">
            {/* Header */}
            <header className="py-20 px-10 border-b border-white/5 text-center">
                <Link href="/" className="text-primary tracking-[0.5em] text-xs mb-4 uppercase block">{t.common.back_home}</Link>
                <h1 className="text-4xl md:text-6xl font-serif">{t.nav.rooms}</h1>
                {residenceLetter && (t as any).residences[residenceLetter] && (
                    <p className="text-white/40 mt-4 text-sm tracking-widest uppercase">
                        {t.common.rooms_in} {(t as any).residences[residenceLetter].title}
                    </p>
                )}
            </header>



            {/* Main Content */}
            <main className="py-20 px-10 max-w-7xl mx-auto">
                {loading ? (
                    <SkeletonRoomsGrid count={6} />
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 border border-white/10 text-sm hover:bg-white/5"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {rooms.map(room => (
                            <RoomCard key={room.id} room={room} />
                        ))}
                    </div>
                )}

                {rooms.length === 0 && !loading && !error && (
                    <div className="text-center py-20">
                        <p className="text-white/40">No hay habitaciones disponibles que coincidan con tu búsqueda.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function RoomsPage() {
    return (
        <Suspense fallback={<div className="bg-[#050a1f] min-h-screen" />}>
            <RoomsContent />
        </Suspense>
    );
}
