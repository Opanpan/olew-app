'use client';

import { Suspense } from 'react';
import { useLang } from '@/lib/LangContext';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import ApiCatalogPage from '@/components/catalog/ApiCatalogPage';

export default function BottlesPage() {
  const { lang, dict } = useLang();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <CatalogHeader
        badge={dict.catalog.bottles.badge}
        title={dict.catalog.bottles.title}
        subtitle={dict.catalog.bottles.subtitle}
        breadcrumbs={[
          { label: dict.nav.home, href: `/${lang}` },
          { label: dict.nav.bottles },
        ]}
      />

      {/* Main Content */}
      <main className="section-padding">
        <div className="container-custom mx-auto">
          <Suspense>
            <ApiCatalogPage typeFilter="bottle" />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
