'use client';

import { useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Check, Palette } from 'lucide-react';
import { useLang } from '@/lib/LangContext';
import { cn } from '@/lib/utils';
import { colorToHex } from './EnhancedColorPicker';

/** A part's colour: `name` is the preset name, or '' for a custom hex. */
export interface PartColor {
  hex: string;
  name: string;
}

interface ColorFieldProps {
  value: PartColor;
  presets: string[];
  onChange: (value: PartColor) => void;
}

const HEX_RE = /^#([0-9a-f]{3}){1,2}$/i;

// Preset swatches plus an inline custom picker. Changes apply immediately — the
// 3D preview is the feedback, so there's no Apply/Cancel step to learn.
export default function ColorField({ value, presets, onChange }: ColorFieldProps) {
  const { dict } = useLang();
  const d = dict.catalog.product_detail;
  const isCustom = value.name === '';
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hexText, setHexText] = useState(value.hex);

  useEffect(() => { setHexText(value.hex); }, [value.hex]);

  const swatch = 'relative h-8 w-8 shrink-0 rounded-full border border-gray-300 dark:border-gray-600';
  const selectedRing = 'ring-2 ring-primary-600 ring-offset-2 ring-offset-white dark:ring-primary-400 dark:ring-offset-gray-900';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3" role="radiogroup" aria-label={d.part_color}>
        {presets.map((name) => {
          const selected = !isCustom && value.name === name;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={name}
              title={name}
              onClick={() => { onChange({ hex: colorToHex[name] ?? '#ffffff', name }); setPickerOpen(false); }}
              className={cn(swatch, selected && selectedRing)}
              style={{ backgroundColor: colorToHex[name] ?? '#ffffff' }}
            >
              {selected && <Check className="absolute inset-0 m-auto h-4 w-4 text-gray-700" strokeWidth={2.5} aria-hidden />}
            </button>
          );
        })}
        <button
          type="button"
          role="radio"
          aria-checked={isCustom}
          aria-expanded={pickerOpen}
          aria-label={d.custom}
          title={d.custom}
          onClick={() => setPickerOpen((o) => !o)}
          className={cn(swatch, 'flex items-center justify-center', isCustom && selectedRing, !isCustom && 'bg-gray-100 dark:bg-gray-800')}
          style={isCustom ? { backgroundColor: value.hex } : undefined}
        >
          <Palette className={cn('h-4 w-4', isCustom ? 'text-white mix-blend-difference' : 'text-gray-600 dark:text-gray-300')} aria-hidden />
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {isCustom ? `${d.custom} · ${value.hex.toUpperCase()}` : value.name}
        </span>
      </div>

      {pickerOpen && (
        <div className="mt-3 space-y-3 rounded-md border border-gray-200 p-3 dark:border-gray-800">
          <HexColorPicker
            color={value.hex}
            onChange={(hex) => onChange({ hex, name: '' })}
            style={{ width: '100%', height: 150 }}
          />
          <div className="flex items-center gap-2">
            <label className="flex h-9 flex-1 items-center rounded-md border border-gray-300 bg-white pl-2.5 focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600 dark:border-gray-700 dark:bg-gray-900">
              <span className="sr-only">{d.hex_color_code}</span>
              <input
                type="text"
                value={hexText}
                maxLength={7}
                spellCheck={false}
                onChange={(e) => {
                  const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                  setHexText(v);
                  if (HEX_RE.test(v)) onChange({ hex: v, name: '' });
                }}
                className="w-full bg-transparent font-mono text-sm uppercase text-gray-900 focus:outline-none dark:text-gray-100"
              />
            </label>
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="h-9 rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-800 hover:border-gray-500 dark:border-gray-700 dark:text-gray-200"
            >
              {d.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
