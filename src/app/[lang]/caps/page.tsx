'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useLang } from '@/lib/LangContext';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import { capsData } from '@/data/products';
import { filterProducts, sortProducts } from '@/lib/catalogUtils';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogToolbar from '@/components/catalog/CatalogToolbar';
import ProductGrid from '@/components/catalog/ProductGrid';
import EmptyState from '@/components/catalog/EmptyState';
import ActiveFilters from '@/components/catalog/filters/ActiveFilters';

// Lazy load FilterSidebar for better performance
const FilterSidebar = dynamic(
  () => import('@/components/catalog/filters/FilterSidebar'),
  { ssr: true }
);

export default function CapsPage() {
  const { lang, dict } = useLang();
  const { filters, updateFilters, clearFilters, defaultRanges } =
    useCatalogFilters({ products: capsData });

  // Filter and sort products
  const filteredProducts = useMemo(
    () => filterProducts(capsData, filters),
    [filters]
  );

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, filters.sortBy),
    [filteredProducts, filters.sortBy]
  );

  // JSON-LD structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: dict.catalog.caps.title,
    description: dict.catalog.caps.subtitle,
    url: `https://welogroup.com/${lang}/caps`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: dict.nav.home,
          item: `https://welogroup.com/${lang}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: dict.nav.caps,
        },
      ],
    },
    numberOfItems: sortedProducts.length,
  };

  return (
    <>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <CatalogHeader
        badge={dict.catalog.caps.badge}
        title={dict.catalog.caps.title}
        subtitle={dict.catalog.caps.subtitle}
        breadcrumbs={[
          { label: dict.nav.home, href: `/${lang}` },
          { label: dict.nav.caps },
        ]}
      />

      {/* Main Content */}
      <main className="section-padding">
        <div className="container-custom mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Sidebar Filters */}
            <FilterSidebar
              filters={filters}
              updateFilters={updateFilters}
              clearFilters={clearFilters}
              productType="cap"
              defaultRanges={defaultRanges}
            />

            {/* Products Area */}
            <div className="flex-1 min-w-0">
              {/* Active Filters */}
              <ActiveFilters
                filters={filters}
                defaultRanges={defaultRanges}
                onRemoveType={(type) =>
                  updateFilters({
                    types: filters.types.filter((t) => t !== type),
                  })
                }
                onClearAll={clearFilters}
              />

              {/* Toolbar */}
              <CatalogToolbar
                filters={filters}
                updateFilters={updateFilters}
                resultCount={sortedProducts.length}
              />

              {/* Products Grid or Empty State */}
              {sortedProducts.length > 0 ? (
                <ProductGrid products={sortedProducts} />
              ) : (
                <EmptyState
                  message={dict.catalog.caps.empty_state}
                  onClearFilters={clearFilters}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
