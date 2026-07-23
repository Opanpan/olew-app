'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
const MAX_COMPARE = 4;
const STORAGE_KEY = 'olew_compare_list';

// A single attached part (cap / outer pot / inner pot) snapshotted from the
// product detail configurator, with everything the 3D viewer needs to replay it.
export interface CompareLayer {
  role: string;              // 'cap' | 'outer_pot' | 'inner_pot'
  name_en: string;
  name_id: string;
  url?: string;              // validated glb model
  color: string;             // hex
  colorName?: string;        // preset color name, '' when custom
  scale: number;
  positionX: number;
  positionY: number;
  positionZ: number;
}

// Full configuration a customer built on the detail page (base colour + parts),
// captured at add-to-compare time so the Compare page can reproduce it.
export interface CompareConfig {
  baseColor: string;         // hex
  baseColorName?: string;    // preset color name, '' when custom
  layers: CompareLayer[];
}

// Minimal shape stored in compare — compatible with ProductListItem and old Product type
export interface CompareItem {
  id: string;
  name_en: string;
  name_id: string;
  thumbnail?: string;
  slug_en?: string;
  slug_id?: string;
  min_price?: number;
  three_d_file_path?: string;
  config?: CompareConfig;
}

interface CompareCtx {
  list: CompareItem[];
  toggle: (p: CompareItem) => boolean;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  canAdd: boolean;
  count: number;
  max: number;
}

const Ctx = createContext<CompareCtx | null>(null);

function readStorage(): CompareItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CompareItem[]) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<CompareItem[]>([]);

  useEffect(() => { setList(readStorage()); }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { }
  }, [list]);

  const toggle = (p: CompareItem): boolean => {
    if (list.find(x => x.id === p.id)) {
      setList(prev => prev.filter(x => x.id !== p.id));
      return true;
    }
    if (list.length >= MAX_COMPARE) return false;
    setList(prev => [...prev, p]);
    return true;
  };

  const remove = (id: string) => setList(prev => prev.filter(x => x.id !== id));
  const clear = () => setList([]);
  const has = (id: string) => list.some(x => x.id === id);

  return (
    <Ctx.Provider value={{ list, toggle, remove, clear, has, canAdd: list.length < MAX_COMPARE, count: list.length, max: MAX_COMPARE }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
