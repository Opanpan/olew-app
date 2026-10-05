'use client';

import { ReactNode, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';

/**
 * Turns on `html.smooth-scroll` at the visitor's first interaction. Before
 * that, the only scrolling is the browser restoring the previous position on
 * reload, which should jump straight there rather than animate from the top.
 */
function useSmoothScrollAfterInteraction() {
  useEffect(() => {
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    const enable = () => {
      document.documentElement.classList.add('smooth-scroll');
      events.forEach((e) => window.removeEventListener(e, enable));
    };
    events.forEach((e) => window.addEventListener(e, enable, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, enable));
  }, []);
}

type HotModule = { hot?: { addStatusHandler(fn: (status: string) => void): void } };

/**
 * Dev only: every hot reload brings the page back to the top, so an edit is
 * always reviewed from the hero down. A Fast Refresh glides up smoothly; a full
 * reload (e.g. after editing `dictionary.ts`) simply lands at the top instead
 * of the browser restoring the old position.
 */
function useScrollTopOnHotReload() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    window.history.scrollRestoration = 'manual';

    // Status handlers are global and outlive this module, so register once.
    const w = window as typeof window & { __olewHmrScroll?: boolean };
    const hot = typeof module !== 'undefined' ? (module as unknown as HotModule).hot : undefined;
    if (!hot || w.__olewHmrScroll) return;
    w.__olewHmrScroll = true;
    let applied = false;
    hot.addStatusHandler((status) => {
      if (status === 'apply') applied = true;
      if (status === 'idle' && applied) {
        applied = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }, []);
}

export function Providers({ children }: { children: ReactNode }) {
  useSmoothScrollAfterInteraction();
  useScrollTopOnHotReload();
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="olew-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
