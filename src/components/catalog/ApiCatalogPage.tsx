'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getProducts, getProductFiltersData, ProductListItem, ProductMeta, ProductTypeBasic, ProductCategoryBasic } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import ApiProductGrid from './ApiProductGrid';
import EmptyState from './EmptyState';
import { cn } from '@/lib/utils';

interface ApiCatalogPageProps {
  typeFilter?: 'bottle' | 'cap';
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl md:rounded-3xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-lg animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-800" />
      <div className="p-4 md:p-5 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-full mt-4" />
      </div>
    </div>
  );
}

export default function ApiCatalogPage({ typeFilter }: ApiCatalogPageProps) {
  const { lang, dict } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const categoryId = searchParams.get('category_id') ?? '';

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [meta, setMeta] = useState<ProductMeta>({ limit: 12, offset: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [typeId, setTypeId] = useState<string | undefined>(undefined);
  const [filtersTypes, setFiltersTypes] = useState<ProductTypeBasic[]>([]);
  const [filtersCategories, setFiltersCategories] = useState<ProductCategoryBasic[]>([]);
  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load filter data on mount
  useEffect(() => {
    async function loadFilters() {
      const data = await getProductFiltersData();
      if (data) {
        setFiltersTypes(data.types);
        setFiltersCategories(data.categories);

        if (typeFilter === 'bottle') {
          const t = data.types.find((x) => x.name_en === 'Bottle');
          setTypeId(t?.id);
        } else if (typeFilter === 'cap') {
          const t = data.types.find((x) => x.name_en === 'Cap');
          setTypeId(t?.id);
        }
      }
    }
    loadFilters();
  }, [typeFilter]);

  // Fetch products when params change
  useEffect(() => {
    // Wait until we know the typeId (or it's confirmed not needed)
    if (typeFilter && typeId === undefined && filtersTypes.length === 0) return;
    // If typeFilter is set but typeId is still undefined after filters loaded, proceed anyway
    async function loadProducts() {
      setLoading(true);
      const limit = 12;
      const offset = (page - 1) * limit;
      const result = await getProducts({
        limit,
        offset,
        search: search || undefined,
        type_id: typeId,
        category_id: categoryId || undefined,
      });
      setProducts(result.data);
      setMeta(result.meta);
      setLoading(false);
    }
    loadProducts();
  }, [page, search, typeId, categoryId, typeFilter, filtersTypes.length]);

  // Debounced search update
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set('search', value);
        } else {
          params.delete('search');
        }
        params.delete('page');
        router.push(`?${params.toString()}`, { scroll: false });
      }, 400);
    },
    [router, searchParams]
  );

  const handleCategoryToggle = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (categoryId === id) {
        params.delete('category_id');
      } else {
        params.set('category_id', id);
      }
      params.delete('page');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, categoryId]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPage));
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleClearFilters = useCallback(() => {
    router.push('?', { scroll: false });
    setSearchInput('');
  }, [router]);

  const totalPages = Math.ceil(meta.total / meta.limit);
  const showPagination = meta.total > meta.limit;

  // Filter categories to those relevant to the typeFilter (show all if no type constraint)
  const visibleCategories = filtersCategories;

  return (
    <div className="space-y-6">
      {/* Search & Filters bar */}
      <div className="flex flex-col gap-4">
        {/* Search input */}
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={dict.catalog.filters.search_placeholder}
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
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Category filter chips */}
        {visibleCategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((cat) => {
              const catName = lang === 'id' ? cat.name_id : cat.name_en;
              const isActive = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryToggle(cat.id)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
                    isActive
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/25'
                      : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
                  )}
                >
                  {catName}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {dict.catalog.filters.showing}{' '}
          <span className="font-semibold text-gray-900 dark:text-white">
            {meta.total}
          </span>{' '}
          {dict.catalog.filters.results}
        </p>
      )}

      {/* Product grid or loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          message={
            typeFilter === 'cap'
              ? dict.catalog.caps.empty_state
              : dict.catalog.bottles.empty_state
          }
          onClearFilters={handleClearFilters}
        />
      ) : (
        <ApiProductGrid products={products} lang={lang} />
      )}

      {/* Pagination */}
      {showPagination && !loading && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200',
              page <= 1
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-transparent cursor-not-allowed'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
            Page{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{page}</span>
            {' '}of{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
          </span>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200',
              page >= totalPages
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-transparent cursor-not-allowed'
                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400'
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
