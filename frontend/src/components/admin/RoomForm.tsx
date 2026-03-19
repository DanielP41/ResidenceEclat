'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Save, Upload, Loader2 } from 'lucide-react';
import { uploadsApi } from '@/lib/api';
import { fetchApi } from '@/lib/api';

interface RoomFormProps {
    room?: any; // If provided, we are editing
    residenceId: number;
    onClose: () => void;
    onSave: (data: any) => void;
}


export const RoomForm: React.FC<RoomFormProps> = ({ room, residenceId, onClose, onSave }) => {

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        capacity: 1,
        residenceId: residenceId,
        status: 'AVAILABLE',
        amenities: [] as string[],
        images: [] as string[],
    });




    const [residences, setResidences] = useState<any[]>([]);


    const [newAmenity, setNewAmenity] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchResidences = async () => {
            try {
                const response = await fetchApi('/residences');
                setResidences(response.data);
            } catch (error) {
                console.error('Error fetching residences:', error);
            }
        };


        fetchResidences();

        if (room) {
            setFormData({
                name: room.name || '',
                description: room.description || '',
                price: parseFloat(room.price) || 0,
                capacity: room.capacity || 1,
                residenceId: room.residenceId || 0,
                status: room.status || 'AVAILABLE',
                amenities: Array.isArray(room.amenities) ? room.amenities : [],
                images: Array.isArray(room.images) ? room.images : [],
            });
        }
    }, [room]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['price', 'capacity', 'residenceId'].includes(name) ? parseFloat(value) : value
        }));

    };

    const addAmenity = () => {
        if (newAmenity.trim()) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, newAmenity.trim()]
            }));
            setNewAmenity('');
        }
    };

    const removeAmenity = (index: number) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.filter((_, i) => i !== index)
        }));
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
        if (file.size > MAX_SIZE) {
            setUploadError('El archivo supera el límite de 5 MB');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setUploading(true);
        setUploadError('');
        try {
            const result = await uploadsApi.uploadImage(file);
            setFormData(prev => ({ ...prev, images: [...prev.images, result.url] }));
        } catch (error: any) {
            setUploadError(error.message || 'Error al subir imagen');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 md:p-10">
            <div className="bg-[#050a1f] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
                <div className="sticky top-0 bg-[#050a1f] border-b border-white/5 p-6 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-serif text-white">
                        {room ? `Editar: ${room.name}` : 'Nueva Habitación'}
                    </h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Nombre</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-primary/50"
                                placeholder="Ej: Habitación 01"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Descripción</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white h-24 focus:outline-none focus:border-primary/50 resize-none"
                                placeholder="Detalles de la habitación..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Precio ($)</label>
                                <input
                                    required
                                    type="number"
                                    name="price"
                                    min="1"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-primary/50"
                                />

                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Capacidad</label>
                                <input
                                    required
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Estado Inicial</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-md p-3 text-white focus:outline-none focus:border-primary/50"
                            >
                                <option value="AVAILABLE">Disponible</option>
                                <option value="PARTIAL_1">1 Cama Disp.</option>
                                <option value="PARTIAL_2">2 Camas Disp.</option>
                                <option value="PARTIAL_3">3 Camas Disp.</option>
                                <option value="OCCUPIED">Ocupada</option>
                                <option value="RESERVED">Reservada</option>
                                <option value="MAINTENANCE">Mantenimiento</option>
                            </select>
                        </div>
                    </div>


                    {/* Amenities and Images */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Comodidades (Amenities)</label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    value={newAmenity}
                                    onChange={(e) => setNewAmenity(e.target.value)}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:border-primary/50"
                                    placeholder="Ej: Aire acondicionado"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                                />
                                <button type="button" onClick={addAmenity} className="bg-white/10 p-2 rounded-md hover:bg-white/20 text-white transition-colors">
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.amenities.map((item, idx) => (
                                    <span key={idx} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] text-white/70 flex items-center gap-2 group">
                                        {item}
                                        <button type="button" onClick={() => removeAmenity(idx)} className="text-white/20 group-hover:text-red-400">
                                            <Trash2 size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Imágenes</label>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-dashed border-white/20 rounded-md p-4 text-white/60 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                            >
                                {uploading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Subiendo...</>
                                ) : (
                                    <><Upload size={18} /> Subir imagen (JPG, PNG, WebP · máx 5MB)</>
                                )}
                            </button>
                            {uploadError && (
                                <p className="text-red-400 text-xs mb-3">{uploadError}</p>
                            )}
                            <div className="grid grid-cols-3 gap-2">
                                {formData.images.map((url, idx) => (
                                    <div key={idx} className="relative aspect-video rounded overflow-hidden border border-white/10 group">
                                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={16} className="text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 pt-6 border-t border-white/5 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 bg-transparent border border-white/10 text-white/60 font-bold tracking-widest uppercase text-xs hover:bg-white/5 transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-primary text-black font-bold tracking-widest uppercase text-xs hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {loading ? 'Guardando...' : 'Guardar Habitación'}
                        </button>
                    </div>
                </form >
            </div >
        </div >
    );
};
