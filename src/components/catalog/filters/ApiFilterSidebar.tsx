'use client';

import { useEffect, useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import type { ProductCategoryBasic } from '@/lib/publicApi';
import type { ActiveFilters, Facet, OptionFacet } from '@/lib/catalogFacets';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';
import RangeInput from './RangeInput';

const VISIBLE_OPTIONS = 6;

export interface ApiFilterSidebarProps {
  facets: Facet[];
  categories: ProductCategoryBasic[];
  categoryId: string;
  filters: ActiveFilters;
  counts: Record<string, Record<string, number>>;
  resultCount: number;
  activeCount: number;
  lang: string;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onCategoryChange: (id: string | null) => void;
  onToggleOption: (key: string, value: string) => void;
  onRangeChange: (key: string, range: [number, number]) => void;
  onClearAll: () => void;
}

function Section({ title, selected, defaultOpen, children }: {
  title: string; selected: number; defaultOpen: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen || selected > 0);
  const bodyId = useId();
  return (
    <section className="border-t border-gray-200 dark:border-gray-800">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-3 py-3.5 text-left text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          <span>
            {title}
            {selected > 0 && <span className="ml-1.5 font-normal text-primary-700 dark:text-primary-300">({selected})</span>}
          </span>
          <ChevronDown className={cn('h-4 w-4 shrink-0 text-gray-500 transition-transform duration-150', open && 'rotate-180')} />
        </button>
      </h3>
      <div id={bodyId} hidden={!open} className="pb-4">
        {children}
      </div>
    </section>
  );
}

function OptionList({ facet, selected, counts, onToggle }: {
  facet: OptionFacet; selected: string[]; counts: Record<string, number>; onToggle: (value: string) => void;
}) {
  const { dict } = useLang();
  const [expanded, setExpanded] = useState(false);
  const overflow = facet.options.length > VISIBLE_OPTIONS + 1;
  const visible = overflow && !expanded ? facet.options.slice(0, VISIBLE_OPTIONS) : facet.options;

  return (
    <div>
      <ul className="space-y-0.5">
        {visible.map((value) => {
          const checked = selected.includes(value);
          const count = counts[value] ?? 0;
          const disabled = count === 0 && !checked;
          return (
            <li key={value}>
              <label className={cn(
                'flex min-h-[36px] items-center gap-3 rounded text-sm',
                disabled ? 'cursor-not-allowed text-gray-400 dark:text-gray-600' : 'cursor-pointer text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              )}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(value)}
                  className="h-4 w-4 shrink-0 rounded border-gray-300 accent-primary-600 dark:accent-primary-400"
                />
                <span className={cn('flex-1 min-w-0 truncate', checked && 'font-medium text-gray-900 dark:text-white')}>{value}</span>
                <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500">{count}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {overflow && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1.5 text-sm text-primary-700 underline-offset-4 hover:underline dark:text-primary-300"
        >
          {expanded ? dict.catalog.filters.show_less : dict.catalog.filters.show_more.replace('{count}', String(facet.options.length))}
        </button>
      )}
    </div>
  );
}

function FilterPanel(props: ApiFilterSidebarProps) {
  const { facets, categories, categoryId, filters, counts, lang, onCategoryChange, onToggleOption, onRangeChange } = props;
  const { dict } = useLang();
  const f = dict.catalog.filters;
  const radioName = useId();

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      {categories.length > 1 && (
        <Section title={f.category} selected={categoryId ? 1 : 0} defaultOpen>
          <ul className="space-y-0.5">
            {[{ id: '', name: f.all }, ...categories.map((c) => ({ id: c.id, name: lang === 'id' ? c.name_id : c.name_en }))].map((c) => (
              <li key={c.id || 'all'}>
                <label className="flex min-h-[36px] cursor-pointer items-center gap-3 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  <input
                    type="radio"
                    name={radioName}
                    checked={categoryId === c.id}
                    onChange={() => onCategoryChange(c.id || null)}
                    className="h-4 w-4 shrink-0 accent-primary-600 dark:accent-primary-400"
                  />
                  <span className={cn(categoryId === c.id && 'font-medium text-gray-900 dark:text-white')}>{c.name}</span>
                </label>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {facets.map((facet, i) =>
        facet.kind === 'options' ? (
          <Section key={facet.key} title={facet.label} selected={filters.attrs[facet.key]?.length ?? 0} defaultOpen={i < 4}>
            <OptionList
              facet={facet}
              selected={filters.attrs[facet.key] ?? []}
              counts={counts[facet.key] ?? {}}
              onToggle={(value) => onToggleOption(facet.key, value)}
            />
          </Section>
        ) : (
          <Section key={facet.key} title={facet.label} selected={filters.ranges[facet.key] ? 1 : 0} defaultOpen={i < 4}>
            <RangeInput
              label={facet.label}
              min={facet.min}
              max={facet.max}
              unit={facet.unit}
              value={filters.ranges[facet.key] ?? [facet.min, facet.max]}
              minLabel={f.min}
              maxLabel={f.max}
              onCommit={(range) => onRangeChange(facet.key, range)}
            />
          </Section>
        )
      )}
    </div>
  );
}

export default function ApiFilterSidebar(props: ApiFilterSidebarProps) {
  const { activeCount, resultCount, mobileOpen, onMobileClose, onClearAll } = props;
  const { dict } = useLang();
  const f = dict.catalog.filters;

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onMobileClose(); };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block lg:w-60 xl:w-64 shrink-0">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <div className="flex items-baseline justify-between pb-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">{f.filters_button}</h2>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-sm text-primary-700 underline-offset-4 hover:underline dark:text-primary-300"
              >
                {f.clear_all}
              </button>
            )}
          </div>
          <FilterPanel {...props} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={f.filters_button}
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-white dark:bg-gray-950"
            >
              <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">{f.filters_button}</h2>
                <button
                  type="button"
                  onClick={onMobileClose}
                  aria-label={f.close}
                  className="-mr-2 flex h-11 w-11 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4">
                <FilterPanel {...props} />
              </div>
              <div className="flex shrink-0 gap-3 border-t border-gray-200 p-4 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClearAll}
                  disabled={activeCount === 0}
                  className="h-11 flex-1 rounded-md border border-gray-300 text-sm font-medium text-gray-800 disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
                >
                  {f.clear_all}
                </button>
                <button
                  type="button"
                  onClick={onMobileClose}
                  className="h-11 flex-[2] rounded-md bg-primary-600 text-sm font-medium text-white hover:bg-primary-700"
                >
                  {f.show_results.replace('{count}', String(resultCount))}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
