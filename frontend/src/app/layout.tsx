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
};

import { LanguageProvider } from '@/context/LanguageContext';

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
                </LanguageProvider>
            </body>
        </html>
    );
}
