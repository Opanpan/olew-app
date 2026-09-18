'use client';

/**
 * First-visit welcome: the logo draws itself on a full-screen panel, then the
 * panel splits and lifts away to reveal the hero.
 *
 * Shown once per browser session (sessionStorage) so it greets a first-time
 * visitor without taxing anyone who is clicking around the site, and skipped
 * entirely for `prefers-reduced-motion` and for anyone landing mid-page.
 */

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { EASE } from './motion';

const SEEN_KEY = 'olew:intro-seen';

export default function IntroCurtain() {
  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  // Whether this mount has already made the show/skip call. Kept in a ref so
  // React's development double-invoke doesn't re-read the (now written)
  // sessionStorage flag and bail out, which would leave the curtain up.
  const decided = useRef(false);

  useEffect(() => {
    if (reduced || decided.current) return;
    decided.current = true;

    let seen = true;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1';
    } catch {
      // Private mode or blocked storage: treat as seen rather than replaying
      // the intro on every navigation.
    }
    if (seen || window.scrollY > 0) return;

    setShow(true);
    try {
      sessionStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* non-fatal */
    }
  }, [reduced]);

  // Hold the page still while the curtain is up so the reveal isn't fighting a
  // scroll the visitor started, and take it down on its own timer.
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const done = window.setTimeout(() => setShow(false), 1900);
    return () => {
      window.clearTimeout(done);
      document.body.style.overflow = prev;
    };
  }, [show]);

  if (reduced) return null;

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
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.7, ease: EASE } }}
            exit={{ opacity: 0, scale: 1.06, transition: { duration: 0.35, ease: EASE } }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
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
                initial={{ y: '110%' }}
                animate={{ y: '0%', transition: { duration: 0.7, delay: 0.15, ease: EASE } }}
              >
                Olew Group
              </motion.p>
            </div>

            {/* Thin progress rule: gives the pause a reason to exist. */}
            <motion.span
              className="block h-px w-24 origin-left bg-primary-500/60"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1, transition: { duration: 1.5, ease: 'easeInOut' } }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
