import { Suspense } from 'react';
import { getDictionary } from '@/lib/dictionary';
import type { Lang } from '@/lib/dictionary';
import { getProducts, getProductFiltersData, getAttributeDefinitions, type ProductListItem } from '@/lib/publicApi';
import { categoriesForFamily } from '@/lib/productTaxonomy';
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

  const bottleCategoryIds = categoriesForFamily(filterData?.categories ?? [], 'bottle').map(c => c.id);

  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const categoryId = typeof searchParams.category_id === 'string' ? searchParams.category_id : '';

  // The API's type_id filter doesn't match admin-created products (only a seed
  // dataset that no longer exists), so the default view fetches every
  // Bottle-family category_id in parallel and merges the results instead.
  let data: ProductListItem[];
  if (categoryId) {
    const result = await getProducts({ limit: 100, offset: 0, search: search || undefined, category_id: categoryId });
    data = result.data;
  } else {
    const results = await Promise.all(
      bottleCategoryIds.map((id) => getProducts({ limit: 100, offset: 0, search: search || undefined, category_id: id }))
    );
    const seen = new Set<string>();
    data = results.flatMap((r) => r.data).filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)));
  }

  // Scope the sidebar's category filter to Bottle-family categories only, so
  // Cap and Pot categories don't bleed into this page.
  const scopedFilterData = filterData
    ? { ...filterData, categories: categoriesForFamily(filterData.categories, 'bottle') }
    : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <CatalogHeader
        badge={dict.catalog.bottles.badge}
        title={dict.catalog.bottles.title}
        subtitle={dict.catalog.bottles.subtitle}
        breadcrumbs={[
          { label: dict.nav.home, href: `/${lang}` },
          { label: dict.nav.products, href: `/${lang}/products` },
          { label: dict.nav.bottles },
        ]}
      />
      <main className="py-8 md:py-10 px-4 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <Suspense>
            <CatalogClient
              products={data}
              filterData={scopedFilterData}
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
