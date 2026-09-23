'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useLang } from '@/lib/LangContext';
import CountUp from '../shared/CountUp';
import { EASE, Reveal, WordReveal } from '@/components/shared/motion';
import type { HeroAssemblyData } from '@/lib/heroAssembly';
import { markHeroReady } from '@/lib/heroReady';
import HeroAssembly from './HeroAssembly';

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

export default function HeroSection({ assembly }: { assembly: HeroAssemblyData | null }) {
  const { lang, dict } = useLang();
  const reduced = useReducedMotion();

  // No assembly means no 3D will ever load, so release the intro curtain
  // immediately rather than making the visitor wait out its timeout.
  useEffect(() => {
    if (!assembly) markHeroReady();
  }, [assembly]);

  const titleWords = dict.hero.title.split(' ');
  const accentFrom = Math.max(titleWords.length - 2, 0);

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-x-clip overflow-y-hidden pt-24 md:pt-28">
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
            {assembly ? (
              <HeroAssembly data={assembly} />
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
