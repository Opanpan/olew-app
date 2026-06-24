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
    <div className="space-y-2">
      {/* Value labels */}
      <div className="flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
        <span>{local[0]}</span>
        <span className="text-gray-400 font-normal text-xs">{unit}</span>
        <span className="mx-1 text-gray-400">–</span>
        <span>{local[1]}</span>
        <span className="text-gray-400 font-normal text-xs">{unit}</span>
      </div>

      {/* Slider track */}
      <div className="relative h-5 flex items-center">
        {/* Background track */}
        <div className="absolute w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
        {/* Active range fill */}
        <div
          className="absolute h-1.5 bg-primary-500 rounded-full"
          style={{ left: `${lowPct}%`, width: `${highPct - lowPct}%` }}
        />
        {/* Low handle — thumb-only pointer events via CSS, z-index rises when pushed to max */}
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
