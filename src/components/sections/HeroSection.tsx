'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';
import CountUp from '../shared/CountUp';
import { EASE, Reveal, WordReveal } from '@/components/shared/motion';
import type { HeroAssemblyData } from '@/lib/heroAssembly';
import { markHeroReady } from '@/lib/heroReady';
import HeroAssembly from './HeroAssembly';
import HeroBottleAssembly from './HeroBottleAssembly';

const STATS = [
  { value: 500, suffix: '+', label: 'Products' },
  { value: 100, suffix: '+', label: 'Clients' },
  { value: 15, suffix: '+', label: 'Years' },
];

/**
 * Outline pot used when the featured assembly can't be resolved (API down, or
 * the product was unpublished) — the hero keeps its composition either way.
 */
function PotMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.5" opacity="0.35">
        <ellipse cx="100" cy="44" rx="46" ry="11" />
        <path d="M54 44v10a46 11 0 0 0 92 0V44" />
        <ellipse cx="100" cy="86" rx="40" ry="10" />
        <path d="M60 86v8a40 10 0 0 0 80 0v-8" />
        <ellipse cx="100" cy="126" rx="52" ry="13" />
        <path d="M48 126v26a52 13 0 0 0 104 0v-26" />
      </g>
    </svg>
  );
}

/**
 * "POT DEVINDA 10, 15, & 30 GR" → "Devinda": the catalogue name minus its
 * family word and size suffix, which the caption already shows on their own
 * lines. Falls back to the whole name if that leaves nothing.
 */
