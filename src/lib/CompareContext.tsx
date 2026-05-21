'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '@/types/catalog';

const MAX_COMPARE = 4;
const STORAGE_KEY = 'olew_compare_list';

interface CompareCtx {
  list: Product[];
  toggle: (p: Product) => boolean; // returns false if max reached
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  canAdd: boolean;
  count: number;
  max: number;
}

const Ctx = createContext<CompareCtx | null>(null);

function readStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Product[]>([]);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setList(readStorage());
  }, []);

  // Sync to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // storage quota exceeded or unavailable — silently ignore
    }
  }, [list]);

  const toggle = (p: Product): boolean => {
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
