'use client';

import React, { useEffect } from 'react';
import { Sidebar } from '@/components/admin/Sidebar';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (!isLoginPage) {
            const token = localStorage.getItem('user');
            if (!token) {
                router.replace('/admin/login');
            }
        }
    }, [isLoginPage, router]);

    if (isLoginPage) {
        return <div className="min-h-screen bg-[#050505] text-white">{children}</div>;
    }

    return (
        <div className="flex min-h-screen bg-[#050505] text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
