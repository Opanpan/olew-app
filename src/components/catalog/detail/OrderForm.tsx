'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Check } from 'lucide-react';
import { Product } from '@/types/catalog';
import { useCompare } from '@/lib/CompareContext';
import type { CompareItem } from '@/lib/CompareContext';
import { useLang } from '@/lib/LangContext';

interface OrderFormProps {
  product: Product;
}

export default function OrderForm({ product }: OrderFormProps) {
  const { toggle, has, canAdd } = useCompare();
  const { dict } = useLang();
  const c = dict.catalog.compare;
  const [showMaxMsg, setShowMaxMsg] = useState(false);
  const isComparing = has(product.id);

  const handleToggle = () => {
    const item: CompareItem = { id: product.id, name_en: product.name, name_id: product.name, thumbnail: product.image };
    const ok = toggle(item);
    if (!ok) {
      setShowMaxMsg(true);
      setTimeout(() => setShowMaxMsg(false), 2500);
    }
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {showMaxMsg ? (
          <motion.div
            key="max"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full py-4 rounded-full bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 text-center text-sm font-semibold text-amber-700 dark:text-amber-300"
          >
            {c.max_reached}
          </motion.div>
        ) : (
          <motion.button
            key="btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggle}
            disabled={!isComparing && !canAdd}
            className={`
              w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-5 text-xs md:text-base font-semibold min-h-[44px] md:min-h-[52px] rounded-full border-2 transition-all duration-300
              ${isComparing
                ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/30'
                : 'bg-transparent text-primary-600 dark:text-primary-400 border-primary-500 hover:bg-primary-500 hover:text-white'
              }
            `}
          >
            {isComparing ? (
              <Check className="w-4 h-4 md:w-6 md:h-6" />
            ) : (
              <ArrowLeftRight className="w-4 h-4 md:w-6 md:h-6" />
            )}
            {isComparing ? c.added : c.toggle}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
