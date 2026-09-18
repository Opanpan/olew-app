import type { AttributeDefinition, ProductListItem } from '@/lib/publicApi';

// Catalog facets are derived from the products actually on the page, not the
// global /products/filters payload — that one mixes every family's values, so a
// bottle page would offer cap-only options that always return zero results.

export interface OptionFacet {
  kind: 'options';
  key: string;
  label: string;
  options: string[];
}

export interface RangeFacet {
  kind: 'range';
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
}

export type Facet = OptionFacet | RangeFacet;

export interface ActiveFilters {
  attrs: Record<string, string[]>;
  ranges: Record<string, [number, number]>;
}

// Display order; keys not listed are appended as option facets.
const FACET_ORDER = ['volume', 'material', 'neck_size', 'height', 'diameter', 'weight', 'color'];
// Measured specs that read better as a range — when their units are consistent.
const RANGE_KEYS = new Set(['volume', 'height', 'diameter', 'weight']);
// Logistics data, not something buyers shop by.
const HIDDEN_KEYS = new Set(['qty_per_box']);

const UNIT_ALIASES: Record<string, string> = {
  g: 'g', gr: 'g', gram: 'g', grams: 'g',
  mm: 'mm', cm: 'cm',
  ml: 'ml', mili: 'ml',
};

export interface Measure { num: number; unit: string }

/** "80.50 mm" → 80.5 mm, "13/23 gram" → 13 g, "10" + unit "gr" → 10 g. */
export function parseMeasure(value: string | undefined, fallbackUnit = ''): Measure | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d+(?:\.\d*)?)\s*(.*)$/);
  if (!m) return null;
  const rawUnit = (m[2].match(/^[a-zA-Z]+/)?.[0] ?? fallbackUnit).toLowerCase();
  return { num: parseFloat(m[1]), unit: UNIT_ALIASES[rawUnit] ?? rawUnit };
}

function valueOf(p: ProductListItem, key: string): string | undefined {
  return p.attributes?.[key]?.value?.trim() || undefined;
}

function measureOf(p: ProductListItem, key: string): Measure | null {
  const attr = p.attributes?.[key];
  return parseMeasure(attr?.value, attr?.unit ?? '');
}

function formatKey(key: string): string {
  return key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const byNaturalOrder = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

export function buildFacets(
  products: ProductListItem[],
  attrDefs: AttributeDefinition[],
  lang: string,
): Facet[] {
  const keys = new Set<string>();
  products.forEach((p) => Object.keys(p.attributes ?? {}).forEach((k) => keys.add(k)));

  const ordered = [
    ...FACET_ORDER.filter((k) => keys.has(k)),
    ...Array.from(keys).filter((k) => !FACET_ORDER.includes(k)).sort(),
  ].filter((k) => !HIDDEN_KEYS.has(k));

  const facets: Facet[] = [];
  for (const key of ordered) {
    const withValue = products.filter((p) => valueOf(p, key));
    const distinct = Array.from(new Set(withValue.map((p) => valueOf(p, key)!)));
    // A facet with one value can't narrow anything down.
    if (distinct.length < 2) continue;

    const sample = withValue[0].attributes![key];
    const def = attrDefs.find((d) => d.key === key);
    const label =
      (lang === 'id' ? sample.label_id : sample.label_en) ||
      (def && (lang === 'id' ? def.label_id : def.label_en)) ||
      formatKey(key);

    if (RANGE_KEYS.has(key)) {
      const measures = withValue.map((p) => measureOf(p, key));
      const units = new Set(measures.map((m) => m?.unit).filter(Boolean));
      const nums = measures.map((m) => m?.num);
      if (nums.every((n) => n !== undefined) && units.size <= 1) {
        const min = Math.floor(Math.min(...(nums as number[])));
        const max = Math.ceil(Math.max(...(nums as number[])));
        if (max > min) {
          facets.push({ kind: 'range', key, label, unit: Array.from(units)[0] ?? '', min, max });
          continue;
        }
      }
      // Mixed units ("250 ml" next to "10 gram") — fall through to a checklist.
    }

    facets.push({ kind: 'options', key, label, options: distinct.sort(byNaturalOrder) });
  }
  return facets;
}

/** Whether `p` passes every active filter, optionally ignoring one facet (for counts). */
export function matchesFilters(p: ProductListItem, filters: ActiveFilters, ignoreKey?: string): boolean {
  for (const [key, vals] of Object.entries(filters.attrs)) {
    if (key === ignoreKey || vals.length === 0) continue;
    const v = valueOf(p, key);
    if (!v || !vals.includes(v)) return false;
  }
  for (const [key, [lo, hi]] of Object.entries(filters.ranges)) {
    if (key === ignoreKey) continue;
    const m = measureOf(p, key);
    if (!m || m.num < lo || m.num > hi) return false;
  }
  return true;
}

/** Per-option result counts, computed as if that facet's own selection were cleared. */
export function optionCounts(
  products: ProductListItem[],
  filters: ActiveFilters,
  facet: OptionFacet,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of products) {
    if (!matchesFilters(p, filters, facet.key)) continue;
    const v = valueOf(p, facet.key);
    if (v) counts[v] = (counts[v] ?? 0) + 1;
  }
  return counts;
}
