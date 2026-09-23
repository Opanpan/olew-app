'use client';

/**
 * Home-page welcome panel: the logo on a full-screen panel that splits and
 * lifts away to reveal the hero.
 *
 * It is held up until the hero's 3D assembly is actually on screen, not for a
 * fixed duration. The page's copy paints in milliseconds while the GLBs take
 * seconds, so a timer left the visitor looking at a finished headline beside a
 * "Loading 3D model… 55%" spinner. Waiting on the real signal means the first
 * complete thing they see is the finished hero.
 *
 * The panel is up from the very first paint, server render included. Deciding
 * to show it in an effect meant the page painted its header and empty hero
 * first and the panel dropped over the top a moment later, which read as a
 * glitch rather than an intro.
 *
 * Two guards keep it from becoming its own problem:
 *  - it stays for at least MIN_SHOW_MS, so a warm cache can't make it blink;
 *  - it lifts after MAX_WAIT_MS regardless, so a failed or very slow download
 *    never traps anyone behind it.
 */

import { useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EASE } from './motion';
import {
  getHeroProgress, getHeroProgressServer, getHeroReady, getHeroReadyServer, subscribeHeroReady,
} from '@/lib/heroReady';

/** Minimum time on screen, so a fast load doesn't make the panel blink. */
const MIN_SHOW_MS = 650;
/**
 * Hard ceiling — a broken or very slow model must not trap the visitor. The
 * assembly is several megabytes of GLB from a remote host, so this is generous
 * enough to cover a normal connection; past it the page reveals and the viewer
 * finishes loading behind its own inline spinner.
 */
const MAX_WAIT_MS = 20000;

export default function IntroCurtain() {
  const reduced = useReducedMotion();
  const heroReady = useSyncExternalStore(subscribeHeroReady, getHeroReady, getHeroReadyServer);
  const progress = useSyncExternalStore(subscribeHeroReady, getHeroProgress, getHeroProgressServer);
  // Starts up, and is rendered on the server too, so the panel IS the first
  // paint rather than something that arrives over the top of one. Seeded from
  // the latch so a client-side navigation back to the home page — where the
  // model is already in memory — doesn't render it for a frame first.
  const [dismissed, setDismissed] = useState(getHeroReady);
  const [minShownPassed, setMinShownPassed] = useState(false);
  const show = !dismissed;

  useEffect(() => {
    // Nothing to wait for: the model is already in memory (a client-side
    // navigation back to the home page), or the visitor landed mid-page and the
    // hero isn't what they came for.
    if (getHeroReady() || window.scrollY > 0) {
      setDismissed(true);
      return;
    }
    const min = window.setTimeout(() => setMinShownPassed(true), MIN_SHOW_MS);
    const cap = window.setTimeout(() => setDismissed(true), MAX_WAIT_MS);
    return () => {
      window.clearTimeout(min);
      window.clearTimeout(cap);
    };
  }, []);

  // Hold the page still while the panel is up so the reveal isn't fighting a
  // scroll the visitor started.
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  useEffect(() => {
    if (heroReady && minShownPassed) setDismissed(true);
  }, [heroReady, minShownPassed]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE } }}
          aria-hidden
        >
          {/* Two halves that part vertically — a seam of the hero shows through
              the middle first, which reads as a reveal rather than a fade. */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900"
            initial={{ y: 0 }}
            exit={{ y: '-100%', transition: { duration: 0.85, ease: EASE } }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white to-gray-50 dark:from-gray-950 dark:to-gray-900"
            initial={{ y: 0 }}
            exit={{ y: '100%', transition: { duration: 0.85, ease: EASE } }}
          />

          <motion.div
            className="relative flex flex-col items-center gap-4"
            initial={reduced ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: reduced ? 0 : 0.7, ease: EASE } }}
            exit={{ opacity: 0, scale: 1.06, transition: { duration: 0.35, ease: EASE } }}
          >
            <motion.div
              animate={reduced ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/images/logos/olew-logo.png"
                alt=""
                width={96}
                height={96}
                priority
                className="h-16 w-16 md:h-20 md:w-20"
              />
            </motion.div>

            <div className="overflow-hidden">
              <motion.p
                className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl"
                initial={reduced ? false : { y: '110%' }}
                animate={{ y: '0%', transition: { duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.15, ease: EASE } }}
              >
                Olew Group
              </motion.p>
            </div>

            {/* Thin rule carrying the model's real download progress, so a
                multi-megabyte wait reads as progress rather than a hang. */}
            <span
              role="progressbar"
              aria-label="Loading"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              className="block h-px w-24 overflow-hidden bg-gray-200 dark:bg-gray-800"
            >
              <motion.span
                className="block h-full origin-left bg-primary-500/70"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: Math.max(progress, 4) / 100 }}
                transition={{ duration: reduced ? 0 : 0.4, ease: 'easeOut' }}
                style={{ width: '100%' }}
              />
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
