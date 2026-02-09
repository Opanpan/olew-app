'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="welo-theme"
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
