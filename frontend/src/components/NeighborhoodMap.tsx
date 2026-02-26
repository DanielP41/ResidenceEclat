'use client';

import { useEffect, useRef } from 'react';

export interface MapMarker {
    name: string;
    lat: number;
    lng: number;
    color?: string;
}

interface Props {
    markers?: MapMarker[];
    center?: [number, number];
    zoom?: number;
    minHeight?: string;
}

const DEFAULT_MARKERS: MapMarker[] = [
    { name: 'Sede San Telmo', lat: -34.6218, lng: -58.3694, color: '#c5a059' },
    { name: 'Sede Parque Patricios I (Olivera 1208)', lat: -34.6467, lng: -58.4801, color: '#c5a059' },
    { name: 'Sede Parque Patricios II (Olivera 1212)', lat: -34.6482, lng: -58.4816, color: '#c5a059' },
];

const LEAFLET_STYLES = `
.leaflet-hood-label {
    background: white;
    border: 1.5px solid #c5a059;
    border-radius: 4px;
    color: #c5a059;
    font-weight: 700;
    font-size: 12px;
    padding: 3px 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    white-space: nowrap;
}
.leaflet-hood-label::before { display: none; }
.leaflet-control-attribution { display: none !important; }
.leaflet-control-zoom a {
    width: 20px !important;
    height: 20px !important;
    line-height: 20px !important;
    font-size: 12px !important;
}
.leaflet-control-zoom { border: 1px solid #ccc !important; }

.custom-gold-pin {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 0 10px #c5a059, 0 0 20px rgba(197, 160, 89, 0.5);
    position: relative;
    z-index: 10;
}

.custom-gold-pin::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    background: rgba(197, 160, 89, 0.3);
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
}
`;

export default function NeighborhoodMap({
    markers = DEFAULT_MARKERS,
    center = [-34.634, -58.425],
    zoom = 12,
    minHeight = '256px',
}: Props) {
    const mapRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<any>(null);

    useEffect(() => {
        if (instanceRef.current || !mapRef.current) return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.textContent = LEAFLET_STYLES;
        document.head.appendChild(style);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
            const L = (window as any).L;
            if (!mapRef.current || instanceRef.current) return;

            const map = L.map(mapRef.current, {
                center,
                zoom,
                zoomControl: true,
                scrollWheelZoom: false,
            });
            instanceRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap contributors © CARTO',
                maxZoom: 19,
            }).addTo(map);

            markers.forEach(({ name, lat, lng, color = '#c5a059' }) => {
                const el = document.createElement('div');
                el.className = 'custom-gold-pin';
                el.style.backgroundColor = color;

                const icon = L.divIcon({
                    html: el,
                    className: '',
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                });

                const marker = L.marker([lat, lng], { icon }).addTo(map);

                if (name) {
                    // Use 'bottom' for 'II' to avoid overlap with 'I' which uses 'top'
                    const direction = name.includes('II') ? 'bottom' : 'top';
                    const offset: [number, number] = direction === 'top' ? [0, -22] : [0, 10];

                    marker.bindTooltip(name, {
                        permanent: true,
                        direction,
                        offset,
                        className: 'leaflet-hood-label',
                    }).openTooltip();
                }
            });
        };
        document.head.appendChild(script);

        return () => {
            if (instanceRef.current) {
                instanceRef.current.remove();
                instanceRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={mapRef}
            className="w-full h-full rounded-2xl overflow-hidden"
            style={{ minHeight }}
        />
    );
}
