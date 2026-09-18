'use client';

import { X } from 'lucide-react';
import type { ProductCategoryBasic } from '@/lib/publicApi';
import type { ActiveFilters, Facet } from '@/lib/catalogFacets';
import { useLang } from '@/lib/LangContext';

interface AppliedFiltersProps {
  facets: Facet[];
  categories: ProductCategoryBasic[];
  categoryId: string;
  filters: ActiveFilters;
  lang: string;
  onCategoryChange: (id: string | null) => void;
  onToggleOption: (key: string, value: string) => void;
  onRangeClear: (key: string) => void;
  onClearAll: () => void;
}

export default function AppliedFilters({
  facets, categories, categoryId, filters, lang,
  onCategoryChange, onToggleOption, onRangeClear, onClearAll,
}: AppliedFiltersProps) {
  const { dict } = useLang();
  const f = dict.catalog.filters;

  const chips: { id: string; label: string; onRemove: () => void }[] = [];

  const category = categories.find((c) => c.id === categoryId);
  if (category) {
    chips.push({
      id: 'category',
      label: lang === 'id' ? category.name_id : category.name_en,
      onRemove: () => onCategoryChange(null),
    });
  }
  for (const facet of facets) {
    if (facet.kind === 'options') {
      for (const value of filters.attrs[facet.key] ?? []) {
        chips.push({ id: `${facet.key}:${value}`, label: `${facet.label}: ${value}`, onRemove: () => onToggleOption(facet.key, value) });
      }
    } else if (filters.ranges[facet.key]) {
      const [lo, hi] = filters.ranges[facet.key];
      chips.push({
        id: facet.key,
        label: `${facet.label}: ${lo}–${hi}${facet.unit ? ` ${facet.unit}` : ''}`,
        onRemove: () => onRangeClear(facet.key),
      });
    }
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          onClick={chip.onRemove}
          aria-label={`${f.remove}: ${chip.label}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-300 bg-white pl-2.5 pr-1.5 text-sm text-gray-800 hover:border-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-500"
        >
          {chip.label}
          <X aria-hidden className="h-3.5 w-3.5 text-gray-500" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="ml-1 text-sm text-primary-700 underline-offset-4 hover:underline dark:text-primary-300"
      >
        {f.clear_all}
      </button>
    </div>
  );
}
