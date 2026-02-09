'use client';

import { createContext, useContext, ReactNode, useMemo } from 'react';
import { Dictionary, getDictionary, Lang } from './dictionary';

interface LangContextType {
  lang: Lang;
  dict: Dictionary;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({
  children,
  lang,
}: {
  children: ReactNode;
  lang: Lang;
}) {
  const value = useMemo(() => {
    const dict = getDictionary(lang);
    return { lang, dict };
  }, [lang]);

  return (
    <LangContext.Provider value={value}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (context === undefined) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return context;
}
