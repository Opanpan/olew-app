import { Suspense } from 'react';
import { getDictionary } from '@/lib/dictionary';
import type { Lang } from '@/lib/dictionary';
import { getProducts, getProductFiltersData } from '@/lib/publicApi';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import CatalogClient from '@/components/catalog/CatalogClient';

interface CapsPageProps {
  params: { lang: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CapsPage({ params, searchParams }: CapsPageProps) {
  const lang = params.lang as Lang;
  const dict = getDictionary(lang);

  const filterData = await getProductFiltersData();
  const capTypeId = filterData?.types.find(t => t.name_en === 'Cap')?.id;

  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const categoryId = typeof searchParams.category_id === 'string' ? searchParams.category_id : '';

  const result = await getProducts({
    limit: 100,
    offset: 0,
    search: search || undefined,
    type_id: capTypeId,
    category_id: categoryId || undefined,
  });

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
      <main className="py-8 md:py-10 px-4 md:px-8">
        <div className="mx-auto max-w-[1440px]">
          <Suspense>
            <CatalogClient
              products={result.data}
              filterData={filterData}
              lang={lang}
              emptyMessage={dict.catalog.caps.empty_state}
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
