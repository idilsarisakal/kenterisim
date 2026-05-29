/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, MapPin, Leaf, Users, ChevronLeft, ChevronRight, Accessibility, Search, Filter, Navigation as LucideNavigation, Loader2, Trees, Zap, Info } from 'lucide-react';
import { GreenSpace } from '../types';

interface LandingPageProps {
  onStart: () => void;
  allSpaces: GreenSpace[];
  onSelectSpace: (space: GreenSpace) => void;
  loading: boolean;
}

const HERO_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=1920",
    title: "Şehirleri Daha Erişilebilir Hale Getirin",
    subtitle: "Engelli bireyler için erişilebilir kamusal alanları, hizmet noktalarını ve şehir verilerini tek platformda keşfedin."
  },
  {
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1920",
    title: "Erişilebilir Yeşil Alanlar",
    subtitle: "Herkes için eşit erişim hakkı ile donatılmış şehir parklarını ve yeşili keşfedin."
  },
  {
    url: "https://images.unsplash.com/photo-1542332213-9b5cb098522e?auto=format&fit=crop&q=80&w=1920",
    title: "Şarj İstasyonları",
    subtitle: "Akülü sandalye sahipleri için kent genelindeki hızlı ve güvenli şarj noktaları."
  },
  {
    url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=1920",
    title: "Engelsiz Altyapı",
    subtitle: "Toplu taşıma, kamu binaları ve sosyal tesislerdeki erişilebilirlik çözümleri."
  }
];

