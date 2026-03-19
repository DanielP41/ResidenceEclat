'use client';

import React, { useState } from 'react';
import { bookingsApi } from '@/lib/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function BookingForm({ roomId, roomName, price }: { roomId: number, roomName: string, price: number }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        documentType: 'DNI',
        documentNumber: '',
        acceptedTerms: false,
    });

    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!formData.checkIn) {
            errors.checkIn = 'La fecha de check-in es requerida';
        } else if (new Date(formData.checkIn) < today) {
            errors.checkIn = 'El check-in no puede ser en el pasado';
        }

        if (!formData.checkOut) {
            errors.checkOut = 'La fecha de check-out es requerida';
        } else if (formData.checkIn && new Date(formData.checkOut) <= new Date(formData.checkIn)) {
            errors.checkOut = 'El check-out debe ser posterior al check-in';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setStatus('loading');

        try {
            await bookingsApi.create({
                roomId,
                guest: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    documentType: formData.documentType,
                    documentNumber: formData.documentNumber,
                },
                checkIn: formData.checkIn,
                checkOut: formData.checkOut,
                acceptedTerms: formData.acceptedTerms,
            });
            setStatus('success');
        } catch (err: any) {
            setStatus('error');
            setMessage(err.message || 'Error al procesar la reserva');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-white/5 border border-primary/30 p-10 text-center space-y-4">
                <CheckCircle2 size={48} className="text-primary mx-auto" />
                <h2 className="text-2xl font-serif text-white">¡Reserva Registrada!</h2>
                <p className="text-white/60">
                    Hemos enviado los detalles de confirmación a <strong>{formData.email}</strong>.
                    Un agente de Éclat se pondrá en contacto pronto.
                </p>
                <button
                    onClick={() => window.location.href = '/rooms'}
                    className="btn-primary mt-6"
                >
                    Ver otras habitaciones
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-6 bg-white/5 p-8 border border-white/10">
            <h2 className="text-2xl font-serif text-white mb-6">Solicitar Reserva: {roomName}</h2>

            {status === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                    <AlertCircle size={16} /> {message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40">Nombre Completo</label>
                    <input
                        required
                        type="text"
                        className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-primary outline-none transition-colors"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40">Email</label>
                    <input
                        required
                        type="email"
                        className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-primary outline-none transition-colors"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40">Check-in</label>
                    <input
                        required
                        type="date"
                        className={`w-full bg-black/40 border p-3 text-white focus:border-primary outline-none transition-colors ${fieldErrors.checkIn ? 'border-red-500/60' : 'border-white/10'}`}
                        value={formData.checkIn}
                        onChange={e => { setFormData({ ...formData, checkIn: e.target.value }); setFieldErrors(prev => ({ ...prev, checkIn: '' })); }}
                    />
                    {fieldErrors.checkIn && <p className="text-red-400 text-xs mt-1">{fieldErrors.checkIn}</p>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-white/40">Check-out</label>
                    <input
                        required
                        type="date"
                        className={`w-full bg-black/40 border p-3 text-white focus:border-primary outline-none transition-colors ${fieldErrors.checkOut ? 'border-red-500/60' : 'border-white/10'}`}
                        value={formData.checkOut}
                        onChange={e => { setFormData({ ...formData, checkOut: e.target.value }); setFieldErrors(prev => ({ ...prev, checkOut: '' })); }}
                    />
                    {fieldErrors.checkOut && <p className="text-red-400 text-xs mt-1">{fieldErrors.checkOut}</p>}
                </div>
            </div>

            <div className="flex items-start gap-3 py-4">
                <input
                    required
                    type="checkbox"
                    id="terms"
                    className="mt-1 accent-primary"
                    checked={formData.acceptedTerms}
                    onChange={e => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                />
                <label htmlFor="terms" className="text-xs text-white/40 leading-relaxed">
                    Acepto los <span className="text-primary underline cursor-pointer">términos y condiciones</span> de Residencia Éclat y las políticas de cancelación.
                </label>
            </div>

            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-4 bg-primary text-white uppercase tracking-[0.2em] font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
                {status === 'loading' ? 'Procesando...' : 'Confirmar Solicitud'}
            </button>
        </form>
    );
}
