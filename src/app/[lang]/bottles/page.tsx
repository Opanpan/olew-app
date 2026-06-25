import { Suspense } from 'react';
import { getDictionary } from '@/lib/dictionary';
import type { Lang } from '@/lib/dictionary';
import { getProducts, getProductFiltersData, getAttributeDefinitions } from '@/lib/publicApi';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogClient from '@/components/catalog/CatalogClient';

interface BottlesPageProps {
  params: { lang: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BottlesPage({ params, searchParams }: BottlesPageProps) {
  const lang = params.lang as Lang;
  const dict = getDictionary(lang);

  const [filterData, attrDefsData] = await Promise.all([
    getProductFiltersData(),
    getAttributeDefinitions(),
  ]);

  const bottleTypeId = filterData?.types.find(t => t.name_en === 'Bottle')?.id;

  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const categoryId = typeof searchParams.category_id === 'string' ? searchParams.category_id : '';

  // When a category_id is active, skip type_id — the API does AND filtering,
  // and admin-created products may have a real category UUID that doesn't intersect
  // with the seed type_id, returning 0 results.
  const result = await getProducts({
    limit: 100,
    offset: 0,
    search: search || undefined,
    type_id: categoryId ? undefined : bottleTypeId,
    category_id: categoryId || undefined,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CatalogHeader
        badge={dict.catalog.bottles.badge}
        title={dict.catalog.bottles.title}
        subtitle={dict.catalog.bottles.subtitle}
        breadcrumbs={[
          { label: dict.nav.home, href: `/${lang}` },
          { label: dict.nav.bottles },
        ]}
      />
      <main className="py-8 md:py-10 px-4 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <Suspense>
            <CatalogClient
              products={result.data}
              filterData={filterData}
              attrDefs={attrDefsData?.attributes ?? []}
              lang={lang}
              emptyMessage={dict.catalog.bottles.empty_state}
              searchPlaceholder={dict.catalog.filters.search_placeholder}
              showingLabel={dict.catalog.filters.showing}
              resultsLabel={dict.catalog.filters.results}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
