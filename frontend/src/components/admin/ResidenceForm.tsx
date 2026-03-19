'use client';

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { residencesApi } from '@/lib/api';
import { toast } from 'sonner';

interface ResidenceFormProps {
    residence?: {
        id: number;
        name: string;
        address: string;
        description: string;
        images?: string[];
    };
    onClose: () => void;
    onSave: () => void;
}

export const ResidenceForm: React.FC<ResidenceFormProps> = ({ residence, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: residence?.name || '',
        address: residence?.address || '',
        description: residence?.description || '',
        images: Array.isArray(residence?.images) ? residence.images : [],
    });
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const addImage = () => {
        if (!imageUrl) return;
        setFormData({
            ...formData,
            images: [...formData.images, imageUrl]
        });
        setImageUrl('');
    };

    const removeImage = (index: number) => {
        setFormData({
            ...formData,
            images: formData.images.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault();
        setLoading(true);
        try {
            if (residence) {
                await residencesApi.update(residence.id, formData);
            } else {
                await residencesApi.create(formData);
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving residence:', error);
            toast.error('Error al guardar la sede');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#050a1f] border border-white/10 w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-serif text-white">{residence ? 'Editar Sede' : 'Nueva Sede'}</h2>

                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Nombre de la Sede</label>
                        <input
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-primary/50"
                            placeholder="Ej: Sede Palermo"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Dirección</label>
                        <input
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-primary/50"
                            placeholder="Ej: Av. Santa Fe 1234"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Descripción</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white h-24 focus:outline-none focus:border-primary/50 resize-none"
                            placeholder="Breve descripción de la sede..."
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Imágenes (URLs)</label>
                        <div className="flex gap-2 mb-4">
                            <input
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="flex-1 bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-primary/50"
                                placeholder="Pega una URL de imagen..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addImage();
                                    }
                                }}
                            />
                            <button
                                type="button"
                                onClick={addImage}
                                className="px-4 bg-white/5 border border-white/10 text-primary hover:bg-white/10 rounded-md transition-all font-bold"
                            >
                                +
                            </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                            {formData.images.map((img, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/5 border border-white/5 p-2 rounded text-[10px] text-white/60">
                                    <span className="truncate flex-1 mr-2">{img}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(i)}
                                        className="text-red-400 hover:text-red-300 transition-colors uppercase font-bold"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-black text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2"
                        >
                            <Save size={16} />
                            {loading ? 'Guardando...' : residence ? 'Guardar Cambios' : 'Crear Sede'}

                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
