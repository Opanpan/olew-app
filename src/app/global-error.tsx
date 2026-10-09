'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { dictionaries, type Lang } from '@/lib/dictionary';
import './globals.css';

/**
 * Last-resort boundary: catches render errors no segment boundary handled and
 * reports them to Sentry (in production React swallows these, so without
 * this they'd never be seen). It replaces the root layout, so it brings its
 * own <html>/<body> and stylesheet, and reads the dictionary directly because
 * `LangProvider` is gone too.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const segment = pathname?.split('/')[1];
  const lang: Lang = segment === 'id' ? 'id' : 'en';
  const t = dictionaries[lang].error_page;

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang={lang}>
      <body className="bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h1 className="font-display text-3xl font-bold md:text-4xl">{t.title}</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t.description}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={reset} className="btn-primary">
                {t.retry}
              </button>
              {/* A plain anchor, not <Link>: the router may be what broke. */}
              <a href={`/${lang}`} className="btn-outline">
                {t.home}
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
