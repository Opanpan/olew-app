'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';
import CountUp from '../shared/CountUp';
import { getBannerCarousels, type BannerCarousel } from '@/lib/publicApi';
import ImgWithFallback from '@/components/shared/ImgWithFallback';
import { EASE, Reveal, WordReveal } from '@/components/shared/motion';

const AUTOPLAY_MS = 6000;

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

const STATS = [
  { value: 500, suffix: '+', label: 'Products' },
  { value: 100, suffix: '+', label: 'Clients' },
  { value: 15, suffix: '+', label: 'Years' },
];

/** Outline bottle used when no banner images are configured. */
function BottleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 320" className={className} fill="none" aria-hidden>
      <rect x="45" y="8" width="50" height="25" rx="4" fill="rgba(255,255,255,0.95)" />
      <rect x="50" y="33" width="40" height="12" rx="2" fill="rgba(255,255,255,0.75)" />
      <path
        d="M50 45 L50 75 Q38 85 38 100 L38 285 Q38 305 58 305 L82 305 Q102 305 102 285 L102 100 Q102 85 90 75 L90 45"
        fill="rgba(255,255,255,0.3)"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="2"
      />
      <path d="M40 140 L40 280 Q40 298 58 298 L82 298 Q100 298 100 280 L100 140 Q70 160 40 140" fill="rgba(255,255,255,0.2)" />
      <rect x="48" y="170" width="44" height="70" rx="3" fill="rgba(255,255,255,0.35)" />
      <text x="70" y="210" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
        OLEW
      </text>
    </svg>
  );
}

