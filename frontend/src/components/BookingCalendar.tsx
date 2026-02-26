'use client';

import React, { useState, useMemo } from 'react';
import {
    format,
    addMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isBefore,
    startOfToday,
    isWithinInterval,
    addDays
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Users, Calendar as CalendarIcon, Info } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BookingCalendarProps {
    roomId: number;
    price: number;
}

export default function BookingCalendar({ roomId, price }: BookingCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [guests, setGuests] = useState({ adults: 1, children: 0 });

    const nextMonth = addMonths(currentMonth, 1);

    const handleDateClick = (day: Date) => {
        if (!startDate || (startDate && endDate)) {
            setStartDate(day);
            setEndDate(null);
        } else if (startDate && !endDate) {
            if (isBefore(day, startDate)) {
                setStartDate(day);
            } else {
                setEndDate(day);
            }
        }
    };

    const isSelected = (day: Date) => {
        if (startDate && isSameDay(day, startDate)) return true;
        if (endDate && isSameDay(day, endDate)) return true;
        if (startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate })) return true;
        return false;
    };

    const renderMonth = (month: Date) => {
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        const days = eachDayOfInterval({ start, end });
        const emptyDays = start.getDay();

        return (
            <div className="flex-1 min-w-[300px]">
                <h3 className="text-center font-serif text-xl mb-6 text-white/90 capitalize">
                    {format(month, 'MMMM yyyy', { locale: es })}
                </h3>
                <div className="grid grid-cols-7 text-center mb-2">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                        <div key={i} className="text-[10px] uppercase tracking-widest text-white/30 font-bold">{d}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 overflow-hidden">
                    {Array.from({ length: emptyDays }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-16 bg-black" />
                    ))}
                    {days.map((day, i) => {
                        const selected = isSelected(day);
                        const today = isSameDay(day, startOfToday());
                        const past = isBefore(day, startOfToday());
                        const isRangeStart = startDate && isSameDay(day, startDate);
                        const isRangeEnd = endDate && isSameDay(day, endDate);

                        return (
                            <button
                                key={i}
                                disabled={past}
                                onClick={() => handleDateClick(day)}
                                className={cn(
                                    "h-16 flex flex-col items-center justify-center relative transition-all duration-200 group",
                                    past ? "opacity-20 cursor-not-allowed bg-black" : "bg-black hover:bg-white/5 cursor-pointer",
                                    selected && !isRangeStart && !isRangeEnd && "bg-primary/20",
                                    (isRangeStart || isRangeEnd) && "bg-primary text-black"
                                )}
                            >
                                <span className={cn(
                                    "text-sm font-medium",
                                    selected ? (isRangeStart || isRangeEnd ? "text-black" : "text-primary") : "text-white/80"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                {!past && (
                                    <span className={cn(
                                        "text-[9px] mt-1 font-light",
                                        selected && (isRangeStart || isRangeEnd) ? "text-black/60" : "text-white/40"
                                    )}>
                                        ${price}
                                    </span>
                                )}
                                {today && !selected && (
                                    <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Top Header Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 border-b border-white/10">
                <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <Users className="text-primary" size={24} />
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Huéspedes</div>
                        <div className="text-sm font-medium text-white">{guests.adults} Adulto, {guests.children} Niños</div>
                    </div>
                </div>
                <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <CalendarIcon className="text-primary" size={24} />
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Check-in</div>
                        <div className="text-sm font-medium text-white">
                            {startDate ? format(startDate, "EEE, MMM d, yyyy", { locale: es }) : 'Seleccionar fecha'}
                        </div>
                    </div>
                </div>
                <div className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer">
                    <CalendarIcon className="text-primary" size={24} />
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Check-out</div>
                        <div className="text-sm font-medium text-white">
                            {endDate ? format(endDate, "EEE, MMM d, yyyy", { locale: es }) : 'Seleccionar fecha'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                        <Info size={14} className="text-primary" />
                        Mostrando el mejor precio disponible por noche (USD).
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/10"
                        >
                            <ChevronLeft size={20} className="text-white/60" />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors border border-white/10"
                        >
                            <ChevronRight size={20} className="text-white/60" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-12">
                    {renderMonth(currentMonth)}
                    {renderMonth(nextMonth)}
                </div>

                {/* Legend */}
                <div className="mt-10 pt-8 border-t border-white/5 flex flex-wrap gap-8 justify-center">
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-widest font-bold">
                        <div className="w-4 h-4 bg-primary rounded-sm" /> Selección
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-widest font-bold">
                        <div className="w-4 h-4 bg-white/5 border border-white/10 rounded-sm" /> Disponible
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-widest font-bold">
                        <div className="w-4 h-4 bg-red-500/40 rounded-sm" /> No Check-in
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-widest font-bold">
                        <div className="w-4 h-4 bg-red-500/20 rounded-sm" /> No Check-out
                    </div>
                </div>

                {/* Action Button */}
                {startDate && endDate && (
                    <div className="mt-12 text-center">
                        <button className="px-12 py-4 bg-primary text-black font-bold uppercase tracking-[0.2em] hover:bg-white transition-all transform hover:scale-105">
                            Continuar con la Reserva
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
