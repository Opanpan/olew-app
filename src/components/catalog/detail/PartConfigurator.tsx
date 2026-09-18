'use client';

import { useId } from 'react';
import Link from 'next/link';
import { ChevronDown, Loader2, Minus, Plus, Ban } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';
import ImgWithFallback, { PRODUCT_PLACEHOLDER } from '@/components/shared/ImgWithFallback';
import ColorField, { type PartColor } from './ColorField';

export interface PartModel {
  id: string;
  name: string;
  thumb?: string;
}

export interface PartRow {
  key: string;
  label: string;
  /** Candidate models. Omitted for the base product, which isn't swappable. */
  models?: PartModel[];
  selectedModelId?: string | null;
  /** Name shown when there is no model picker (the base product itself). */
  fixedName?: string;
  loading?: boolean;
  viewHref?: string | null;
  color: PartColor;
  /** Current lift; omitted for parts that can't be raised. */
  lift?: number;
}

interface PartConfiguratorProps {
  parts: PartRow[];
  openKey: string | null;
  presets: string[];
  liftMax: number;
  onOpen: (key: string | null) => void;
  onSelectModel: (key: string, id: string | null) => void;
  onColor: (key: string, color: PartColor) => void;
  onLift: (key: string, lift: number) => void;
}

const LIFT_STEP = 0.1;

function Field({ label, children, aside }: { label: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {aside}
      </div>
      {children}
    </div>
  );
}

function HeightControl({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  const { dict } = useLang();
  const d = dict.catalog.product_detail;
  const clamp = (v: number) => Math.round(Math.min(max, Math.max(0, v)) * 100) / 100;
  const pct = Math.round((value / max) * 100);
  const stepButton = 'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-700 hover:border-gray-500 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300';

  return (
    <Field
      label={d.part_height}
      aside={value > 0 && (
        <button type="button" onClick={() => onChange(0)} className="text-sm text-primary-700 underline-offset-4 hover:underline dark:text-primary-300">
          {d.reset}
        </button>
      )}
    >
      <div className="flex items-center gap-3">
        <button type="button" aria-label={d.lower} disabled={value <= 0} onClick={() => onChange(clamp(value - LIFT_STEP))} className={stepButton}>
          <Minus className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={max}
            step={0.01}
            value={value}
            aria-label={d.part_height}
            aria-valuetext={`${pct}%`}
            onChange={(e) => onChange(clamp(parseFloat(e.target.value)))}
            className="w-full accent-primary-600 dark:accent-primary-400"
          />
          <div className="mt-0.5 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{d.height_seated}</span>
            <span className="tabular-nums text-gray-700 dark:text-gray-300">{pct}%</span>
            <span>{d.height_raised}</span>
          </div>
        </div>
        <button type="button" aria-label={d.raise} disabled={value >= max} onClick={() => onChange(clamp(value + LIFT_STEP))} className={stepButton}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </Field>
  );
}

function PartBody({ part, presets, liftMax, onSelectModel, onColor, onLift }: {
  part: PartRow;
} & Pick<PartConfiguratorProps, 'presets' | 'liftMax' | 'onSelectModel' | 'onColor' | 'onLift'>) {
  const { dict } = useLang();
  const d = dict.catalog.product_detail;
  const hasModel = !part.models || !!part.selectedModelId;

  const tile = (selected: boolean) => cn(
    'flex w-20 shrink-0 flex-col items-stretch gap-1.5 rounded-md p-1 text-left',
    selected ? 'ring-2 ring-primary-600 dark:ring-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
  );

  return (
    <div className="space-y-5 px-4 pb-5 pt-1">
      {part.models && (
        <Field
          label={d.part_model}
          aside={part.viewHref && (
            <Link href={part.viewHref} className="text-sm text-primary-700 underline-offset-4 hover:underline dark:text-primary-300">
              {d.view_product}
            </Link>
          )}
        >
          <div className="-m-1 flex gap-2 overflow-x-auto p-1" role="radiogroup" aria-label={d.part_model}>
            {part.models.map((m) => {
              const selected = part.selectedModelId === m.id;
              return (
                <button key={m.id} type="button" role="radio" aria-checked={selected} onClick={() => onSelectModel(part.key, m.id)} className={tile(selected)}>
                  <span className="block aspect-square overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                    <ImgWithFallback src={m.thumb} alt="" fallback={PRODUCT_PLACEHOLDER} className="h-full w-full object-cover" />
                  </span>
                  <span className={cn('line-clamp-2 text-xs leading-snug', selected ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400')}>
                    {m.name}
                  </span>
                </button>
              );
            })}
            <button type="button" role="radio" aria-checked={!part.selectedModelId} onClick={() => onSelectModel(part.key, null)} className={tile(!part.selectedModelId)}>
              <span className="flex aspect-square items-center justify-center rounded border border-dashed border-gray-300 text-gray-400 dark:border-gray-700">
                <Ban className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{d.none}</span>
            </button>
          </div>
        </Field>
      )}

      {hasModel && (
        <Field label={d.part_color}>
          <ColorField value={part.color} presets={presets} onChange={(c) => onColor(part.key, c)} />
        </Field>
      )}

      {hasModel && part.lift !== undefined && (
        <HeightControl value={part.lift} max={liftMax} onChange={(v) => onLift(part.key, v)} />
      )}
    </div>
  );
}

export default function PartConfigurator(props: PartConfiguratorProps) {
  const { parts, openKey, onOpen } = props;
  const { dict } = useLang();
  const d = dict.catalog.product_detail;
  const baseId = useId();

  return (
    <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
      {parts.map((part) => {
        const open = openKey === part.key;
        const selectedName = part.models
          ? part.models.find((m) => m.id === part.selectedModelId)?.name ?? d.none
          : part.fixedName;
        const active = !part.models || !!part.selectedModelId;
        const bodyId = `${baseId}-${part.key}`;
        return (
          <li key={part.key}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={bodyId}
              onClick={() => onOpen(open ? null : part.key)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <span
                aria-hidden
                className={cn('h-5 w-5 shrink-0 rounded-full border', active ? 'border-gray-300 dark:border-gray-600' : 'border-dashed border-gray-300 dark:border-gray-700')}
                style={active ? { backgroundColor: part.color.hex } : undefined}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-gray-900 dark:text-white">{part.label}</span>
                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{selectedName}</span>
              </span>
              {part.loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" aria-hidden />}
              <ChevronDown className={cn('h-4 w-4 shrink-0 text-gray-500 transition-transform duration-150', open && 'rotate-180')} aria-hidden />
            </button>
            <div id={bodyId} hidden={!open}>
              {open && <PartBody part={part} {...props} />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
