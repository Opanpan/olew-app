'use client';

import { useState, useEffect, useCallback } from 'react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  unit: string;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

export default function DualRangeSlider({ min, max, unit, value, onChange }: DualRangeSliderProps) {
  const round = (n: number) => Math.round(n);
  const [local, setLocal] = useState<[number, number]>([round(value[0]), round(value[1])]);

  useEffect(() => { setLocal([round(value[0]), round(value[1])]); }, [value]);

  const safeMax = max === min ? min + 1 : max;
  const pct = (v: number) => ((v - min) / (safeMax - min)) * 100;

  const handleLow = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const hi = round(local[1]);
    const v = Math.min(round(Number(e.target.value)), hi);
    const next: [number, number] = [v, hi];
    setLocal(next);
    onChange(next);
  }, [local, onChange]);

  const handleHigh = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const lo = round(local[0]);
    const v = Math.max(round(Number(e.target.value)), lo);
    const next: [number, number] = [lo, v];
    setLocal(next);
    onChange(next);
  }, [local, onChange]);

  const lowPct = pct(local[0]);
  const highPct = pct(local[1]);

  return (
    <div className="space-y-2.5">
      {/* Min / max labels */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[11px] font-semibold">
          {local[0]} <span className="font-normal opacity-70">{unit}</span>
        </span>
        <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[11px] font-semibold">
          {local[1]} <span className="font-normal opacity-70">{unit}</span>
        </span>
      </div>

      {/* Track */}
      <div className="relative h-4 flex items-center">
        {/* Background track */}
        <div className="absolute w-full h-1 bg-gray-100 dark:bg-gray-700 rounded-full" />
        {/* Active fill */}
        <div
          className="absolute h-1 rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        {/* Low handle */}
        <input
          type="range"
          min={min}
          max={safeMax}
          step={1}
          value={local[0]}
          onChange={handleLow}
          className="absolute w-full appearance-none bg-transparent range-thumb"
          style={{ zIndex: local[0] >= local[1] ? 5 : 3 }}
        />
        {/* High handle */}
        <input
          type="range"
          min={min}
          max={safeMax}
          step={1}
          value={local[1]}
          onChange={handleHigh}
          className="absolute w-full appearance-none bg-transparent range-thumb"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
}
