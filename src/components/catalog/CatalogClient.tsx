'use client';

import { useCallback, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductListItem, ProductFiltersData, AttributeDefinition } from '@/lib/publicApi';
import { cn } from '@/lib/utils';
import ApiFilterSidebar from './filters/ApiFilterSidebar';
import ApiProductGrid from './ApiProductGrid';
import EmptyState from './EmptyState';

const PAGE_SIZE = 12;

interface CatalogClientProps {
  products: ProductListItem[];
  filterData: ProductFiltersData | null;
  attrDefs?: AttributeDefinition[];
  lang: string;
  emptyMessage: string;
  searchPlaceholder: string;
  showingLabel: string;
  resultsLabel: string;
}

export default function CatalogClient({
  products,
  filterData,
  attrDefs = [],
  lang,
  emptyMessage,
  searchPlaceholder,
  showingLabel,
  resultsLabel,
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('category_id') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const sortParam = searchParams.get('sort') ?? 'default';

  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Parse active attribute filters from URL: attr_material=PET,HDPE
  const activeAttrs: Record<string, string[]> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('attr_')) activeAttrs[key.slice(5)] = value.split(',').filter(Boolean);
  });

  // Parse active range filters from URL: range_diameter=30,60
  const activeRanges: Record<string, [number, number]> = {};
  searchParams.forEach((value, key) => {
    if (key.startsWith('range_')) {
      const parts = value.split(',').map(v => Math.round(Number(v)));
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        activeRanges[key.slice(6)] = [parts[0], parts[1]];
      }
    }
  });

  const push = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (!v) params.delete(k); else params.set(k, v);
    });
    params.delete('page');
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push({ search: value || null }), 400);
  }, [push]);

  const handleCategory = useCallback((id: string) =>
    push({ category_id: categoryId === id ? null : id }), [categoryId, push]);

  const handleAttr = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const k = `attr_${key}`;
    const cur = (params.get(k) ?? '').split(',').filter(Boolean);
    const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value];
    if (next.length === 0) params.delete(k); else params.set(k, next.join(','));
    params.delete('page');
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleRange = useCallback((key: string, range: [number, number]) =>
    push({ [`range_${key}`]: range.join(',') }), [push]);

  const handleClear = useCallback(() => {
    router.push('?', { scroll: false });
    setSearchInput('');
  }, [router]);

  const handlePage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // Client-side attribute filtering — now uses real attribute values from the API list response
  const filtered = products.filter(p => {
    const attrEntries = Object.entries(activeAttrs).filter(([, v]) => v.length > 0);
    const passesAttrs = attrEntries.every(([key, vals]) => {
      const attrValue = p.attributes?.[key]?.value;
      // If the product has no data for this attribute key, exclude it only when
      // strict filtering is desired; here we keep products missing the attribute
      // so users don't get an empty list when attributes aren't fully populated yet.
      if (!attrValue) return true;
      return vals.includes(attrValue);
    });
    if (!passesAttrs) return false;

    const rangeEntries = Object.entries(activeRanges);
    return rangeEntries.every(([key, [lo, hi]]) => {
      const rawValue = p.attributes?.[key]?.value;
      const num = rawValue ? parseFloat(rawValue) : NaN;
      // Same "keep if missing/unparseable" behavior as the categorical filters above.
      if (Number.isNaN(num)) return true;
      return num >= lo && num <= hi;
    });
  });

  const sorted = [...filtered].sort((a, b) => {
    const na = lang === 'id' ? a.name_id : a.name_en;
    const nb = lang === 'id' ? b.name_id : b.name_en;
    if (sortParam === 'name_asc') return na.localeCompare(nb);
    if (sortParam === 'name_desc') return nb.localeCompare(na);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageProducts = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <ApiFilterSidebar
        filterData={filterData}
        attrDefs={attrDefs}
        lang={lang}
        categoryId={categoryId}
        activeAttrs={activeAttrs}
        activeRanges={activeRanges}
        onCategoryChange={handleCategory}
        onAttrChange={handleAttr}
        onRangeChange={handleRange}
        onClearAll={handleClear}
      />

      <div className="flex-1 min-w-0">
        {/* Search + sort bar */}
        <div className="flex flex-col gap-3 md:gap-4 mb-6">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={e => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                'w-full pl-11 pr-10 py-3 rounded-xl',
                'bg-white dark:bg-gray-900',
                'border border-gray-200 dark:border-gray-700',
                'text-sm text-gray-900 dark:text-white placeholder-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                'transition-all duration-200'
              )}
            />
            {searchInput && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {showingLabel}{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{sorted.length}</span>{' '}
              {resultsLabel}
            </p>
            <select
              value={sortParam}
              onChange={e => push({ sort: e.target.value === 'default' ? null : e.target.value })}
              className="px-3 py-2 rounded-xl text-sm border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer transition-all"
            >
              <option value="default">Default</option>
              <option value="name_asc">Name A-Z</option>
              <option value="name_desc">Name Z-A</option>
            </select>
          </div>
        </div>

        {/* Grid or empty */}
        {pageProducts.length === 0 ? (
          <EmptyState message={emptyMessage} onClearFilters={handleClear} />
        ) : (
          <ApiProductGrid products={pageProducts} lang={lang} />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6">
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page <= 1}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                page <= 1
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-transparent cursor-not-allowed'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600'
              )}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
              Page <span className="font-semibold text-gray-900 dark:text-white">{page}</span>
              {' '}of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
            </span>
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                page >= totalPages
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-transparent cursor-not-allowed'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600'
              )}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