export default function HeroSection() {
  const { dict } = useLang();
  const reduced = useReducedMotion();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [banners, setBanners] = useState<BannerCarousel[]>([]);
  const frameRef = useRef<HTMLDivElement>(null);

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

  // Pointer parallax on the carousel frame. Springs keep it from feeling twitchy,
  // and it is disabled outright for reduced-motion visitors.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], ['6deg', '-6deg']), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], ['-7deg', '7deg']), { stiffness: 120, damping: 18 });

  const handlePointer = (e: React.PointerEvent) => {
    if (reduced) return;
    const box = frameRef.current?.getBoundingClientRect();
    if (!box) return;
    px.set((e.clientX - box.left) / box.width - 0.5);
    py.set((e.clientY - box.top) / box.height - 0.5);
  };
  const resetPointer = () => {
    px.set(0);
    py.set(0);
  };

  const slideCount = banners.length > 0 ? banners.length : fallbackSlides.length;
  const titleWords = dict.hero.title.split(' ');
  const accentFrom = Math.max(titleWords.length - 2, 0);

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-24 md:pt-28">
      {/* ── Background: a calm base wash, two slow-drifting lights, and a hairline
          grid that fades out toward the edges. ─────────────────────────────── */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-primary-50/40 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <motion.div
          className="absolute -left-40 top-[-10%] h-[38rem] w-[38rem] rounded-full bg-primary-400/20 blur-[120px] dark:bg-primary-600/20"
          animate={reduced ? undefined : { x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-32 bottom-[-15%] h-[30rem] w-[30rem] rounded-full bg-amber-300/20 blur-[110px] dark:bg-amber-500/10"
          animate={reduced ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div
          className="absolute inset-0 opacity-[0.18] dark:opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(148 163 184 / 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.35) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 30%, transparent 75%)',
          }}
        />
      </div>

      <div className="container-custom relative mx-auto px-4 py-12 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* ── Copy ───────────────────────────────────────────────────────── */}
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="flex items-center gap-3"
            >
              <span className="h-px w-10 bg-primary-500/50" />
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-gray-500 dark:text-gray-400">
                {dict.hero.badge}
              </span>
            </motion.div>

            <WordReveal
              as="h1"
              text={dict.hero.title}
              delay={0.15}
              accentFrom={accentFrom}
              className="font-display mt-6 text-[2.6rem] font-bold leading-[1.05] tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-[4rem]"
            />

            <Reveal from="up" delay={0.5} className="mt-6 max-w-xl">
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">{dict.hero.subtitle}</p>
            </Reveal>

            <Reveal from="up" delay={0.62} className="mt-9 flex flex-wrap items-center gap-3">
              {/* Primary CTA: a sheen sweeps across on hover. */}
              <a
                href="#products"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary-600 px-7 py-3.5 font-medium text-white shadow-lg shadow-primary-600/20 transition-colors hover:bg-primary-700"
              >
                <span className="absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/25 transition-all duration-700 group-hover:left-[130%] motion-reduce:hidden" />
                <span className="relative">{dict.hero.cta_primary}</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full border border-gray-300 px-7 py-3.5 font-medium text-gray-800 transition-colors hover:border-primary-500 hover:text-primary-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300"
              >
                {dict.hero.cta_secondary}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Reveal>

            <Reveal from="up" delay={0.74} className="mt-12">
              <dl className="flex divide-x divide-gray-200 dark:divide-gray-800">
                {STATS.map((stat, i) => (
                  <div key={stat.label} className={cn('pr-8', i > 0 && 'pl-8')}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="font-display text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                      <CountUp end={stat.value} suffix={stat.suffix} duration={2200} />
                    </dd>
                    <dd className="mt-1 text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* ── Carousel ───────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            className="order-1 lg:order-2"
            style={{ perspective: 1200 }}
          >
            <motion.div
              ref={frameRef}
              onPointerMove={handlePointer}
              onPointerLeave={resetPointer}
              style={reduced ? undefined : { rotateX, rotateY, transformStyle: 'preserve-3d' }}
              className="relative"
            >
              {/* Soft halo behind the frame so it lifts off the page. */}
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary-500/10 blur-3xl dark:bg-primary-500/15" />

              <div
                className="overflow-hidden rounded-[1.75rem] shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] ring-1 ring-black/5 dark:ring-white/10"
                ref={emblaRef}
              >
                <div className="flex">
                  {banners.length > 0
                    ? banners.map((banner, index) => {
                        const active = selectedIndex === index;
                        return (
                          <div key={banner.id} className="min-w-0 flex-[0_0_100%]">
                            <div
                              className={cn(
                                'relative aspect-square overflow-hidden bg-gradient-to-br md:aspect-[4/3]',
                                gradients[index % gradients.length]
                              )}
                            >
                              {/* Slow Ken Burns push on the active slide only. */}
                              <motion.div
                                className="absolute inset-0"
                                animate={reduced ? undefined : { scale: active ? 1.08 : 1 }}
                                transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                              >
                                <ImgWithFallback
                                  src={banner.image_path}
                                  alt={banner.title}
                                  className="absolute inset-0 h-full w-full object-cover"
                                />
                              </motion.div>

                              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                                <AnimatePresence mode="wait">
                                  {active && (
                                    <motion.div
                                      key={banner.id}
                                      initial={{ opacity: 0, y: 24 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -16 }}
                                      transition={{ duration: 0.5, ease: EASE }}
                                    >
                                      <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
                                        {banner.title}
                                      </h3>
                                      {banner.description && (
                                        <p className="mt-1 text-sm text-white/80 md:text-base">{banner.description}</p>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    : fallbackSlides.map((slide, index) => {
                        const active = selectedIndex === index;
                        return (
                          <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
                            <div
                              className={cn(
                                'relative aspect-square overflow-hidden bg-gradient-to-br md:aspect-[4/3]',
                                slide.gradient
                              )}
                            >
                              <motion.div
                                className="absolute inset-0 flex items-center justify-center"
                                animate={reduced ? undefined : { y: [0, -14, 0] }}
                                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                              >
                                <BottleMark className="h-auto w-24 drop-shadow-2xl md:w-36" />
                              </motion.div>

                              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                                <AnimatePresence mode="wait">
                                  {active && (
                                    <motion.div
                                      key={slide.id}
                                      initial={{ opacity: 0, y: 24 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -16 }}
                                      transition={{ duration: 0.5, ease: EASE }}
                                    >
                                      <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
                                        {dict.hero[slide.titleKey as keyof typeof dict.hero]}
                                      </h3>
                                      <p className="mt-1 text-sm text-white/80 md:text-base">
                                        {dict.hero[slide.descKey as keyof typeof dict.hero]}
                                      </p>
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
                <div className="flex flex-1 gap-2">
                  {Array.from({ length: slideCount }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(index)}
                      aria-label={`Slide ${index + 1}`}
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
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-700 backdrop-blur transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:border-primary-500"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={scrollNext}
                    aria-label="Next slide"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white/80 text-gray-700 backdrop-blur transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-300 dark:hover:border-primary-500"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-gray-400 lg:flex"
      >
        <span className="text-[0.65rem] uppercase tracking-[0.2em]">Scroll</span>
        <span className="relative block h-10 w-px overflow-hidden bg-gray-200 dark:bg-gray-800">
          <motion.span
            className="absolute inset-x-0 top-0 h-4 bg-primary-500"
            animate={reduced ? undefined : { y: ['-100%', '250%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </span>
      </motion.div>
    </section>
  );
}
