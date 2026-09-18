'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import type { ProductListItem, ProductFiltersData, AttributeDefinition } from '@/lib/publicApi';
import { buildFacets, matchesFilters, optionCounts, type ActiveFilters } from '@/lib/catalogFacets';
import { useLang } from '@/lib/LangContext';
import ApiFilterSidebar from './filters/ApiFilterSidebar';
import AppliedFilters from './filters/AppliedFilters';
import ApiProductGrid from './ApiProductGrid';
import EmptyState from './EmptyState';
import SelectMenu from '@/components/shared/SelectMenu';

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
  const { dict } = useLang();
  const f = dict.catalog.filters;

  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('category_id') ?? '';
  const sortParam = searchParams.get('sort') ?? 'default';

  const [searchInput, setSearchInput] = useState(search);
  const [mobileOpen, setMobileOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setSearchInput(search); }, [search]);

  const categories = filterData?.categories ?? [];
  const facets = useMemo(() => buildFacets(products, attrDefs, lang), [products, attrDefs, lang]);

  // URL → filters. Values are validated against the current facets so stale or
  // hand-edited params can't silently empty the grid.
  // attr_material=PET&attr_material=HDPE · range_height=40,120
  const filters = useMemo<ActiveFilters>(() => {
    const attrs: ActiveFilters['attrs'] = {};
    const ranges: ActiveFilters['ranges'] = {};
    for (const facet of facets) {
      if (facet.kind === 'options') {
        const vals = searchParams.getAll(`attr_${facet.key}`).filter((v) => facet.options.includes(v));
        if (vals.length) attrs[facet.key] = vals;
      } else {
        const [lo, hi] = (searchParams.get(`range_${facet.key}`) ?? '').split(',').map(Number);
        if (!Number.isFinite(lo) || !Number.isFinite(hi)) continue;
        const range: [number, number] = [Math.max(facet.min, lo), Math.min(facet.max, hi)];
        if (range[0] > facet.min || range[1] < facet.max) ranges[facet.key] = range;
      }
    }
    return { attrs, ranges };
  }, [facets, searchParams]);

  const activeCount =
    (categoryId ? 1 : 0) +
    Object.values(filters.attrs).reduce((n, v) => n + v.length, 0) +
    Object.keys(filters.ranges).length;

  // Filter changes replace the history entry so Back leaves the catalog
  // instead of stepping through every checkbox click.
  const navigate = useCallback((mutate: (params: URLSearchParams) => void, method: 'push' | 'replace' = 'replace') => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router[method](qs ? `?${qs}` : '?', { scroll: false });
  }, [router, searchParams]);

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => navigate((p) => {
      if (value) p.set('search', value); else p.delete('search');
      p.delete('page');
    }), 400);
  }, [navigate]);

  const handleCategory = useCallback((id: string | null) => navigate((p) => {
    if (id) p.set('category_id', id); else p.delete('category_id');
    p.delete('page');
  }), [navigate]);

  const handleToggleOption = useCallback((key: string, value: string) => navigate((p) => {
    const k = `attr_${key}`;
    const cur = p.getAll(k);
    p.delete(k);
    (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]).forEach((v) => p.append(k, v));
    p.delete('page');
  }), [navigate]);

  const handleRange = useCallback((key: string, range: [number, number]) => navigate((p) => {
    const facet = facets.find((x) => x.key === key);
    const isFull = facet?.kind === 'range' && range[0] <= facet.min && range[1] >= facet.max;
    if (isFull) p.delete(`range_${key}`); else p.set(`range_${key}`, range.join(','));
    p.delete('page');
  }), [navigate, facets]);

  const handleRangeClear = useCallback((key: string) => navigate((p) => {
    p.delete(`range_${key}`);
    p.delete('page');
  }), [navigate]);

  // Clears filters only — the search box and sort order are separate controls.
  const handleClear = useCallback(() => navigate((p) => {
    Array.from(p.keys()).forEach((k) => {
      if (k.startsWith('attr_') || k.startsWith('range_') || k === 'category_id' || k === 'page') p.delete(k);
    });
  }), [navigate]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const filtered = useMemo(() => products.filter((p) => matchesFilters(p, filters)), [products, filters]);

  const counts = useMemo(() => {
    const out: Record<string, Record<string, number>> = {};
    facets.forEach((facet) => { if (facet.kind === 'options') out[facet.key] = optionCounts(products, filters, facet); });
    return out;
  }, [products, filters, facets]);

  const sorted = useMemo(() => {
    if (sortParam !== 'name_asc' && sortParam !== 'name_desc') return filtered;
    const name = (p: ProductListItem) => (lang === 'id' ? p.name_id : p.name_en);
    const dir = sortParam === 'name_asc' ? 1 : -1;
    return [...filtered].sort((a, b) => dir * name(a).localeCompare(name(b), undefined, { numeric: true }));
  }, [filtered, sortParam, lang]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(totalPages, Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1));
  const pageProducts = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePage = useCallback((newPage: number) => {
    navigate((p) => p.set('page', String(newPage)), 'push');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [navigate]);

  const pageButton = 'flex h-10 items-center gap-1.5 rounded-md border px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 border-gray-300 text-gray-800 enabled:hover:border-gray-500 dark:border-gray-700 dark:text-gray-200';

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
      <ApiFilterSidebar
        facets={facets}
        categories={categories}
        categoryId={categoryId}
        filters={filters}
        counts={counts}
        resultCount={sorted.length}
        activeCount={activeCount}
        lang={lang}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        onCategoryChange={handleCategory}
        onToggleOption={handleToggleOption}
        onRangeChange={handleRange}
        onClearAll={handleClear}
      />

      <div className="flex-1 min-w-0">
        {/* Search + sort bar */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-11 w-full rounded-md border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white [&::-webkit-search-cancel-button]:appearance-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => handleSearch('')}
                aria-label={f.clear_all}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 px-3.5 text-sm font-medium text-gray-800 dark:border-gray-700 dark:text-gray-200"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden />
                {f.filters_button}
                {activeCount > 0 && <span className="tabular-nums text-primary-700 dark:text-primary-300">({activeCount})</span>}
              </button>
              <p className="hidden text-sm text-gray-600 dark:text-gray-400 sm:block" aria-live="polite">
                {showingLabel}{' '}
                <span className="font-medium tabular-nums text-gray-900 dark:text-white">{sorted.length}</span> {resultsLabel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-gray-600 dark:text-gray-400 sm:inline" aria-hidden>{f.sort_by}</span>
              <SelectMenu
                label={f.sort_by}
                value={sortParam}
                options={[
                  { value: 'default', label: f.sort_default },
                  { value: 'name_asc', label: f.sort_name_asc },
                  { value: 'name_desc', label: f.sort_name_desc },
                ]}
                onChange={(value) => navigate((p) => {
                  if (value === 'default') p.delete('sort'); else p.set('sort', value);
                  p.delete('page');
                })}
                className="w-36 sm:w-40"
              />
            </div>
          </div>
          {/* Phones: the count gets its own line so the toolbar row never overflows
              (Indonesian labels are long enough to push the page sideways at 320px). */}
          <p className="text-sm text-gray-600 dark:text-gray-400 sm:hidden">
            <span className="font-medium tabular-nums text-gray-900 dark:text-white">{sorted.length}</span> {resultsLabel}
          </p>
        </div>

        <AppliedFilters
          facets={facets}
          categories={categories}
          categoryId={categoryId}
          filters={filters}
          lang={lang}
          onCategoryChange={handleCategory}
          onToggleOption={handleToggleOption}
          onRangeClear={handleRangeClear}
          onClearAll={handleClear}
        />

        {pageProducts.length === 0 ? (
          <EmptyState message={emptyMessage} onClearFilters={activeCount > 0 ? handleClear : undefined} />
        ) : (
          <ApiProductGrid products={pageProducts} lang={lang} />
        )}

        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-3 pt-8">
            <button type="button" onClick={() => handlePage(page - 1)} disabled={page <= 1} aria-label={f.previous} className={pageButton}>
              <ChevronLeft className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">{f.previous}</span>
            </button>
            <span className="px-2 text-sm tabular-nums text-gray-600 dark:text-gray-400">
              {f.page_of.replace('{page}', String(page)).replace('{total}', String(totalPages))}
            </span>
            <button type="button" onClick={() => handlePage(page + 1)} disabled={page >= totalPages} aria-label={f.next} className={pageButton}>
              <span className="hidden sm:inline">{f.next}</span> <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
