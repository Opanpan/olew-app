'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Accessible name for the trigger (the visible label may sit outside the component). */
  label: string;
  align?: 'left' | 'right';
  className?: string;
}

// Styled replacement for a native <select>, following the ARIA listbox pattern:
// Arrow keys move, Enter/Space picks, Escape/Tab close, Home/End jump.
export default function SelectMenu({ value, options, onChange, label, align = 'right', className }: SelectMenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    setActive(selectedIndex);
    listRef.current?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open, selectedIndex]);

  // Deferred so the Enter keypress that picked an option doesn't land on the
  // trigger button and immediately reopen the list.
  const closeAndRefocus = () => {
    setOpen(false);
    setTimeout(() => buttonRef.current?.focus(), 0);
  };

  const choose = (index: number) => {
    closeAndRefocus();
    if (options[index].value !== value) onChange(options[index].value);
  };

  const onListKey = (e: React.KeyboardEvent) => {
    const last = options.length - 1;
    const moves: Record<string, () => number> = {
      ArrowDown: () => Math.min(last, active + 1),
      ArrowUp: () => Math.max(0, active - 1),
      Home: () => 0,
      End: () => last,
    };
    if (moves[e.key]) {
      e.preventDefault();
      setActive(moves[e.key]());
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeAndRefocus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const onButtonKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-label={`${label}: ${selected?.label ?? ''}`}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onButtonKey}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-white pl-3 pr-2.5 text-sm text-gray-900 dark:bg-gray-900 dark:text-gray-100',
          'focus:outline-none focus-visible:border-primary-600 focus-visible:ring-1 focus-visible:ring-primary-600',
          open ? 'border-gray-500 dark:border-gray-500' : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
        )}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-gray-500 transition-transform duration-150', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          tabIndex={-1}
          aria-label={label}
          aria-activedescendant={`${id}-opt-${active}`}
          onKeyDown={onListKey}
          className={cn(
            'absolute z-30 mt-1 min-w-full w-max rounded-md border border-gray-200 bg-white py-1 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.12)] focus:outline-none dark:border-gray-800 dark:bg-gray-900',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {options.map((option, i) => {
            const isSelected = i === selectedIndex;
            return (
              <li
                key={option.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onPointerEnter={() => setActive(i)}
                onClick={() => choose(i)}
                className={cn(
                  'flex h-9 cursor-pointer items-center justify-between gap-6 px-3 text-sm',
                  i === active ? 'bg-gray-100 dark:bg-gray-800' : '',
                  isSelected ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                )}
              >
                {option.label}
                <Check className={cn('h-4 w-4 text-primary-600 dark:text-primary-400', !isSelected && 'invisible')} aria-hidden />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
