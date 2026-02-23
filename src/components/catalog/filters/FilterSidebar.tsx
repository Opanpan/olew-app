'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal } from 'lucide-react';
import { FilterState, ProductCategory } from '@/types/catalog';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';
import { getUniqueTypes } from '@/lib/catalogUtils';
import { bottlesData, capsData } from '@/data/products';
import FilterSection from './FilterSection';
import TypeFilter from './TypeFilter';
import RangeFilter from './RangeFilter';
interface FilterSidebarProps {
  filters: FilterState;
  updateFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  productType: ProductCategory;
  defaultRanges: {
    weight: [number, number];
    width: [number, number];
    height: [number, number];
  };
}

export default function FilterSidebar({
  filters,
  updateFilters,
  clearFilters,
  productType,
  defaultRanges,
}: FilterSidebarProps) {
  const { dict } = useLang();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Get available types for this product category
  const products = productType === 'bottle' ? bottlesData : capsData;
  const availableTypes = getUniqueTypes(products);

  const FilterContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
            {dict.catalog.filters.title}
          </h2>
        </div>
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
        >
          {dict.catalog.filters.clear_all}
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-0">
        {/* Type Filter */}
        <FilterSection title={dict.catalog.filters.type}>
          <TypeFilter
            types={availableTypes}
            selectedTypes={filters.types}
            onChange={(types) => updateFilters({ types })}
          />
        </FilterSection>

        {/* Weight Range */}
        <FilterSection title={dict.catalog.filters.weight}>
          <RangeFilter
            value={filters.weightRange}
            onChange={(weightRange) => updateFilters({ weightRange })}
            min={defaultRanges.weight[0]}
            max={defaultRanges.weight[1]}
            step={1}
            unit="g"
          />
        </FilterSection>

        {/* Width Range */}
        <FilterSection title={dict.catalog.filters.width}>
          <RangeFilter
            value={filters.widthRange}
            onChange={(widthRange) => updateFilters({ widthRange })}
            min={defaultRanges.width[0]}
            max={defaultRanges.width[1]}
            step={1}
            unit="mm"
          />
        </FilterSection>

        {/* Height Range */}
        <FilterSection title={dict.catalog.filters.height}>
          <RangeFilter
            value={filters.heightRange}
            onChange={(heightRange) => updateFilters({ heightRange })}
            min={defaultRanges.height[0]}
            max={defaultRanges.height[1]}
            step={1}
            unit="mm"
          />
        </FilterSection>

      </div>
    </>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open filters"
        className="lg:hidden fixed bottom-6 right-4 md:right-6 z-40 btn-primary px-5 py-3.5 md:px-6 md:py-4 rounded-full shadow-2xl flex items-center gap-2 min-h-[52px] text-sm md:text-base"
      >
        <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
        <span className="font-semibold">Filters</span>
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block lg:w-80 flex-shrink-0">
        <div className="sticky top-24 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg max-h-[calc(100vh-8rem)] overflow-y-auto">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                {/* Close Button */}
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>

                <FilterContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
