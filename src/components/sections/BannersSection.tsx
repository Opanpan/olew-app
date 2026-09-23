'use client';

/**
 * The banner carousel, moved out of the hero.
 *
 * It was competing with the headline for the first screen; here it gets room to
 * be what it is — a set of editorial highlights — and the hero gets to show the
 * product instead. Falls back to three dictionary slides when no banners are
 * configured, so the section never renders empty.
 */

import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';
import { getBannerCarousels, type BannerCarousel } from '@/lib/publicApi';
import ImgWithFallback from '@/components/shared/ImgWithFallback';
import SectionHeading from '@/components/shared/SectionHeading';
import { EASE } from '@/components/shared/motion';

const AUTOPLAY_MS = 6000;

const fallbackSlides = [
  { id: 1, titleKey: 'slide1_title', descKey: 'slide1_desc' },
  { id: 2, titleKey: 'slide2_title', descKey: 'slide2_desc' },
  { id: 3, titleKey: 'slide3_title', descKey: 'slide3_desc' },
] as const;

const gradients = [
  'from-blue-600 via-sky-500 to-cyan-500',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-violet-600 via-purple-500 to-fuchsia-500',
  'from-emerald-500 via-teal-500 to-cyan-600',
];

export default function BannersSection() {
  const { dict } = useLang();
  const reduced = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [banners, setBanners] = useState<BannerCarousel[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: AUTOPLAY_MS, stopOnInteraction: false }),
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
    <section className="py-20 md:py-28">
      <div className="container-custom mx-auto px-4 md:px-8">
        <SectionHeading
          index="06"
          eyebrow={dict.banners.badge}
          title={dict.banners.title}
          lead={dict.banners.lead}
        />

        <div className="overflow-hidden rounded-2xl ring-1 ring-black/5 dark:ring-white/10" ref={emblaRef}>
          <div className="flex">
            {(banners.length > 0 ? banners : fallbackSlides).map((slide, index) => {
              const active = selectedIndex === index;
              const isBanner = 'image_path' in slide;
              const title = isBanner
                ? slide.title
                : dict.banners[slide.titleKey as keyof typeof dict.banners];
              const description = isBanner
                ? slide.description
                : dict.banners[slide.descKey as keyof typeof dict.banners];
              return (
                <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
                  <div
                    className={cn(
                      'relative aspect-[4/3] overflow-hidden bg-gradient-to-br sm:aspect-[16/9] lg:aspect-[21/9]',
                      gradients[index % gradients.length]
                    )}
                  >
                    {isBanner && (
                      // Slow push on the active slide only; held still for
                      // visitors who asked for reduced motion.
                      <motion.div
                        className="absolute inset-0"
                        animate={reduced ? undefined : { scale: active ? 1.06 : 1 }}
                        transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                      >
                        <ImgWithFallback
                          src={slide.image_path}
                          alt={slide.title}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      </motion.div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
                      <AnimatePresence mode="wait">
                        {active && (
                          <motion.div
                            key={slide.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -14 }}
                            transition={{ duration: 0.45, ease: EASE }}
                          >
                            <h3 className="font-display max-w-2xl text-2xl font-bold text-white md:text-4xl">
                              {title}
                            </h3>
                            {description && (
                              <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
                                {description}
                              </p>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls: the indicator bars double as an autoplay progress meter. */}
        <div className="mt-5 flex items-center justify-between gap-6">
          <div className="flex max-w-sm flex-1 gap-2">
            {Array.from({ length: slideCount }).map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                aria-label={`Slide ${index + 1}`}
                aria-current={selectedIndex === index}
                className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
              >
                <motion.span
                  className="block h-full origin-left rounded-full bg-primary-500"
                  initial={false}
                  animate={{ scaleX: selectedIndex === index ? 1 : 0 }}
                  transition={{
                    duration: selectedIndex === index && !reduced ? AUTOPLAY_MS / 1000 : 0.3,
                    ease: 'linear',
                  }}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              aria-label="Previous slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-primary-500"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next slide"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-700 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:text-gray-300 dark:hover:border-primary-500"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
