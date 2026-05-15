'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, X, Droplet, Package, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCompare } from '@/lib/CompareContext';
import { useLang } from '@/lib/LangContext';

export default function CompareBar() {
  const { list, remove, clear, count, max } = useCompare();
  const { lang, dict } = useLang();
  const router = useRouter();
  const c = dict.catalog.compare;

  const handleCompare = () => {
    const ids = list.map(p => p.id).join(',');
    router.push(`/${lang}/compare?ids=${ids}`);
  };

  const barText = c.bar_count
    .replace('{count}', String(count))
    .replace('{max}', String(max));

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        >
          {/* Backdrop blur layer */}
          <div className="pointer-events-auto mx-auto max-w-7xl px-4 pb-4 pt-2">
            <div className="relative rounded-2xl overflow-hidden border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-black/25">
              {/* Glassmorphism background */}
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl" />

              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 via-sky-400 to-primary-600" />

              <div className="relative px-4 py-3 md:px-6 md:py-4 flex items-center gap-3 md:gap-4">
                {/* Count badge + label */}
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 border border-primary-200 dark:border-primary-800">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                    <span className="text-xs font-bold text-primary-700 dark:text-primary-300">{barText}</span>
                  </div>
                </div>

                {/* Product slots */}
                <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                  {list.map((product) => {
                    const Icon = product.category === 'bottle' ? Droplet : Package;
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group"
                      >
                        {/* Thumbnail */}
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-50 to-sky-50 dark:from-primary-900/30 dark:to-sky-900/30 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <Icon className="w-4 h-4 text-primary-500" />
                          )}
                        </div>

                        {/* Name */}
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[100px] truncate hidden md:block">
                          {product.name}
                        </span>

                        {/* Remove */}
                        <button
                          onClick={() => remove(product.id)}
                          className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex-shrink-0"
                          aria-label={`Remove ${product.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    );
                  })}

                  {/* Empty slots */}
                  {Array.from({ length: max - count }).map((_, i) => (
                    <div
                      key={`slot-${i}`}
                      className="flex-shrink-0 w-8 h-8 md:w-[140px] md:h-11 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center hidden md:flex"
                    >
                      <span className="text-[10px] text-gray-400 hidden md:block">+ add</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={clear}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium hidden sm:block"
                  >
                    {c.clear_all}
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCompare}
                    disabled={count < 2}
                    className={`
                      flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all
                      ${count >= 2
                        ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span className="hidden sm:inline">{c.compare_now}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
