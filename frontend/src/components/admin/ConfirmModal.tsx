'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    title,
    message,
    confirmLabel = 'Eliminar',
    onConfirm,
    onCancel,
}) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#050a1f] border border-white/10 w-full max-w-sm rounded-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={18} className="text-red-400" />
                        <h2 className="text-base font-serif text-white">{title}</h2>
                    </div>
                    <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-white/60 text-sm leading-relaxed">{message}</p>
                </div>

                <div className="px-6 pb-6 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-5 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/20 transition-all"
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};
