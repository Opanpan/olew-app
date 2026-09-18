'use client';

import { useEffect, useRef, useState } from 'react';

interface RangeInputProps {
  label: string;
  min: number;
  max: number;
  unit: string;
  value: [number, number];
  minLabel: string;
  maxLabel: string;
  onCommit: (value: [number, number]) => void;
}

// Slider + number fields. Dragging only updates local state; the URL is
// written once on release, so a drag doesn't fire a navigation per pixel.
export default function RangeInput({ label, min, max, unit, value, minLabel, maxLabel, onCommit }: RangeInputProps) {
  const [draft, setDraft] = useState<[number, number]>(value);
  const [text, setText] = useState<[string, string]>([String(value[0]), String(value[1])]);
  const dragging = useRef(false);

  useEffect(() => {
    if (dragging.current) return;
    setDraft(value);
    setText([String(value[0]), String(value[1])]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value[0], value[1]]);

  const update = (next: [number, number]) => {
    setDraft(next);
    setText([String(next[0]), String(next[1])]);
  };

  const commit = (next: [number, number] = draft) => {
    dragging.current = false;
    if (next[0] !== value[0] || next[1] !== value[1]) onCommit(next);
  };

  const commitText = () => {
    const clamp = (n: number, fallback: number) => (Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback);
    let lo = clamp(parseFloat(text[0]), min);
    let hi = clamp(parseFloat(text[1]), max);
    if (lo > hi) [lo, hi] = [hi, lo];
    update([lo, hi]);
    commit([lo, hi]);
  };

  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  // When the thumbs meet, the one that can still move must be on top.
  const lowOnTop = draft[0] === draft[1] && draft[0] > min;

  const sliderEvents = {
    onPointerDown: () => { dragging.current = true; },
    onPointerUp: () => commit(),
    onKeyUp: () => commit(),
    onBlur: () => { if (dragging.current) commit(); },
  };

  const field = (i: 0 | 1, fieldLabel: string) => (
    <label className="flex-1 min-w-0">
      <span className="sr-only">{`${label} ${fieldLabel}`}</span>
      <span className="flex items-center h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus-within:border-primary-600 focus-within:ring-1 focus-within:ring-primary-600">
        <input
          type="number"
          inputMode="decimal"
          value={text[i]}
          min={min}
          max={max}
          onChange={(e) => setText(i === 0 ? [e.target.value, text[1]] : [text[0], e.target.value])}
          onBlur={commitText}
          onKeyDown={(e) => { if (e.key === 'Enter') commitText(); }}
          className="w-full min-w-0 bg-transparent pl-2.5 text-sm tabular-nums text-gray-900 dark:text-gray-100 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {unit && <span className="pr-2.5 text-xs text-gray-500 dark:text-gray-400">{unit}</span>}
      </span>
    </label>
  );

  return (
    <div className="space-y-3">
      <div className="relative h-4">
        <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded bg-primary-600 dark:bg-primary-400"
          style={{ left: `${pct(draft[0])}%`, right: `${100 - pct(draft[1])}%` }}
        />
        <input
          type="range"
          aria-label={`${label} ${minLabel}`}
          min={min}
          max={max}
          step={1}
          value={draft[0]}
          onChange={(e) => update([Math.min(Number(e.target.value), draft[1]), draft[1]])}
          {...sliderEvents}
          className="range-thumb absolute inset-0 w-full h-4 appearance-none bg-transparent"
          style={{ zIndex: lowOnTop ? 3 : 2 }}
        />
        <input
          type="range"
          aria-label={`${label} ${maxLabel}`}
          min={min}
          max={max}
          step={1}
          value={draft[1]}
          onChange={(e) => update([draft[0], Math.max(Number(e.target.value), draft[0])])}
          {...sliderEvents}
          className="range-thumb absolute inset-0 w-full h-4 appearance-none bg-transparent"
          style={{ zIndex: lowOnTop ? 2 : 3 }}
        />
      </div>
      <div className="flex items-center gap-2">
        {field(0, minLabel)}
        <span aria-hidden className="text-gray-400">–</span>
        {field(1, maxLabel)}
      </div>
    </div>
  );
}
