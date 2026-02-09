'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';
import { useLang } from '@/lib/LangContext';

interface RangeFilterProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}

export default function RangeFilter({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
}: RangeFilterProps) {
  const { dict } = useLang();
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 500);

  useEffect(() => {
    if (
      debouncedValue[0] !== value[0] ||
      debouncedValue[1] !== value[1]
    ) {
      onChange(debouncedValue);
    }
  }, [debouncedValue]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseFloat(e.target.value) || min;
    setLocalValue([Math.min(newMin, localValue[1]), localValue[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseFloat(e.target.value) || max;
    setLocalValue([localValue[0], Math.max(newMax, localValue[0])]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-xl',
            'bg-gray-50 dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'text-gray-900 dark:text-white text-sm',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all'
          )}
          placeholder={`${dict.catalog.filters.min} ${unit}`}
        />

        <span className="text-gray-400">—</span>

        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-xl',
            'bg-gray-50 dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'text-gray-900 dark:text-white text-sm',
            'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all'
          )}
          placeholder={`${dict.catalog.filters.max} ${unit}`}
        />
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Range: {min} - {max} {unit}
      </div>
    </div>
  );
}
