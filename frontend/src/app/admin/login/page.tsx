'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Login fallido');

            localStorage.setItem('user', JSON.stringify(data.data.user));
            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-black flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-10 space-y-8">
                <div className="text-center">
                    <h1 className="text-primary tracking-[0.4em] text-2xl font-bold mb-2">ÉCLAT</h1>
                    <p className="text-white/40 text-xs uppercase tracking-widest">Panel de Administración</p>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40">Email Admin</label>
                        <input
                            required
                            type="email"
                            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-primary outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-white/40">Contraseña</label>
                        <input
                            required
                            type="password"
                            className="w-full bg-black/40 border border-white/10 p-3 text-white focus:border-primary outline-none"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-white/10 border border-white/10 text-white uppercase tracking-widest text-sm hover:bg-primary transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Entrando...' : 'Acceder al Panel'}
                    </button>
                </form>

                <div className="pt-4 border-t border-white/5">
                    <Link 
                        href="/" 
                        className="flex justify-center items-center w-full py-3 text-primary border border-primary/20 text-[10px] uppercase tracking-[0.2em] hover:bg-primary/5 transition-colors font-semibold"
                    >
                        Página Principal
                    </Link>
                </div>
            </div>
        </div>
    );
}
