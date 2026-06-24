'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { ProductFiltersData } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';
import DualRangeSlider from './DualRangeSlider';

export interface ApiFilterSidebarProps {
  filterData: ProductFiltersData | null;
  lang: string;
  categoryId: string;
  activeAttrs: Record<string, string[]>;
  activeRanges: Record<string, [number, number]>;
  onCategoryChange: (id: string) => void;
  onAttrChange: (key: string, value: string) => void;
  onRangeChange: (key: string, range: [number, number]) => void;
  onClearAll: () => void;
}

// Detect numeric values in an attribute, ignoring non-numeric ones.
// Handles "33.80 mm", "18-410 mm" (takes first number), "300 ml", etc.
function parseNumericAttr(values: string[]): { numeric: true; unit: string; min: number; max: number } | { numeric: false } {
  if (values.length === 0) return { numeric: false };

  const parsed = values.flatMap((v) => {
    const m = v.trim().match(/^([\d.]+)/); // take leading number, ignore rest (e.g. "18-410 mm" → 18)
    const unitM = v.trim().match(/[a-zA-Z]+/);
    return m ? [{ num: parseFloat(m[1]), unit: unitM ? unitM[0] : '' }] : [];
  });

  // Need at least one numeric value and a consistent unit
  if (parsed.length === 0) return { numeric: false };

  const unit = parsed[0].unit;
  const nums = parsed.map((p) => Math.round(p.num));
  const rawMin = Math.min(...nums);
  const rawMax = Math.max(...nums);

  const min = rawMin === rawMax ? 0 : rawMin;
  const max = rawMax;

  return { numeric: true, unit, min, max };
}

function formatKey(key: string): string {
  return key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  bold?: boolean;
}

function Accordion({ title, children, defaultOpen = true, bold = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 py-4">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className={cn(
          'text-sm transition-colors',
          bold
            ? 'font-bold uppercase tracking-wide text-gray-900 dark:text-white'
            : 'font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400'
        )}>
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 ml-2 text-gray-400"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApiFilterSidebar({
  filterData,
  lang,
  categoryId,
  activeAttrs,
  activeRanges,
  onCategoryChange,
  onAttrChange,
  onRangeChange,
  onClearAll,
}: ApiFilterSidebarProps) {
  const { dict } = useLang();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const categories = filterData?.categories ?? [];
  const attributes = filterData?.attributes ?? {};

  // Separate numeric (slider) vs categorical (checkbox) attributes
  const numericKeys: string[] = [];
  const categoricalKeys: string[] = [];
  const numericMeta: Record<string, { unit: string; min: number; max: number }> = {};

  Object.entries(attributes).forEach(([key, values]) => {
    if (values.length === 0) return;
    const result = parseNumericAttr(values);
    if (result.numeric) {
      numericKeys.push(key);
      numericMeta[key] = { unit: result.unit, min: result.min, max: result.max };
    } else {
      categoricalKeys.push(key);
    }
  });

  const hasActiveFilters =
    categoryId !== '' ||
    Object.values(activeAttrs).some((v) => v.length > 0) ||
    Object.entries(activeRanges).some(([k, [lo, hi]]) => {
      const meta = numericMeta[k];
      return meta && (lo !== meta.min || hi !== meta.max);
    });

  const FilterContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white">
            {dict.catalog.filters.title}
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            {dict.catalog.filters.clear_all}
          </button>
        )}
      </div>

      <div>
        {/* Category chips */}
        {categories.length > 0 && (
          <Accordion title="Category" bold defaultOpen>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const name = lang === 'id' ? cat.name_id : cat.name_en;
                const active = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
                      active
                        ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:text-primary-600'
                    )}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </Accordion>
        )}

        {/* Numeric attributes → range sliders grouped under "Body Dimension" */}
        {numericKeys.length > 0 && (
          <Accordion title="Body Dimension" bold defaultOpen>
            <div className="space-y-5">
              {numericKeys.map((key) => {
                const meta = numericMeta[key];
                const current = activeRanges[key] ?? [meta.min, meta.max];
                return (
                  <div key={key}>
                    <p className="text-xs font-bold uppercase tracking-wide text-primary-700 dark:text-primary-400 mb-2">
                      {formatKey(key)}
                    </p>
                    <DualRangeSlider
                      min={meta.min}
                      max={meta.max}
                      unit={meta.unit}
                      value={current}
                      onChange={(range) => onRangeChange(key, range)}
                    />
                  </div>
                );
              })}
            </div>
          </Accordion>
        )}

        {/* Categorical attributes → checkboxes */}
        {categoricalKeys.map((key) => {
          const values = attributes[key];
          const active = activeAttrs[key] ?? [];
          return (
            <Accordion key={key} title={formatKey(key)} bold defaultOpen>
              <div className="space-y-2">
                {values.map((value) => {
                  const checked = active.includes(value);
                  return (
                    <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onAttrChange(key, value)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500/50 focus:ring-2 cursor-pointer transition-all"
                      />
                      <span className={cn(
                        'text-sm transition-colors',
                        checked
                          ? 'text-primary-700 dark:text-primary-300 font-semibold'
                          : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                      )}>
                        {value}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Accordion>
          );
        })}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open filters"
        className="lg:hidden fixed bottom-6 right-4 z-40 btn-primary px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-2 min-h-[52px] text-sm"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="font-semibold">Filters</span>
      </button>

      {/* Desktop */}
      <aside className="hidden lg:block lg:w-72 flex-shrink-0">
        <div className="sticky top-24 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-lg max-h-[calc(100vh-8rem)] overflow-y-auto">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -400 }} animate={{ x: 0 }} exit={{ x: -400 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 overflow-y-auto shadow-2xl"
            >
              <div className="p-6">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
                <FilterContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
