'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCompare, type CompareItem } from '@/lib/CompareContext';
import { useLang } from '@/lib/LangContext';
import ImgWithFallback, { PRODUCT_PLACEHOLDER } from '@/components/shared/ImgWithFallback';

export default function CompareBar() {
  const { list, remove, clear, count, max } = useCompare();
  const { lang, dict } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const c = dict.catalog.compare;
  const ready = count >= 2;
  // The compare page is the bar's destination — showing "Compare Now" there is noise.
  const onComparePage = /\/compare\/?$/.test(pathname ?? '');

  const handleCompare = () => {
    const ids = list.map((p) => p.id).join(',');
    router.push(`/${lang}/compare?ids=${ids}`);
  };

  return (
    <AnimatePresence>
      {count > 0 && !onComparePage && (
        <motion.div
          role="region"
          aria-label={c.page_title}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'tween', duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-4 md:px-6" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
            <div className="hidden shrink-0 sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white tabular-nums">
                {c.bar_count.replace('{count}', String(count)).replace('{max}', String(max))}
              </p>
              {!ready && <p className="text-xs text-gray-500 dark:text-gray-400">{c.min_hint}</p>}
            </div>

            <ul className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
              {list.map((product: CompareItem) => {
                const name = lang === 'id' ? product.name_id : product.name_en;
                return (
                  <li
                    key={product.id}
                    className="flex h-12 min-w-0 shrink-0 items-center gap-2 rounded-md border border-gray-200 pl-1 pr-0.5 dark:border-gray-800 md:w-48 md:shrink"
                  >
                    <ImgWithFallback
                      src={product.thumbnail}
                      alt=""
                      fallback={PRODUCT_PLACEHOLDER}
                      className="h-10 w-10 shrink-0 rounded object-cover bg-gray-100 dark:bg-gray-800"
                    />
                    <span className="hidden min-w-0 flex-1 truncate text-xs text-gray-800 dark:text-gray-200 md:block" title={name}>
                      {name}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      aria-label={`${c.remove} ${name}`}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
              {Array.from({ length: max - count }).map((_, i) => (
                <li
                  key={`slot-${i}`}
                  aria-hidden
                  className="hidden h-12 w-48 shrink rounded-md border border-dashed border-gray-300 dark:border-gray-700 md:block"
                />
              ))}
            </ul>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={clear}
                className="hidden text-sm text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white sm:block"
              >
                {c.clear_all}
              </button>
              <button
                type="button"
                onClick={handleCompare}
                disabled={!ready}
                title={ready ? undefined : c.min_hint}
                className="h-10 whitespace-nowrap rounded-md bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
              >
                {c.compare_now}
                <span className="ml-1 tabular-nums sm:hidden">({count})</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