function displayName(name: string) {
  const words = name.trim().split(/\s+/);
  const body = words.slice(/^(pot|bottle|botol)$/i.test(words[0] ?? '') ? 1 : 0);
  const cut = body.findIndex((w) => /^\d/.test(w));
  const core = (cut === -1 ? body : body.slice(0, cut)).join(' ') || name;
  return core
    .toLowerCase()
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Canvas heights, shared so the pot and bottle stand on the same shelf. */
const STAGE_H = 'h-[250px] min-[420px]:h-[290px] sm:h-[400px] lg:h-[460px]';

interface HeroFigureProps {
  index: number;
  family: string;
  data: HeroAssemblyData;
  /** Mobile only: put the caption on the left so the two rows zigzag. */
  flip?: boolean;
  delay: number;
  children: ReactNode;
}

/**
 * One product on the hero stage with its museum-plaque caption. Below `sm`
 * the caption sits beside the object (alternating sides, so the column reads
 * as a zigzag rather than two stacked blocks); from `sm` up the two figures
 * stand side by side and each caption drops under its object on a hairline.
 */
function HeroFigure({ index, family, data, flip, delay, children }: HeroFigureProps) {
  const { lang, dict } = useLang();
  const name = displayName(lang === 'id' ? data.name_id : data.name_en);
  const slug = lang === 'id' ? data.slug_id : data.slug_en;
  // Each spec stays whole, so a narrow caption wraps between them, never inside one.
  const specs = [data.volume, data.material].filter((v): v is string => !!v);
  const parts = dict.hero.featured_parts.replace('{n}', String(data.parts.length + 1));

  return (
    <figure
      className={cn(
        'flex min-w-0 flex-1 items-center gap-3 sm:flex-col sm:items-stretch sm:gap-0',
        flip && 'flex-row-reverse',
      )}
    >
      <div className="w-[55%] shrink-0 sm:w-full">{children}</div>
      <Reveal
        from={flip ? 'right' : 'left'}
        delay={delay}
        className={cn(
          'min-w-0 flex-1 border-gray-200 dark:border-gray-800',
          'sm:mt-2 sm:border-t sm:pt-5 sm:text-left',
          flip ? 'border-r pr-4 text-right sm:border-r-0 sm:pr-0' : 'border-l pl-4 sm:border-l-0 sm:pl-0',
        )}
      >
        <figcaption>
          <span
            className={cn(
              'flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-primary-600 dark:text-primary-400',
              flip && 'justify-end sm:justify-start',
            )}
          >
            <span className="font-display text-sm font-bold tracking-normal">{String(index).padStart(2, '0')}</span>
            <span aria-hidden className="h-px w-5 bg-primary-500/40" />
            {family}
          </span>
          <span className="font-display mt-2 block text-xl font-bold leading-tight tracking-tight text-gray-900 [overflow-wrap:break-word] dark:text-white min-[420px]:text-2xl sm:mt-2.5 sm:text-[1.75rem] sm:leading-[1.05] lg:text-3xl">
            {name}
          </span>
          {specs.length > 0 && (
            <span className="mt-2 block text-xs text-gray-600 dark:text-gray-300">
              {specs.map((spec, i) => (
                <span key={spec} className="whitespace-nowrap">
                  {i > 0 && ' · '}
                  {spec}
                </span>
              ))}
            </span>
          )}
          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{parts}</span>
          <Link
            href={`/${lang}/products/${slug}`}
            className="group mt-1 inline-flex min-h-[44px] items-center gap-1 whitespace-nowrap text-[0.8125rem] font-medium sm:gap-1.5 sm:text-sm text-primary-700 transition-colors hover:text-primary-800 dark:text-primary-300 dark:hover:text-primary-200"
          >
            <span className="underline decoration-primary-500/30 underline-offset-4 transition-colors group-hover:decoration-primary-500">
              {dict.hero.featured_view}
            </span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </figcaption>
      </Reveal>
    </figure>
  );
}

interface HeroSectionProps {
  pot: HeroAssemblyData | null;
  /** Secondary companion shown beside the pot — optional, purely decorative. */
  bottle: HeroAssemblyData | null;
}

export default function HeroSection({ pot, bottle }: HeroSectionProps) {
  const { lang, dict } = useLang();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // No pot means no 3D will ever load, so release the intro curtain
  // immediately rather than making the visitor wait out its timeout. The
  // bottle is a secondary decoration and never gates the curtain itself.
  useEffect(() => {
    if (!pot) markHeroReady();
  }, [pot]);

  // Scroll-scrubbed reassembly: 1 (fully exploded, parts adrift) at the top of
  // the page, easing to 0 (assembled) by the time the section is half
  // scrolled past — the visual is vertically centred in the section, so it's
  // still clearly on screen for that whole range, no scroll-pinning needed.
  // `useMotionValueEvent` reads the scroll-linked value into plain state so it
  // can flow down as an ordinary prop into the 3D layers.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'center start'] });
  const explodeMV = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const [explode, setExplode] = useState(1);
  useMotionValueEvent(explodeMV, 'change', setExplode);
  // Reduced motion gets the static exploded pose (the pre-scroll-effect look)
  // and no scroll-linked motion at all, per prefers-reduced-motion.
  const effectiveExplode = reduced ? 1 : explode;

  const titleWords = dict.hero.title.split(' ');
  const accentFrom = Math.max(titleWords.length - 2, 0);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-x-clip overflow-y-hidden pt-24 md:pt-28"
    >
      {/* Background: one quiet wash and a hairline grid that fades at the edges.
          No drifting colour blobs — the product is the only thing on this screen
          that should be asking for attention. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-primary-50/30 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        <div
          className="absolute inset-0 opacity-[0.16] dark:opacity-[0.1]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgb(148 163 184 / 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.35) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse 75% 60% at 60% 45%, black 25%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 60% at 60% 45%, black 25%, transparent 78%)',
          }}
        />
      </div>

      <div className="container-custom relative mx-auto px-4 py-8 sm:py-12 md:px-8">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* ── Copy ───────────────────────────────────────────────────────── */}
          {/* min-w-0: grid items default to min-width:auto, so one unbreakable
              child can force the column — and the whole page — wider than the
              viewport. */}
          <div className="order-1 min-w-0">
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
              className="font-display mt-6 text-[2rem] font-bold leading-[1.08] tracking-tight text-gray-900 hyphens-auto dark:text-white min-[420px]:text-[2.6rem] sm:text-5xl sm:leading-[1.05] lg:text-[4rem]"
            />

            <Reveal from="up" delay={0.5} className="mt-6 max-w-xl">
              <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">{dict.hero.subtitle}</p>
            </Reveal>

            <Reveal from="up" delay={0.62} className="mt-9 flex flex-wrap items-center gap-3">
              {/* Primary CTA: a sheen sweeps across on hover. */}
              <Link
                href={`/${lang}/products`}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary-600 px-6 py-3.5 font-medium text-white sm:px-7 shadow-lg shadow-primary-600/20 transition-colors hover:bg-primary-700"
              >
                <span className="absolute inset-y-0 -left-full w-1/2 skew-x-[-20deg] bg-white/25 transition-all duration-700 group-hover:left-[130%] motion-reduce:hidden" />
                <span className="relative">{dict.hero.cta_primary}</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3.5 font-medium text-gray-800 sm:px-7 transition-colors hover:border-primary-500 hover:text-primary-700 dark:border-gray-700 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-300"
              >
                {dict.hero.cta_secondary}
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Reveal>

            <Reveal from="up" delay={0.74} className="mt-12">
              <dl className="flex flex-wrap divide-x divide-gray-200 dark:divide-gray-800">
                {STATS.map((stat, i) => (
                  <div key={stat.label} className={cn('pr-5 sm:pr-8', i > 0 && 'pl-5 sm:pl-8')}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="font-display text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl md:text-4xl">
                      <CountUp end={stat.value} suffix={stat.suffix} duration={2200} />
                    </dd>
                    <dd className="mt-1 text-[10px] uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 sm:text-xs sm:tracking-[0.14em]">
                      {stat.label}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          {/* ── Featured assembly, in 3D. Display only — it turns by itself. ── */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 30 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
            className="order-2 min-w-0"
          >
            {pot ? (
              // Equal-size frames for both: `autoFit` fills whatever box it's
              // given, so a smaller box is what would make the bottle look tiny,
              // not the model itself. Stacked as a zigzag on phones, side by
              // side from `sm`, bottom-aligned so both stand on the same shelf.
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-6">
                <HeroFigure index={1} family={dict.hero.featured_pot} data={pot} delay={0.9}>
                  <HeroAssembly data={pot} explode={effectiveExplode} className={STAGE_H} />
                </HeroFigure>
                {bottle && (
                  <HeroFigure index={2} family={dict.hero.featured_bottle} data={bottle} flip delay={1.05}>
                    <HeroBottleAssembly data={bottle} explode={effectiveExplode} className={STAGE_H} />
                  </HeroFigure>
                )}
              </div>
            ) : (
              <div className="flex h-[400px] items-center justify-center text-gray-400 dark:text-gray-600">
                <PotMark className="h-auto w-56" />
              </div>
            )}
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
