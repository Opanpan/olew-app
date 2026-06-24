'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts, getProductFiltersData, ProductListItem, ProductFiltersData } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import EmptyState from '@/components/catalog/EmptyState';
import ApiProductGrid from '@/components/catalog/ApiProductGrid';
import ApiFilterSidebar from '@/components/catalog/filters/ApiFilterSidebar';

const PAGE_SIZE = 12;

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

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {Array.from({ length: 9 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function CapsCatalog() {
  const { lang, dict } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const categoryId = searchParams.get('category_id') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const sortParam = searchParams.get('sort') ?? 'default';

  const activeAttrs = (() => {
    const result: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('attr_')) {
        result[key.slice(5)] = value.split(',').filter(Boolean);
      }
    });
    return result;
  })();

  const activeRanges = (() => {
    const result: Record<string, [number, number]> = {};
    searchParams.forEach((value, key) => {
      if (key.startsWith('range_')) {
        const parts = value.split(',').map((v) => Math.round(Number(v)));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          result[key.slice(6)] = [parts[0], parts[1]];
        }
      }
    });
    return result;
  })();

  const [allProducts, setAllProducts] = useState<ProductListItem[]>([]);
  const [filterData, setFilterData] = useState<ProductFiltersData | null>(null);
  const [typeId, setTypeId] = useState<string | undefined>(undefined);
  const [typeIdResolved, setTypeIdResolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load filter data and resolve typeId on mount
  useEffect(() => {
    async function loadFilters() {
      const data = await getProductFiltersData();
      setFilterData(data);
      if (data) {
        const t = data.types.find((x) => x.name_en.toLowerCase() === 'cap');
        setTypeId(t?.id);
      }
      setTypeIdResolved(true);
    }
    loadFilters();
  }, []);

  // Fetch products when typeId is resolved and params change
  useEffect(() => {
    if (!typeIdResolved) return;
    async function loadProducts() {
      setLoading(true);
      const result = await getProducts({
        limit: 100,
        offset: 0,
        search: search || undefined,
        type_id: typeId,
        category_id: categoryId || undefined,
      });
      const seen = new Set<string>();
      const unique = result.data.filter((p) => seen.has(p.id) ? false : (seen.add(p.id), true));
      setAllProducts(unique);
      setLoading(false);
    }
    loadProducts();
  }, [typeIdResolved, typeId, search, categoryId]);

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

  const handleCategoryChange = useCallback(
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

  const handleSortChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'default') {
        params.delete('sort');
      } else {
        params.set('sort', value);
      }
      params.delete('page');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleRangeChange = useCallback(
    (key: string, range: [number, number]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(`range_${key}`, range.join(','));
      params.delete('page');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleAttrChange = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const paramKey = `attr_${key}`;
      const current = (params.get(paramKey) ?? '').split(',').filter(Boolean);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length === 0) params.delete(paramKey);
      else params.set(paramKey, next.join(','));
      params.delete('page');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleClearAll = useCallback(() => {
    router.push('?', { scroll: false });
    setSearchInput('');
  }, [router]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPage));
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const attrFilteredProducts = allProducts.filter((p) => {
    const activeEntries = Object.entries(activeAttrs).filter(([, vals]) => vals.length > 0);
    if (activeEntries.length === 0) return true;
    const name = (lang === 'id' ? p.name_id : p.name_en).toLowerCase();
    return activeEntries.every(([, vals]) =>
      vals.some((v) => name.includes(v.toLowerCase()))
    );
  });

  // Sort products client-side
  const sortedProducts = [...attrFilteredProducts].sort((a, b) => {
    const nameA = lang === 'id' ? a.name_id : a.name_en;
    const nameB = lang === 'id' ? b.name_id : b.name_en;
    if (sortParam === 'name_asc') return nameA.localeCompare(nameB);
    if (sortParam === 'name_desc') return nameB.localeCompare(nameA);
    return 0;
  });

  // Paginate client-side
  const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE);
  const pageProducts = sortedProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CatalogHeader
        badge={dict.catalog.caps.badge}
        title={dict.catalog.caps.title}
        subtitle={dict.catalog.caps.subtitle}
        breadcrumbs={[
          { label: dict.nav.home, href: `/${lang}` },
          { label: dict.nav.caps },
        ]}
      />

      <main className="section-padding">
        <div className="container-custom mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* LEFT: Filter sidebar */}
            <ApiFilterSidebar
              filterData={filterData}
              lang={lang}
              categoryId={categoryId}
              activeAttrs={activeAttrs}
              activeRanges={activeRanges}
              onCategoryChange={handleCategoryChange}
              onAttrChange={handleAttrChange}
              onRangeChange={handleRangeChange}
              onClearAll={handleClearAll}
            />

            {/* RIGHT: Results area */}
            <div className="flex-1 min-w-0">
              {/* Search + Sort toolbar */}
              <div className="flex flex-col gap-3 md:gap-4 mb-6">
                {/* Search input */}
                <div className="relative w-full">
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

                {/* Result count + sort */}
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {!loading && (
                      <>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {sortedProducts.length}
                        </span>{' '}
                        {dict.catalog.filters.results}
                      </>
                    )}
                  </p>
                  <select
                    value={sortParam}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm border',
                      'bg-white dark:bg-gray-900',
                      'border-gray-200 dark:border-gray-700',
                      'text-gray-700 dark:text-gray-300',
                      'focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500',
                      'transition-all duration-200 cursor-pointer'
                    )}
                    aria-label="Sort products"
                  >
                    <option value="default">Default</option>
                    <option value="name_asc">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                  </select>
                </div>
              </div>

              {/* Product grid or loading or empty state */}
              {loading ? (
                <SkeletonGrid />
              ) : pageProducts.length === 0 ? (
                <EmptyState
                  message={dict.catalog.caps.empty_state}
                  onClearFilters={handleClearAll}
                />
              ) : (
                <ApiProductGrid products={pageProducts} lang={lang} />
              )}

              {/* Pagination */}
              {totalPages > 1 && !loading && (
                <div className="flex items-center justify-center gap-3 pt-6">
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
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CapsPage() {
  return (
    <Suspense>
      <CapsCatalog />
    </Suspense>
  );
}
