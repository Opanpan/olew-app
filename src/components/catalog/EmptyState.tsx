'use client';

import { motion } from 'framer-motion';
import { SearchX, PackageX } from 'lucide-react';
import { useLang } from '@/lib/LangContext';

interface EmptyStateProps {
  message: string;
  onClearFilters?: () => void;
}

export default function EmptyState({ message, onClearFilters }: EmptyStateProps) {
  const { dict } = useLang();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full" />
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-full p-8">
          <SearchX className="w-16 h-16 text-gray-400 dark:text-gray-600" />
        </div>
      </div>

      {/* Message */}
      <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
        No Products Found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
        {message}
      </p>

      {/* Clear Filters Button */}
      {onClearFilters && (
        <button onClick={onClearFilters} className="btn-outline px-8 py-3">
          {dict.catalog.filters.clear_all}
        </button>
      )}

      {/* Suggestions */}
      <div className="mt-12 text-sm text-gray-500 dark:text-gray-500 max-w-md">
        <p className="font-semibold mb-2">Try:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Adjusting your filter criteria</li>
          <li>Clearing all filters</li>
          <li>Using different search terms</li>
          <li>Expanding price or dimension ranges</li>
        </ul>
      </div>
    </motion.div>
  );
}
