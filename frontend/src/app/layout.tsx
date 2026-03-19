import type { Metadata } from 'next';
import { Inter, Architects_Daughter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const architectsDaughter = Architects_Daughter({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-architects'
});

export const metadata: Metadata = {
    title: 'Residencia Éclat | Gestión de Alquiler de Habitaciones',
    description: 'Sistema de gestión de residencia de lujo para alquiler de habitaciones en tiempo real.',
    manifest: '/manifest.json',
    themeColor: '#d4af37',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Residencia Éclat',
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
    },
    icons: {
        icon: [
            { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [
            { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
            { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        ],
    },
};

import { LanguageProvider } from '@/context/LanguageContext';
import { Toaster } from 'sonner';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" className="dark">
            <body className={`${inter.className} ${architectsDaughter.variable}`}>
                <LanguageProvider>
                    <div className="flex flex-col min-h-screen">
                        {children}
                    </div>
                    <Toaster position="top-right" theme="dark" richColors />
                </LanguageProvider>
            </body>
        </html>
    );
}
