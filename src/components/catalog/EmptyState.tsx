'use client';

import { SearchX } from 'lucide-react';
import { useLang } from '@/lib/LangContext';

interface EmptyStateProps {
  message: string;
  onClearFilters?: () => void;
}

export default function EmptyState({ message, onClearFilters }: EmptyStateProps) {
  const { dict } = useLang();

  return (
    <div className="flex flex-col items-center rounded-md border border-dashed border-gray-300 px-6 py-16 text-center dark:border-gray-700">
      <SearchX className="mb-4 h-8 w-8 text-gray-400" aria-hidden />
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{dict.catalog.filters.no_results}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-gray-600 dark:text-gray-400">{message}</p>
      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-6 h-10 rounded-md border border-gray-300 px-4 text-sm font-medium text-gray-800 hover:border-gray-500 dark:border-gray-700 dark:text-gray-200"
        >
          {dict.catalog.filters.clear_all}
        </button>
      )}
    </div>
  );
}
