'use client';

import { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { FilterState } from '@/types/catalog';
import { useLang } from '@/lib/LangContext';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface CatalogToolbarProps {
  filters: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
  resultCount: number;
}

export default function CatalogToolbar({
  filters,
  updateFilters,
  resultCount,
}: CatalogToolbarProps) {
  const { dict } = useLang();
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery);
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearch !== filters.searchQuery) {
      updateFilters({ searchQuery: debouncedSearch });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    setSearchQuery(filters.searchQuery);
  }, [filters.searchQuery]);

  const sortOptions = [
    { value: 'name', label: dict.catalog.sort.name },
    { value: 'price-asc', label: dict.catalog.sort.price_asc },
    { value: 'price-desc', label: dict.catalog.sort.price_desc },
    { value: 'newest', label: dict.catalog.sort.newest },
  ] as const;

  return (
    <div className="flex flex-col gap-3 md:gap-4 mb-6">
      {/* Search Bar - Full width on mobile */}
      <div className="relative w-full">
        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={dict.catalog.filters.search_placeholder}
          className={cn(
            'w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-3.5 rounded-xl text-sm md:text-base',
            'bg-white dark:bg-gray-900',
            'border border-gray-200 dark:border-gray-700',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all min-h-[44px]'
          )}
        />
      </div>

      {/* Bottom Row: Result Count + Sort */}
      <div className="flex items-center justify-between gap-3">
        {/* Result Count */}
        <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
          <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
            {resultCount}
          </span>{' '}
          {dict.catalog.filters.results}
        </div>

        {/* Sort Dropdown */}
        <div className="relative flex-1 md:flex-initial min-w-0">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              updateFilters({ sortBy: e.target.value as FilterState['sortBy'] })
            }
            aria-label={dict.catalog.filters.sort_by}
            className={cn(
              'appearance-none w-full pl-3 md:pl-4 pr-8 md:pr-10 py-3 md:py-3.5 rounded-xl',
              'bg-white dark:bg-gray-900',
              'border border-gray-200 dark:border-gray-700',
              'text-gray-900 dark:text-white text-xs md:text-sm',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'transition-all cursor-pointer',
              'md:min-w-[180px] min-h-[44px]'
            )}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
