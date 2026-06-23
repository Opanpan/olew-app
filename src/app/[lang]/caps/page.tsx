'use client';

import { Suspense } from 'react';
import { useLang } from '@/lib/LangContext';
import CatalogHeader from '@/components/catalog/CatalogHeader';
import ApiCatalogPage from '@/components/catalog/ApiCatalogPage';

export default function CapsPage() {
  const { lang, dict } = useLang();

  return (
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
          <Suspense>
            <ApiCatalogPage typeFilter="cap" />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
