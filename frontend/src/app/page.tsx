'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck, Clock, MapPin, Facebook, Instagram, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/lib/translations';
import { WhatsAppIcon } from '@/components/Icons';
import { residencesApi } from '@/lib/api';

const NeighborhoodMap = dynamic(() => import('@/components/NeighborhoodMap'), { ssr: false });

export default function LandingPage() {
    const { lang, setLang, t } = useLanguage();
    const [showLangSelector, setShowLangSelector] = useState(false);
    const [showResidences, setShowResidences] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [residences, setResidences] = useState<any[]>([]);

    React.useEffect(() => {
        const fetchResidences = async () => {
            try {
                const res = await residencesApi.getAll();
                setResidences(res.data);
            } catch (error) {
                console.error('Error fetching residences:', error);
            }
        };
        fetchResidences();
    }, []);

    React.useEffect(() => {

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <main className="relative overflow-x-hidden">
            {/* Navbar */}
            <nav className={`fixed top-0 w-full z-50 flex justify-between items-center px-10 transition-all duration-500 ${scrolled
                ? 'py-4 bg-black/40 backdrop-blur-xl'
                : 'py-8 bg-transparent'
                }`}>
                <div className="text-lg font-bold text-primary tracking-widest">ÉCLAT</div>

                <div className="flex items-center gap-12">


                    {/* Language Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLangSelector(!showLangSelector)}
                            className="flex items-center gap-2 text-[13px] uppercase tracking-[0.3em] text-white font-bold border-l border-white/10 pl-8 hover:text-primary transition-colors"
                        >
                            {lang === 'es' ? 'Español' : lang === 'en' ? 'English' : 'Portuguese'}
                            <ChevronDown size={14} className={showLangSelector ? 'rotate-180 transition-transform' : 'transition-transform'} />
                        </button>

                        <AnimatePresence>
                            {showLangSelector && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-4 bg-transparent backdrop-blur-md border border-white/10 p-4 flex flex-col items-end gap-3 min-w-[150px] z-50"
                                >
                                    {(['es', 'en', 'pt'] as Language[]).map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => {
                                                setLang(l);
                                                setShowLangSelector(false);
                                            }}
                                            className={`text-[13px] uppercase tracking-[0.3em] font-bold transition-colors ${lang === l ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                                        >
                                            {l === 'es' ? 'Español' : l === 'en' ? 'English' : 'Portuguese'}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link href="/admin/login" className="hidden md:block text-[12px] uppercase tracking-[0.3em] border border-white/20 px-6 py-2 hover:bg-white/10 transition-all font-bold text-white/80">
                        {t.nav.admin}
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center bg-[url('/images/hero-obelisco.jpg')] bg-cover bg-center bg-fixed">
                <div className="absolute inset-0 bg-black/20" />

                <div className="relative z-10 text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-[#1e3a5f] uppercase tracking-[0.5em] text-sm mb-6 font-bold drop-shadow-xl">{t.hero.subtitle}</h2>
                        <h1 className="text-4xl md:text-6xl font-serif mb-8 text-white drop-shadow-2xl" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>{t.hero.title}</h1>
                        <p className="max-w-xl mx-auto text-lg text-white/90 mb-10 font-medium leading-relaxed drop-shadow-xl whitespace-pre-line">
                            {t.hero.description}
                        </p>
                        <div className="relative inline-block">
                            <button
                                onClick={() => setShowResidences(!showResidences)}
                                className="px-8 py-3 bg-[#c5a059] text-black font-bold tracking-widest uppercase hover:brightness-110 transition-all shadow-xl flex items-center gap-2 mx-auto"
                            >
                                {t.hero.cta_residences}
                                <ChevronDown size={18} className={`transition-transform duration-300 ${showResidences ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {showResidences && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -10, height: 0 }}
                                        className="absolute top-full left-0 w-full mt-1 bg-[#050a1f]/95 backdrop-blur-xl border border-[#c5a059]/30 rounded-lg shadow-2xl z-50 p-2"
                                    >
                                        <div className="flex flex-col gap-1">
                                            {residences.map((res) => (
                                                <Link
                                                    key={res.id}
                                                    href={`/residence/${res.id}`}
                                                    className="block w-full py-1.5 px-3 bg-transparent border border-[#c5a059]/50 rounded-sm text-center text-[#c5a059] font-serif text-xs tracking-[0.15em] uppercase hover:bg-[#c5a059] hover:text-[#050a1f] transition-all duration-300"
                                                >
                                                    <span className="relative z-10">{res.name.toLowerCase().startsWith('sede') ? res.name : `Sede ${res.name}`}</span>

                                                </Link>
                                            ))}
                                        </div>

                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </section>




            {/* Location Section */}
            <section id="location" className="relative py-24 px-10 bg-[url('/images/location-bg-new.jpg')] bg-cover bg-center bg-fixed">
                <div className="absolute inset-0 bg-[#050a1f]/50" />
                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-primary uppercase tracking-[0.5em] text-sm mb-4">{t.location.subtitle}</h2>
                        <h3 className="text-4xl font-serif text-white">{t.location.title}</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <p className="text-white/60 text-lg leading-relaxed font-light">
                                {t.location.description}
                            </p>
                            <div className="space-y-4">
                                <div className="flex gap-4 items-start">
                                    <MapPin className="text-primary mt-1" size={20} />
                                    <div>
                                        <h4 className="text-white font-medium">{t.location.address_title}</h4>
                                        <p className="text-white/40 text-sm">{t.location.address}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <Clock className="text-primary mt-1" size={20} />
                                    <div>
                                        <h4 className="text-white font-medium">{t.location.access_title}</h4>
                                        <p className="text-white/40 text-sm">{t.location.access_desc}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-64 w-full border border-white/10 rounded-2xl overflow-hidden">
                            <NeighborhoodMap />
                        </div>
                    </div>
                </div>
            </section>

            {/* Convenios Section */}
            <section id="convenios" className="relative py-24 px-10 border-y border-white/5">
                {/* Background Split Images */}
                <div className="absolute inset-0 flex">
                    <div className="w-1/2 h-full bg-[url('/images/convenios-1.jpg')] bg-cover bg-center" />
                    <div className="w-1/2 h-full bg-[url('/images/convenios-2.jpg')] bg-cover bg-center" />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-[#050a1f]/55 backdrop-blur-[2px]" />

                <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/2 space-y-6 text-center md:text-left pr-0 md:pr-8">
                        <h2 className="text-primary uppercase tracking-[0.5em] text-sm mb-4">{t.convenios.subtitle}</h2>
                        <h3 className="text-3xl md:text-4xl font-serif text-white leading-tight">{t.convenios.title}</h3>
                        <p className="text-white/60 text-base font-light leading-relaxed">
                            {t.convenios.description}
                        </p>
                    </div>
                    <div className="w-full md:w-1/2 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
                            {[
                                { name: t.convenios.items.emb, icon: <MapPin size={24} className="text-primary" /> },
                                { name: t.convenios.items.uni, icon: <ShieldCheck size={24} className="text-primary" /> },
                            ].map((item, i) => (
                                <div key={i} className="bg-black/40 backdrop-blur-sm border border-white/10 p-8 flex flex-col items-center justify-center gap-4 hover:bg-black/60 transition-all group">
                                    <div className="group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 group-hover:text-white transition-colors text-center">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="relative py-24 px-10 bg-[url('/images/balcony.jpg')] bg-cover bg-center bg-fixed">
                <div className="absolute inset-0 bg-[#050a1f]/60" />
                <div className="relative z-10 max-w-2xl mx-auto text-center">
                    <h2 className="text-primary uppercase tracking-[0.5em] text-sm mb-4">{t.contact.subtitle}</h2>
                    <h3 className="text-4xl font-serif text-white mb-8">{t.contact.title}</h3>
                    <p className="text-white/60 mb-10 font-light leading-relaxed">
                        {t.contact.description}
                    </p>
                    <div className="flex flex-col items-center gap-6">
                        <div className="text-white/80 text-center">
                            <span className="text-primary block text-xs uppercase tracking-widest mb-1">{t.contact.labels.email}</span>
                            residenciaeclat@gmail.com
                        </div>
                        <div className="text-white/80 text-center">
                            <span className="text-primary block text-xs uppercase tracking-widest mb-1">{t.contact.labels.phone}</span>
                            +54 11 3587 7019
                        </div>
                        <div className="pt-2 flex gap-4 justify-center">
                            <a
                                href="https://wa.me/5491135877019"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-black transition-all group"
                                title="WhatsApp"
                            >
                                <WhatsAppIcon size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a
                                href="https://www.instagram.com/residencia.eclat/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-black transition-all group"
                                title="Instagram"
                            >
                                <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-[#050a1f] border-t border-white/5 px-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div>
                        <div className="text-2xl font-bold text-primary tracking-widest mb-4">ÉCLAT</div>
                        <p className="text-white/40 text-sm max-w-sm">{t.footer.desc}</p>
                    </div>
                    <div className="text-white/40 text-xs tracking-widest uppercase">
                        {t.footer.rights}
                    </div>
                </div>
            </footer>
        </main >
    );
}
