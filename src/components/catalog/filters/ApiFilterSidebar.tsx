'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, SlidersHorizontal, ChevronDown, Check } from 'lucide-react';
import { ProductFiltersData, AttributeDefinition } from '@/lib/publicApi';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';
import DualRangeSlider from './DualRangeSlider';

export interface ApiFilterSidebarProps {
  filterData: ProductFiltersData | null;
  attrDefs?: AttributeDefinition[];
  lang: string;
  categoryId: string;
  activeAttrs: Record<string, string[]>;
  activeRanges: Record<string, [number, number]>;
  onCategoryChange: (id: string) => void;
  onAttrChange: (key: string, value: string) => void;
  onRangeChange: (key: string, range: [number, number]) => void;
  onClearAll: () => void;
}

function parseNumericAttr(values: string[]): { numeric: true; unit: string; min: number; max: number } | { numeric: false } {
  if (values.length === 0) return { numeric: false };
  const parsed = values.flatMap((v) => {
    const m = v.trim().match(/^([\d.]+)/);
    const unitM = v.trim().match(/[a-zA-Z]+/);
    return m ? [{ num: parseFloat(m[1]), unit: unitM ? unitM[0] : '' }] : [];
  });
  if (parsed.length === 0) return { numeric: false };
  const unit = parsed[0].unit;
  const nums = parsed.map((p) => Math.round(p.num));
  const rawMin = Math.min(...nums);
  const rawMax = Math.max(...nums);
  const min = rawMin === rawMax ? 0 : rawMin;
  return { numeric: true, unit, min, max: rawMax };
}

function formatKey(key: string): string {
  return key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── Custom checkbox ──────────────────────────────────────────────────────────
function CustomCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      className="flex items-center gap-3 w-full group py-1"
    >
      <div className={cn(
        'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all duration-200',
        checked
          ? 'bg-primary-500 border-primary-500'
          : 'border-gray-300 dark:border-gray-600 group-hover:border-primary-400 bg-white dark:bg-gray-800'
      )}>
        {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </div>
      <span className={cn(
        'text-sm transition-colors text-left',
        checked ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'
      )}>
        {label}
      </span>
    </button>
  );
}

// ── Section accordion ────────────────────────────────────────────────────────
function Section({ title, children, defaultOpen = true, badge }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-4 border-b border-gray-100 dark:border-gray-800/60 last:border-0">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {title}
          </span>
          {badge !== undefined && badge > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary-500 text-white text-[9px] font-bold">
              {badge}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
        </motion.div>
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

// ── Main component ───────────────────────────────────────────────────────────
export default function ApiFilterSidebar({
  filterData, attrDefs = [], lang, categoryId,
  activeAttrs, activeRanges,
  onCategoryChange, onAttrChange, onRangeChange, onClearAll,
}: ApiFilterSidebarProps) {
  const { dict } = useLang();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const categories = filterData?.categories ?? [];
  const attributes = filterData?.attributes ?? {};

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

  const activeFilterCount =
    (categoryId !== '' ? 1 : 0) +
    Object.values(activeAttrs).reduce((s, v) => s + v.length, 0) +
    Object.entries(activeRanges).filter(([k, [lo, hi]]) => {
      const meta = numericMeta[k];
      return meta && (lo !== meta.min || hi !== meta.max);
    }).length;

  const hasActive = activeFilterCount > 0;

  const FilterContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white tracking-tight">
            {dict.catalog.filters.title}
          </span>
          {hasActive && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary-500 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </div>
        {hasActive && (
          <button
            onClick={onClearAll}
            className="text-[11px] font-semibold text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {dict.catalog.filters.clear_all}
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="flex-1">
        {/* Category */}
        {categories.length > 0 && (
          <Section title="Category" badge={categoryId ? 1 : 0}>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const name = lang === 'id' ? cat.name_id : cat.name_en;
                const active = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryChange(cat.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-200',
                      active
                        ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400'
                    )}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Numeric → range sliders */}
        {numericKeys.length > 0 && (
          <Section title="Body Dimension" badge={Object.keys(activeRanges).length}>
            <div className="space-y-5">
              {numericKeys.map((key) => {
                const meta = numericMeta[key];
                const current = activeRanges[key] ?? [meta.min, meta.max];
                const def = attrDefs.find(d => d.key === key);
                const label = def ? (lang === 'id' ? def.label_id : def.label_en) : formatKey(key);
                return (
                  <div key={key}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2.5">
                      {label}
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
          </Section>
        )}

        {/* Categorical → custom checkboxes */}
        {categoricalKeys.map((key) => {
          const values = attributes[key];
          const active = activeAttrs[key] ?? [];
          const def = attrDefs.find(d => d.key === key);
          const label = def ? (lang === 'id' ? def.label_id : def.label_en) : formatKey(key);
          return (
            <Section key={key} title={label} badge={active.length}>
              <div className="space-y-0.5">
                {values.map((value) => (
                  <CustomCheckbox
                    key={value}
                    checked={active.includes(value)}
                    onChange={() => onAttrChange(key, value)}
                    label={value}
                  />
                ))}
              </div>
            </Section>
          );
        })}
      </div>
    </div>
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
        {hasActive && (
          <span className="w-5 h-5 rounded-full bg-white text-primary-600 text-[10px] font-bold flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:w-64 flex-shrink-0">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-hide">
          {/* Card */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Blue accent top bar */}
            <div className="h-0.5 bg-gradient-to-r from-primary-500 via-sky-400 to-primary-600" />
            <div className="p-5">
              <FilterContent />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 32, stiffness: 320 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 overflow-y-auto shadow-2xl"
            >
              <div className="h-0.5 bg-gradient-to-r from-primary-500 via-sky-400 to-primary-600" />
              <div className="p-5 pt-4">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
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
