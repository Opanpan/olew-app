'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';
import CountUp from '../shared/CountUp';
import { getBannerCarousels, type BannerCarousel } from '@/lib/publicApi';

const fallbackSlides = [
  { id: 1, titleKey: 'slide1_title', descKey: 'slide1_desc', gradient: 'from-blue-600 via-sky-500 to-cyan-500' },
  { id: 2, titleKey: 'slide2_title', descKey: 'slide2_desc', gradient: 'from-amber-500 via-orange-500 to-rose-500' },
  { id: 3, titleKey: 'slide3_title', descKey: 'slide3_desc', gradient: 'from-violet-600 via-purple-500 to-fuchsia-500' },
];

const gradients = [
  'from-blue-600 via-sky-500 to-cyan-500',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-violet-600 via-purple-500 to-fuchsia-500',
  'from-emerald-500 via-teal-500 to-cyan-600',
];

export default function HeroSection() {
  const { dict } = useLang();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [banners, setBanners] = useState<BannerCarousel[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  useEffect(() => {
    getBannerCarousels().then(setBanners);
  }, []);

  const slideCount = banners.length > 0 ? banners.length : fallbackSlides.length;

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-black">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative container-custom mx-auto px-4 md:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {dict.hero.badge}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-gray-900 dark:text-white">
                {dict.hero.title.split(' ').slice(0, -2).join(' ')}
              </span>{' '}
              <span className="gradient-text">
                {dict.hero.title.split(' ').slice(-2).join(' ')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-8 max-w-xl"
            >
              {dict.hero.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <a href="#products" className="btn-primary flex items-center gap-2">
                {dict.hero.cta_primary}
                <ArrowRight className="w-5 h-5" />
              </a>
              <a href="#contact" className="btn-outline">
                {dict.hero.cta_secondary}
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-8 mt-10 pt-10 border-t border-gray-200 dark:border-gray-800"
            >
              {[
                { value: '500+', label: 'Products' },
                { value: '100+', label: 'Clients' },
                { value: '15+', label: 'Years' },
              ].map((stat) => {
                const match = stat.value.match(/^(\d+)(\+)?$/);
                return (
                  <div key={stat.label}>
                    <div className="font-display text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {match ? (
                        <CountUp end={parseInt(match[1], 10)} suffix={match[2] || ''} duration={2500} />
                      ) : (
                        stat.value
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
                <div className="flex">
                  {banners.length > 0
                    ? banners.map((banner, index) => (
                        <div key={banner.id} className="flex-[0_0_100%] min-w-0">
                          <div className={cn('relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br', gradients[index % gradients.length])}>
                            {banner.image_path && (
                              <img
                                src={banner.image_path}
                                alt={banner.title}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                              <AnimatePresence mode="wait">
                                {selectedIndex === index && (
                                  <motion.div
                                    key={banner.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                  >
                                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                                      {banner.title}
                                    </h3>
                                    {banner.description && (
                                      <p className="text-white/80 text-sm md:text-base">
                                        {banner.description}
                                      </p>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      ))
                    : fallbackSlides.map((slide, index) => (
                        <div key={slide.id} className="flex-[0_0_100%] min-w-0">
                          <div className={cn('relative aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br', slide.gradient)}>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg viewBox="0 0 140 320" className="w-24 md:w-36 h-auto drop-shadow-2xl" fill="none">
                                <rect x="45" y="8" width="50" height="25" rx="4" fill="rgba(255,255,255,0.95)" />
                                <rect x="50" y="33" width="40" height="12" rx="2" fill="rgba(255,255,255,0.75)" />
                                <path d="M50 45 L50 75 Q38 85 38 100 L38 285 Q38 305 58 305 L82 305 Q102 305 102 285 L102 100 Q102 85 90 75 L90 45" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                                <path d="M40 140 L40 280 Q40 298 58 298 L82 298 Q100 298 100 280 L100 140 Q70 160 40 140" fill="rgba(255,255,255,0.2)" />
                                <rect x="48" y="170" width="44" height="70" rx="3" fill="rgba(255,255,255,0.35)" />
                                <text x="70" y="210" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">OLEW</text>
                              </svg>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/40 to-transparent">
                              <AnimatePresence mode="wait">
                                {selectedIndex === index && (
                                  <motion.div
                                    key={slide.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                  >
                                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">
                                      {dict.hero[slide.titleKey as keyof typeof dict.hero]}
                                    </h3>
                                    <p className="text-white/80 text-sm md:text-base">
                                      {dict.hero[slide.descKey as keyof typeof dict.hero]}
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="flex gap-2">
                  {Array.from({ length: slideCount }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(index)}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        selectedIndex === index ? 'w-8 bg-primary-500' : 'w-2 bg-gray-300 dark:bg-gray-600'
                      )}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={scrollPrev} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button onClick={scrollNext} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                    <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
