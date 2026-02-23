'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';

const gradients = [
  'from-rose-500 via-pink-500 to-fuchsia-600',
  'from-cyan-500 via-blue-500 to-indigo-600',
  'from-amber-400 via-orange-500 to-red-500',
  'from-sky-400 via-blue-500 to-indigo-600',
];

const icons = ['✨', '🆕', '👑', '🌿'];

export default function ShowcaseSection() {
  const { dict } = useLang();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'center' },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', () => setSelectedIndex(emblaApi.selectedScrollSnap()));
  }, [emblaApi]);

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="container-custom mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6"
          >
            <Star className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{dict.showcase.badge}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white"
          >
            {dict.showcase.title}
          </motion.h2>
        </div>

        {/* Carousel */}
        <div className="relative -mx-4 md:-mx-8">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {dict.showcase.items.map((item, index) => (
                <div key={index} className="flex-[0_0_85%] md:flex-[0_0_70%] lg:flex-[0_0_60%] min-w-0 px-2 md:px-4">
                  <div
                    className={cn(
                      'relative aspect-[16/10] rounded-3xl overflow-hidden transition-all duration-500',
                      selectedIndex === index ? 'scale-100 shadow-2xl' : 'scale-95 opacity-70'
                    )}
                  >
                    <div className={cn('absolute inset-0 bg-gradient-to-br', gradients[index])} />

                    {/* Bottles Display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-end gap-4">
                        <svg viewBox="0 0 100 240" className="w-12 md:w-20 h-auto drop-shadow-2xl -rotate-6" fill="none">
                          <rect x="35" y="5" width="30" height="18" rx="3" fill="rgba(255,255,255,0.9)" />
                          <path d="M35 23 L35 45 Q25 52 25 65 L25 210 Q25 225 40 225 L60 225 Q75 225 75 210 L75 65 Q75 52 65 45 L65 23" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                        </svg>
                        <svg viewBox="0 0 120 280" className="w-20 md:w-28 h-auto drop-shadow-2xl" fill="none">
                          <rect x="40" y="8" width="40" height="22" rx="3" fill="rgba(255,255,255,0.95)" />
                          <path d="M40 30 L40 55 Q30 63 30 78 L30 245 Q30 262 48 262 L72 262 Q90 262 90 245 L90 78 Q90 63 80 55 L80 30" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                          <rect x="38" y="130" width="44" height="60" rx="3" fill="rgba(255,255,255,0.35)" />
                          <text x="60" y="165" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">OLEW</text>
                        </svg>
                        <svg viewBox="0 0 100 240" className="w-12 md:w-20 h-auto drop-shadow-2xl rotate-6" fill="none">
                          <ellipse cx="50" cy="12" rx="16" ry="8" fill="rgba(255,255,255,0.9)" />
                          <ellipse cx="50" cy="40" rx="28" ry="15" fill="rgba(255,255,255,0.3)" />
                          <path d="M22 40 Q22 50 26 85 L26 200 Q26 218 50 218 Q74 218 74 200 L74 85 Q78 50 78 40" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                        </svg>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                        <span className="text-lg">{icons[index]}</span>
                        <span className="text-white font-semibold text-sm">{item.badge}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/40 to-transparent">
                      <AnimatePresence mode="wait">
                        {selectedIndex === index && (
                          <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="font-display text-xl md:text-3xl font-bold text-white"
                          >
                            {item.title}
                          </motion.h3>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <button onClick={scrollPrev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center bg-white/90 dark:bg-gray-800/90 shadow-xl hover:scale-110 transition-transform">
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <button onClick={scrollNext} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center bg-white/90 dark:bg-gray-800/90 shadow-xl hover:scale-110 transition-transform">
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {dict.showcase.items.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={cn(
                'rounded-full transition-all duration-300',
                selectedIndex === index ? 'w-10 h-3 bg-primary-500' : 'w-3 h-3 bg-gray-300 dark:bg-gray-600'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
