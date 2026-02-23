'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { FilterState } from '@/types/catalog';
import { useLang } from '@/lib/LangContext';

interface ActiveFiltersProps {
  filters: FilterState;
  defaultRanges: {
    weight: [number, number];
    width: [number, number];
    height: [number, number];
  };
  onRemoveType: (type: string) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  filters,
  defaultRanges,
  onRemoveType,
  onClearAll,
}: ActiveFiltersProps) {
  const { dict } = useLang();

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.searchQuery !== '' ||
    filters.weightRange[0] !== defaultRanges.weight[0] ||
    filters.weightRange[1] !== defaultRanges.weight[1] ||
    filters.widthRange[0] !== defaultRanges.width[0] ||
    filters.widthRange[1] !== defaultRanges.width[1] ||
    filters.heightRange[0] !== defaultRanges.height[0] ||
    filters.heightRange[1] !== defaultRanges.height[1];

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <AnimatePresence mode="popLayout">
        {/* Type filters */}
        {filters.types.map((type) => (
          <motion.button
            key={type}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onRemoveType(type)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors group"
          >
            <span>{type}</span>
            <X className="w-3 h-3 group-hover:scale-110 transition-transform" />
          </motion.button>
        ))}

        {/* Search query */}
        {filters.searchQuery && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium"
          >
            <span>Search: &quot;{filters.searchQuery}&quot;</span>
          </motion.div>
        )}

        {/* Clear all button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onClearAll}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {dict.catalog.filters.clear_all}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
