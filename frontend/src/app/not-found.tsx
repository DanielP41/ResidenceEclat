import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="bg-[#050a1f] min-h-screen flex flex-col items-center justify-center text-white px-6">
            <p className="text-primary tracking-[0.5em] text-xs uppercase mb-4">Error 404</p>
            <h1 className="text-6xl md:text-8xl font-serif mb-6">Página no encontrada</h1>
            <p className="text-white/40 text-sm tracking-widest uppercase mb-12">
                La página que buscás no existe o fue movida.
            </p>
            <div className="flex gap-4">
                <Link
                    href="/"
                    className="px-8 py-3 bg-primary text-black text-xs uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all"
                >
                    Ir al inicio
                </Link>
                <Link
                    href="/rooms"
                    className="px-8 py-3 border border-white/10 text-white/60 text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                >
                    Ver habitaciones
                </Link>
            </div>
        </div>
    );
}
