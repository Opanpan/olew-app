'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterState, Product } from '@/types/catalog';
import { parseRangeParam, formatRangeParam, getRangeExtents } from '@/lib/catalogUtils';

interface UseCatalogFiltersOptions {
  products: Product[];
}

export function useCatalogFilters({ products }: UseCatalogFiltersOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get default ranges from products
  const defaultRanges = useMemo(() => getRangeExtents(products), [products]);

  // Parse current filter state from URL params
  const filters: FilterState = useMemo(() => {
    const types = searchParams.get('types')?.split(',').filter(Boolean) || [];
    const weightRange = parseRangeParam(
      searchParams.get('weight'),
      defaultRanges.weight
    );
    const widthRange = parseRangeParam(
      searchParams.get('width'),
      defaultRanges.width
    );
    const heightRange = parseRangeParam(
      searchParams.get('height'),
      defaultRanges.height
    );
    const priceRange = parseRangeParam(
      searchParams.get('price'),
      defaultRanges.price
    );
    const searchQuery = searchParams.get('q') || '';
    const sortBy = (searchParams.get('sort') as FilterState['sortBy']) || 'name';

    return {
      types,
      weightRange,
      widthRange,
      heightRange,
      priceRange,
      searchQuery,
      sortBy,
    };
  }, [searchParams, defaultRanges]);

  // Update filters in URL
  const updateFilters = useCallback(
    (newFilters: Partial<FilterState>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update types
      if (newFilters.types !== undefined) {
        if (newFilters.types.length > 0) {
          params.set('types', newFilters.types.join(','));
        } else {
          params.delete('types');
        }
      }

      // Update weight range
      if (newFilters.weightRange !== undefined) {
        const [min, max] = newFilters.weightRange;
        const [defaultMin, defaultMax] = defaultRanges.weight;
        if (min !== defaultMin || max !== defaultMax) {
          params.set('weight', formatRangeParam(newFilters.weightRange));
        } else {
          params.delete('weight');
        }
      }

      // Update width range
      if (newFilters.widthRange !== undefined) {
        const [min, max] = newFilters.widthRange;
        const [defaultMin, defaultMax] = defaultRanges.width;
        if (min !== defaultMin || max !== defaultMax) {
          params.set('width', formatRangeParam(newFilters.widthRange));
        } else {
          params.delete('width');
        }
      }

      // Update height range
      if (newFilters.heightRange !== undefined) {
        const [min, max] = newFilters.heightRange;
        const [defaultMin, defaultMax] = defaultRanges.height;
        if (min !== defaultMin || max !== defaultMax) {
          params.set('height', formatRangeParam(newFilters.heightRange));
        } else {
          params.delete('height');
        }
      }

      // Update price range
      if (newFilters.priceRange !== undefined) {
        const [min, max] = newFilters.priceRange;
        const [defaultMin, defaultMax] = defaultRanges.price;
        if (min !== defaultMin || max !== defaultMax) {
          params.set('price', formatRangeParam(newFilters.priceRange));
        } else {
          params.delete('price');
        }
      }

      // Update search query
      if (newFilters.searchQuery !== undefined) {
        if (newFilters.searchQuery) {
          params.set('q', newFilters.searchQuery);
        } else {
          params.delete('q');
        }
      }

      // Update sort
      if (newFilters.sortBy !== undefined) {
        if (newFilters.sortBy !== 'name') {
          params.set('sort', newFilters.sortBy);
        } else {
          params.delete('sort');
        }
      }

      // Update URL without scrolling
      const newUrl = params.toString() ? `?${params.toString()}` : '';
      router.push(newUrl, { scroll: false });
    },
    [searchParams, router, defaultRanges]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push('', { scroll: false });
  }, [router]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.types.length > 0 ||
      filters.searchQuery !== '' ||
      filters.weightRange[0] !== defaultRanges.weight[0] ||
      filters.weightRange[1] !== defaultRanges.weight[1] ||
      filters.widthRange[0] !== defaultRanges.width[0] ||
      filters.widthRange[1] !== defaultRanges.width[1] ||
      filters.heightRange[0] !== defaultRanges.height[0] ||
      filters.heightRange[1] !== defaultRanges.height[1] ||
      filters.priceRange[0] !== defaultRanges.price[0] ||
      filters.priceRange[1] !== defaultRanges.price[1]
    );
  }, [filters, defaultRanges]);

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    defaultRanges,
  };
}