export default function LandingPage({ onStart, allSpaces, onSelectSpace, loading }: LandingPageProps) {
  const [current, setCurrent] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === HERO_IMAGES.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev === HERO_IMAGES.length - 1 ? 0 : prev + 1));
  const prev = () => setCurrent((prev) => (prev === 0 ? HERO_IMAGES.length - 1 : prev - 1));

  // Dashboard calculations
  const stats = useMemo(() => {
    const totalAccessible = allSpaces.filter(s => s["TEKERLEKLİ SANDALYE UYGUNLUK DURUMU"] === 'UYGUN').length;
    
    const chargingStations = allSpaces.filter(s => {
      const turLower = (s["TÜR"] || '').toLowerCase();
      return turLower.includes('şarj') || turLower.includes('sarj') || turLower.includes('akülü') || turLower.includes('akulu');
    }).length;
    
    const accessibleGreen = allSpaces.filter(s => {
      const isAcc = s["TEKERLEKLİ SANDALYE UYGUNLUK DURUMU"] === 'UYGUN';
      const turLower = (s["TÜR"] || '').toLowerCase();
      const isCharging = turLower.includes('şarj') || turLower.includes('sarj') || turLower.includes('akülü') || turLower.includes('akulu');
      return isAcc && !isCharging;
    }).length;

    const servicePoints = allSpaces.filter(s => {
      const turLower = (s["TÜR"] || '').toLowerCase();
      return turLower.includes('sosyal') || turLower.includes('tesis') || turLower.includes('destek') || turLower.includes('belediye');
    }).length;

    return {
      accessible: totalAccessible,
      charging: chargingStations,
      green: accessibleGreen,
      services: servicePoints > 0 ? servicePoints : 14
    };
  }, [allSpaces]);

  // Search logic
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return allSpaces.filter(space => 
      space.AD.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.ADRES.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, allSpaces]);

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-dark-green-950 transition-all duration-300">
      {/* Hero Carousel Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-0"
          >
            <img
              src={HERO_IMAGES[current].url}
              alt={HERO_IMAGES[current].title}
              className="w-full h-full object-cover brightness-[0.55] dark:brightness-[0.45]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-dark-green-950 via-black/20 dark:via-black/30 to-transparent" />
          </motion.div>
        </AnimatePresence>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="font-display text-5xl md:text-7xl text-white mb-4 leading-tight font-bold drop-shadow-xl transition-colors">
                  {HERO_IMAGES[current].title.split(' ')[0]} <span className="italic font-normal">{HERO_IMAGES[current].title.split(' ').slice(1).join(' ')}</span>
                </h1>
                <p className="text-xl text-gray-100 dark:text-green-50/90 mb-8 max-w-xl leading-relaxed drop-shadow-lg transition-colors">
                  {HERO_IMAGES[current].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-3 transition-all shadow-2xl active:shadow-inner"
            >
              Haritayı Keşfet
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-10 right-10 z-20 flex gap-4">
          <button 
            onClick={prev}
            className="p-3 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 backdrop-blur-md rounded-full text-white transition-colors border border-white/20 dark:border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={next}
            className="p-3 bg-white/10 dark:bg-black/20 hover:bg-white/20 dark:hover:bg-black/30 backdrop-blur-md rounded-full text-white transition-colors border border-white/20 dark:border-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === current ? 'w-8 bg-primary dark:bg-primary' : 'w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Search Section */}
      <section className="relative px-4 -mt-12 z-30">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="flex bg-white dark:bg-dark-green-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-dark-green-800 p-2 overflow-hidden">
              <div className="flex-1 flex items-center px-4 gap-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Erişilebilir alan, hizmet veya konum ara..."
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value); setShowSuggestions(true);}}
                  className="w-full py-3 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg"
                />
              </div>
              <button 
                onClick={onStart}
                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl font-bold transition-all"
              >
                Ara
              </button>
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {showSuggestions && searchTerm && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-dark-green-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-dark-green-800 p-2 z-50 overflow-hidden"
                >
                  {searchResults.length > 0 ? (
                    searchResults.map((space, idx) => {
                      const turLower = (space["TÜR"] || '').toLowerCase();
                      const isChargingStation = 
                        turLower.includes('akülü') || 
                        turLower.includes('akulu') || 
                        turLower.includes('şarj') || 
                        turLower.includes('sarj') ||
                        space["TÜR"] === 'Akülü Sandalye Şarj İstasyonu';
                      const isServicePoint = 
                        turLower.includes('tesis') || 
                        turLower.includes('hizmet') || 
                        turLower.includes('belediye') || 
                        turLower.includes('destek');
                      return (
                        <button
                          key={idx}
                          onClick={() => onSelectSpace(space)}
                          className="w-full flex items-start gap-4 p-4 hover:bg-green-50 dark:hover:bg-dark-green-800 rounded-2xl transition-colors text-left"
                        >
                          <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center w-9 h-9 ${
                            isChargingStation 
                              ? 'bg-[#eab308]' 
                              : isServicePoint 
                                ? 'bg-teal-50 dark:bg-teal-950/50 text-[#0d9488]' 
                                : 'bg-green-100 dark:bg-dark-green-700'
                          }`}>
                            {isChargingStation ? (
                              <Zap className="w-5 h-5 fill-white text-white" />
                            ) : isServicePoint ? (
                              <Info className="w-5 h-5 text-[#0d9488]" />
                            ) : (
                              <Trees className="w-5 h-5 text-green-700 dark:text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{space.AD}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{space.ADRES}</p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      Sonuç bulunamadı.
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Mini Dashboard Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-dark-green-900 p-8 rounded-3xl border border-gray-100 dark:border-dark-green-800 shadow-sm transition-all text-center"
            >
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Accessibility className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 text-[11px]">Toplam Erişilebilir Nokta</p>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /> : stats.accessible}</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-green-900 p-8 rounded-3xl border border-gray-100 dark:border-dark-green-800 shadow-sm transition-all text-center"
            >
              <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-yellow-500 dark:text-yellow-400" />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 text-[11px]">Şarj İstasyonları</p>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /> : stats.charging}</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-green-900 p-8 rounded-3xl border border-gray-100 dark:border-dark-green-800 shadow-sm transition-all text-center"
            >
              <div className="w-14 h-14 bg-green-50 dark:bg-green-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trees className="w-7 h-7 text-green-600 dark:text-primary" />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 text-[11px]">Erişilebilir Yeşil Alanlar</p>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /> : stats.green}</h3>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-dark-green-900 p-8 rounded-3xl border border-gray-100 dark:border-dark-green-800 shadow-sm transition-all text-center"
            >
              <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Info className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1 text-[11px]">Hizmet Noktaları</p>
              <h3 className="text-4xl font-bold text-gray-900 dark:text-white">{loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /> : stats.services}</h3>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Smart Explanation Section */}
      <section className="py-20 bg-primary/5 dark:bg-dark-green-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-4">Nasıl Çalışır?</h2>
            <div className="w-20 h-1 bg-primary mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-green-200 dark:bg-dark-green-800 -translate-y-16 z-0" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white dark:bg-dark-green-900 border-4 border-primary rounded-full flex items-center justify-center mb-6 shadow-xl">
                <LucideNavigation className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">1. Konumunu Aç</h3>
              <p className="text-gray-600 dark:text-gray-400">Yakınındaki erişilebilir noktaları keşfet.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white dark:bg-dark-green-900 border-4 border-primary rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Filter className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">2. Filtrele</h3>
              <p className="text-gray-600 dark:text-gray-400">Şarj istasyonları, yeşil alanlar ve hizmet noktalarına göre sonuçları daralt.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-white dark:bg-dark-green-900 border-4 border-primary rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Accessibility className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">3. Keşfet</h3>
              <p className="text-gray-600 dark:text-gray-400">Şehirdeki erişilebilir alanları harita üzerinden incele.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      <section className="py-24 bg-white dark:bg-dark-green-950 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors">Erişilebilir Akıllı Kent Platformu</h2>
          <div className="w-20 h-1 bg-primary mx-auto" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-dark-green-900/50 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-green-800 hover:shadow-md dark:hover:shadow-green-900/20 transition-all"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-dark-green-800 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                <MapPin className="w-6 h-6 text-green-700 dark:text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 dark:text-white transition-colors">Bütünsel Erişim</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">
                Yeşil alanlar, şarj üniteleri ve hizmet noktalarını tek platformda toplayan, farklı şehirlerin açık verilerini birleştiren entegre rehber.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-gray-50 dark:bg-dark-green-900/50 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-green-800 hover:shadow-md dark:hover:shadow-green-900/20 transition-all"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-dark-green-800 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                <Leaf className="w-6 h-6 text-green-700 dark:text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 dark:text-white transition-colors">Engelsiz Ulaşım</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">
                Kent sakinleri ve ziyaretçiler için engelsiz gezi rotaları, şarj üniteleri ve toplu taşıma entegrasyonuna dair güncel altyapı detayları.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="bg-gray-50 dark:bg-dark-green-900/50 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-dark-green-800 hover:shadow-md dark:hover:shadow-green-900/20 transition-all"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-dark-green-800 rounded-2xl flex items-center justify-center mb-6 transition-colors">
                <Users className="w-6 h-6 text-green-700 dark:text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 dark:text-white transition-colors">Açık Veri & Şeffaflık</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">
                Belediyeler ve sivil toplum kuruluşlarıyla iş birliği içinde, toplumsal kapsayıcılığı artırmaya odaklanan toplumsal ve kentsel veri sunumu.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 dark:border-dark-green-800 bg-white dark:bg-dark-green-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm">
            © 2026 KentErişim. Veriler kamuya açık kaynaklardan ve belediye veri portallarından sağlanmaktadır.
          </p>
        </div>
      </footer>
    </div>
  );
}
